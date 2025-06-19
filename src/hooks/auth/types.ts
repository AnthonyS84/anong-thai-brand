
import { User, Session } from '@supabase/supabase-js';
import { AuthUser } from '@/services/authService';
import type { EmailVerificationResult, PasswordValidationResult } from '@/services/authService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ 
    accountCreated: boolean; 
    user?: User | null; 
    session?: Session | null; 
    requiresEmailVerification?: boolean; 
  }>;
  signIn: (email: string, password: string) => Promise<{ mfaRequired?: boolean; }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Omit<AuthUser, 'id' | 'email'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<EmailVerificationResult>;
  verifyEmail: (token: string, email: string) => Promise<EmailVerificationResult>;
  getEmailVerificationStatus: () => Promise<{
    email: string | null;
    isVerified: boolean;
    canResend: boolean;
    nextResendTime?: string;
    attemptCount: number;
  }>;
  requiresEmailVerification: () => Promise<boolean>;
  validatePassword: (password: string) => Promise<PasswordValidationResult>;
  validatePasswordStrength: (password: string) => PasswordValidationResult;
  mfaPending: boolean;
}
