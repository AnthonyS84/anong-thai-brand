import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { domainValidationService } from './domainValidation';
import { mfaAuthService } from '../mfaAuthService';
import { mfaPasswordChangeService } from '../mfa/mfaPasswordChangeService';
import { WelcomeEmailService } from '../welcomeEmailService';
import { emailVerificationService } from './emailVerificationService';
import { passwordHistoryService, type PasswordValidationResult } from './passwordHistoryService';

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthOperationsService {
  async signUp(data: SignUpData) {
    try {
      console.log('🔐 AuthOperations: Starting sign up process for:', data.email);
      console.log('🔐 AuthOperations: Sign up data:', {
        email: data.email,
        hasPassword: !!data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      // Validate password strength before creating account
      const passwordValidation = passwordHistoryService.validatePasswordStrength(data.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error || 'Password does not meet security requirements');
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        console.error('🔐 AuthOperations: Sign up error:', error);
        throw error;
      }

      console.log('🔐 AuthOperations: Sign up successful, user created:', authData.user?.id);
      console.log('🔐 AuthOperations: Auth data received:', {
        userId: authData.user?.id,
        userEmail: authData.user?.email,
        hasSession: !!authData.session,
        emailConfirmed: !!authData.user?.email_confirmed_at
      });

      // Check if email confirmation is required
      const requiresVerification = !authData.user?.email_confirmed_at;
      
      if (requiresVerification) {
        console.log('📧 AuthOperations: Email verification required for:', data.email);
        
        // Track that verification email was sent (commented out due to missing edge function)
        if (authData.user?.id) {
          try {
            // await supabase.rpc('track_email_verification_sent', {
            //   p_user_id: authData.user.id
            // });
            console.log('📧 AuthOperations: Email verification tracking skipped - edge function not implemented');
          } catch (trackError) {
            console.warn('📧 AuthOperations: Failed to track verification email:', trackError);
          }
        }
      }

      // Send welcome email after successful signup (regardless of verification status)
      if (authData.user && data.firstName) {
        try {
          console.log('👋 AuthOperations: Attempting to send welcome email to:', data.email);
          const customerName = data.firstName + (data.lastName ? ` ${data.lastName}` : '');
          console.log('👋 AuthOperations: Customer name for email:', customerName);
          
          await WelcomeEmailService.sendWelcomeEmail({
            customerName: customerName,
            customerEmail: data.email,
          });
          console.log('✅ AuthOperations: Welcome email sent successfully to:', data.email);
        } catch (emailError: any) {
          console.error('❌ AuthOperations: Failed to send welcome email:', emailError);
          console.error('❌ AuthOperations: Email error details:', {
            message: emailError?.message,
            stack: emailError?.stack,
            email: data.email,
            customerName: data.firstName + (data.lastName ? ` ${data.lastName}` : '')
          });
          // Don't throw here - we don't want to block the signup process if email fails
        }
      } else {
        console.log('⚠️ AuthOperations: Skipping welcome email - missing user or firstName:', {
          hasUser: !!authData.user,
          hasFirstName: !!data.firstName,
          email: data.email
        });
      }

      return {
        user: authData.user,
        session: authData.session,
        requiresEmailVerification: requiresVerification,
      };
    } catch (error) {
      console.error('🔐 AuthOperations: Sign up process failed:', error);
      throw error;
    }
  }

  async signIn({ email, password }: SignInData) {
    if (!domainValidationService.isDomainValid()) {
      throw new Error('Authentication not available on this domain');
    }

    domainValidationService.clearCrossDomainSessions();

    // Always use MFA flow for sign-in
    return mfaAuthService.initiateSignIn({ email, password });
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    domainValidationService.clearDomainKey();
    mfaAuthService.clearMFASession();
    mfaPasswordChangeService.clearSession();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    if (!domainValidationService.isDomainValid()) {
      throw new Error('Authentication not available on this domain');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) throw error;
  }

  // New MFA-protected password change
  async initiatePasswordChange(email: string) {
    if (!domainValidationService.isDomainValid()) {
      throw new Error('Authentication not available on this domain');
    }

    return mfaPasswordChangeService.initiatePasswordChange(email);
  }

  async verifyAndChangePassword(code: string, newPassword: string) {
    return mfaPasswordChangeService.verifyAndChangePassword(code, newPassword);
  }

  async resendPasswordChangeCode() {
    return mfaPasswordChangeService.resendCode();
  }

  getPendingPasswordChangeEmail(): string | null {
    return mfaPasswordChangeService.getPendingEmail();
  }

  // Enhanced password change with history validation
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!domainValidationService.isDomainValid()) {
      throw new Error('Authentication not available on this domain');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Validate new password strength and history
    const validation = await passwordHistoryService.validatePasswordComprehensive(user.id, newPassword);
    if (!validation.valid) {
      throw new Error(validation.error || 'Password validation failed');
    }

    // Update password through Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    // Add password to history (Supabase will trigger our database function)
    console.log('✅ AuthOperations: Password changed successfully');
  }

  // Email verification methods
  async resendVerificationEmail(email: string) {
    return emailVerificationService.resendVerificationEmail(email);
  }

  async verifyEmail(token: string, email: string) {
    return emailVerificationService.verifyEmail(token, email);
  }

  async getEmailVerificationStatus() {
    return emailVerificationService.getVerificationInfo();
  }

  async requiresEmailVerification(): Promise<boolean> {
    return emailVerificationService.requiresEmailVerification();
  }

  // Password validation methods
  async validatePassword(userId: string, password: string): Promise<PasswordValidationResult> {
    return passwordHistoryService.validatePasswordComprehensive(userId, password);
  }

  validatePasswordStrength(password: string): PasswordValidationResult {
    return passwordHistoryService.validatePasswordStrength(password);
  }
}

export const authOperationsService = new AuthOperationsService();
