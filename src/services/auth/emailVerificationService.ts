import { supabase } from "@/integrations/supabase/client";

interface EmailVerificationResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  message?: string;
  waitUntil?: string;
}

interface UserEmailStatus {
  email: string;
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
      // Check if user has confirmed their email through Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      return !!(user?.email_confirmed_at);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          email: '',
          isVerified: false,
          attemptCount: 0,
          canResend: true
        };
      }

      const isVerified = !!user.email_confirmed_at;
      
      return {
        email: user.email || '',
        isVerified,
        verificationSentAt: user.created_at,
        attemptCount: 0,
        canResend: !isVerified,
        nextResendTime: undefined
      };
    } catch (error) {
      console.error('📧 EmailVerification: Error getting email status:', error);
      return {
        email: '',
        isVerified: false,
        attemptCount: 0,
        canResend: true
      };
    }
  }

  /**
   * Resends the verification email to the user
   */
  async resendVerificationEmail(email: string): Promise<EmailVerificationResult> {
    try {
      // Get current user to verify they exist
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not found. Please sign in again.',
          errorCode: 'USER_NOT_FOUND'
        };
      }

      // Default values for resend check (since edge function is not implemented)
      const canResendData = { can_resend: true, error: null, wait_until: null };

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
        console.error('📧 EmailVerification: Error resending verification:', error);
        
        if (error.message?.includes('rate limit')) {
          return {
            success: false,
            error: 'Please wait before requesting another verification email',
            errorCode: 'RATE_LIMITED'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to resend verification email',
          errorCode: 'RESEND_FAILED'
        };
      }

      // Track that verification email was sent (simplified)
      await this.trackVerificationSent(user.id);

      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error: any) {
      console.error('📧 EmailVerification: Unexpected error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
        errorCode: 'UNEXPECTED_ERROR'
      };
    }
  }

  /**
   * Tracks when a verification email is sent
   */
  private async trackVerificationSent(userId: string): Promise<void> {
    try {
      // Simplified tracking - could be enhanced with edge functions later
      console.log('📧 EmailVerification: Tracking verification email sent for user:', userId);
    } catch (error) {
      console.error('📧 EmailVerification: Error tracking verification email:', error);
    }
  }

  /**
   * Verifies an email using a token
   */
  async verifyEmail(token: string, email: string): Promise<EmailVerificationResult> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
        email: email
      });

      if (error) {
        console.error('📧 EmailVerification: Error verifying email:', error);
        return {
          success: false,
          error: error.message || 'Failed to verify email',
          errorCode: 'VERIFICATION_FAILED'
        };
      }

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error: any) {
      console.error('📧 EmailVerification: Unexpected verification error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during verification',
        errorCode: 'UNEXPECTED_ERROR'
      };
    }
  }

  /**
   * Gets current email verification info
   */
  async getVerificationInfo(): Promise<UserEmailStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          email: '',
          isVerified: false,
          attemptCount: 0,
          canResend: true
        };
      }

      return {
        email: user.email || '',
        isVerified: !!user.email_confirmed_at,
        verificationSentAt: user.created_at,
        attemptCount: 0,
        canResend: !user.email_confirmed_at
      };
    } catch (error) {
      console.error('📧 EmailVerification: Error getting verification info:', error);
      return {
        email: '',
        isVerified: false,
        attemptCount: 0,
        canResend: true
      };
    }
  }

  /**
   * Checks if email verification is required
   */
  async requiresEmailVerification(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!(user && !user.email_confirmed_at);
    } catch (error) {
      console.error('📧 EmailVerification: Error checking if verification required:', error);
      return false;
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
export type { EmailVerificationResult, UserEmailStatus };