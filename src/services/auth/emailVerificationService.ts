import { supabase } from "@/integrations/supabase/client";

interface EmailVerificationResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  message?: string;
  waitUntil?: string;
}

interface UserEmailStatus {
  isVerified: boolean;
  verificationSentAt?: string;
  attemptCount: number;
  canResend: boolean;
  nextResendTime?: string;
}

class EmailVerificationService {
  /**
   * Checks if a user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_email_verified', {
        p_user_id: userId
      });

      if (error) {
        console.error('📧 EmailVerification: Error checking verification status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('📧 EmailVerification: Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Gets comprehensive email verification status for a user
   */
  async getEmailVerificationStatus(userId: string): Promise<UserEmailStatus> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_verified_at, email_verification_sent_at, email_verification_attempts')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('📧 EmailVerification: Error getting verification status:', error);
        return {
          isVerified: false,
          attemptCount: 0,
          canResend: true
        };
      }

      const isVerified = !!data?.email_verified_at;
      const attemptCount = data?.email_verification_attempts || 0;
      const verificationSentAt = data?.email_verification_sent_at;

      // Check if user can resend verification email
      const { data: resendData } = await supabase.rpc('can_resend_verification_email', {
        p_user_id: userId
      });

      return {
        isVerified,
        verificationSentAt,
        attemptCount,
        canResend: resendData?.can_resend || false,
        nextResendTime: resendData?.wait_until
      };
    } catch (error) {
      console.error('📧 EmailVerification: Error getting email status:', error);
      return {
        isVerified: false,
        attemptCount: 0,
        canResend: true
      };
    }
  }

  /**
   * Resends email verification with rate limiting
   */
  async resendVerificationEmail(email: string): Promise<EmailVerificationResult> {
    try {
      console.log('📧 EmailVerification: Attempting to resend verification email to:', email);

      // Get current user to check rate limiting
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not found. Please sign in again.',
          errorCode: 'USER_NOT_FOUND'
        };
      }

      // Check if user can resend verification email
      const { data: canResendData, error: resendError } = await supabase.rpc('can_resend_verification_email', {
        p_user_id: user.id
      });

      if (resendError) {
        console.error('📧 EmailVerification: Error checking resend eligibility:', resendError);
        throw resendError;
      }

      if (!canResendData?.can_resend) {
        return {
          success: false,
          error: canResendData?.error || 'Cannot resend verification email at this time',
          errorCode: 'RATE_LIMITED',
          waitUntil: canResendData?.wait_until
        };
      }

      // Resend verification email through Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });

      if (error) {
        console.error('📧 EmailVerification: Failed to resend verification email:', error);
        return {
          success: false,
          error: error.message || 'Failed to send verification email',
          errorCode: 'SEND_FAILED'
        };
      }

      // Track the resend attempt
      await this.trackVerificationSent(user.id);

      console.log('✅ EmailVerification: Verification email resent successfully');
      return {
        success: true,
        message: 'Verification email sent successfully'
      };

    } catch (error: any) {
      console.error('📧 EmailVerification: Error resending verification email:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend verification email',
        errorCode: 'RESEND_ERROR'
      };
    }
  }

  /**
   * Tracks when a verification email is sent
   */
  private async trackVerificationSent(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_email_verification_sent', {
        p_user_id: userId
      });

      if (error) {
        console.error('📧 EmailVerification: Error tracking verification sent:', error);
      }
    } catch (error) {
      console.error('📧 EmailVerification: Error tracking verification:', error);
    }
  }

  /**
   * Marks email as verified (called after successful verification)
   */
  async markEmailVerified(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_email_verified', {
        p_user_id: userId
      });

      if (error) {
        console.error('📧 EmailVerification: Error marking email verified:', error);
        throw error;
      }

      console.log('✅ EmailVerification: Email marked as verified for user:', userId);
    } catch (error) {
      console.error('📧 EmailVerification: Error marking email verified:', error);
      throw error;
    }
  }

  /**
   * Verifies email confirmation token
   */
  async verifyEmail(token: string, email: string): Promise<EmailVerificationResult> {
    try {
      console.log('📧 EmailVerification: Verifying email with token');

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'signup'
      });

      if (error) {
        console.error('📧 EmailVerification: Token verification failed:', error);
        return {
          success: false,
          error: error.message || 'Invalid or expired verification token',
          errorCode: 'INVALID_TOKEN'
        };
      }

      if (data.user) {
        // Mark email as verified in our profiles table
        await this.markEmailVerified(data.user.id);
        
        console.log('✅ EmailVerification: Email verified successfully');
        return {
          success: true,
          message: 'Email verified successfully'
        };
      }

      return {
        success: false,
        error: 'Verification failed',
        errorCode: 'VERIFICATION_FAILED'
      };

    } catch (error: any) {
      console.error('📧 EmailVerification: Error verifying email:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed',
        errorCode: 'VERIFY_ERROR'
      };
    }
  }

  /**
   * Checks if email verification is required for the current user
   */
  async requiresEmailVerification(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      // Check if email is confirmed in Supabase auth
      if (!user.email_confirmed_at) return true;

      // Double-check our profiles table
      const isVerified = await this.isEmailVerified(user.id);
      return !isVerified;

    } catch (error) {
      console.error('📧 EmailVerification: Error checking verification requirement:', error);
      return false;
    }
  }

  /**
   * Gets user's email verification info for UI display
   */
  async getVerificationInfo(): Promise<{
    email: string | null;
    isVerified: boolean;
    canResend: boolean;
    nextResendTime?: string;
    attemptCount: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          email: null,
          isVerified: false,
          canResend: false,
          attemptCount: 0
        };
      }

      const status = await this.getEmailVerificationStatus(user.id);
      
      return {
        email: user.email || null,
        isVerified: status.isVerified,
        canResend: status.canResend,
        nextResendTime: status.nextResendTime,
        attemptCount: status.attemptCount
      };

    } catch (error) {
      console.error('📧 EmailVerification: Error getting verification info:', error);
      return {
        email: null,
        isVerified: false,
        canResend: false,
        attemptCount: 0
      };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
export type { EmailVerificationResult, UserEmailStatus };
