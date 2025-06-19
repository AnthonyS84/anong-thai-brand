
import type { User, Session } from '@supabase/supabase-js';
import { authOperationsService, type SignUpData, type SignInData } from './auth/authOperations';
import { sessionManagerService } from './auth/sessionManager';
import { userProfileService, type AuthUser } from './auth/userProfile';
import { emailVerificationService, type EmailVerificationResult, type UserEmailStatus } from './auth/emailVerificationService';
import { passwordHistoryService, type PasswordValidationResult } from './auth/passwordHistoryService';

export type { AuthUser, SignUpData, SignInData, EmailVerificationResult, UserEmailStatus, PasswordValidationResult };

class AuthService {
  // Authentication operations
  async signUp(data: SignUpData) {
    return authOperationsService.signUp(data);
  }

  async signIn(data: SignInData) {
    return authOperationsService.signIn(data);
  }

  async signOut() {
    return authOperationsService.signOut();
  }

  async resetPassword(email: string) {
    return authOperationsService.resetPassword(email);
  }

  // New MFA-protected password change methods
  async initiatePasswordChange(email: string) {
    return authOperationsService.initiatePasswordChange(email);
  }

  async verifyAndChangePassword(code: string, newPassword: string) {
    return authOperationsService.verifyAndChangePassword(code, newPassword);
  }

  async resendPasswordChangeCode() {
    return authOperationsService.resendPasswordChangeCode();
  }

  getPendingPasswordChangeEmail(): string | null {
    return authOperationsService.getPendingPasswordChangeEmail();
  }

  // Session management
  async getCurrentUser(): Promise<User | null> {
    return sessionManagerService.getCurrentUser();
  }

  async getCurrentSession(): Promise<Session | null> {
    return sessionManagerService.getCurrentSession();
  }

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return sessionManagerService.onAuthStateChange(callback);
  }

  // User profile management
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    return userProfileService.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, updates: Partial<Omit<AuthUser, 'id' | 'email'>>) {
    return userProfileService.updateUserProfile(userId, updates);
  }

  // Enhanced password change with history validation
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return authOperationsService.changePassword(currentPassword, newPassword);
  }

  // Email verification methods
  async resendVerificationEmail(email: string): Promise<EmailVerificationResult> {
    return authOperationsService.resendVerificationEmail(email);
  }

  async verifyEmail(token: string, email: string): Promise<EmailVerificationResult> {
    return authOperationsService.verifyEmail(token, email);
  }

  async getEmailVerificationStatus(): Promise<{
    email: string | null;
    isVerified: boolean;
    canResend: boolean;
    nextResendTime?: string;
    attemptCount: number;
  }> {
    return authOperationsService.getEmailVerificationStatus();
  }

  async requiresEmailVerification(): Promise<boolean> {
    return authOperationsService.requiresEmailVerification();
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    return emailVerificationService.isEmailVerified(userId);
  }

  // Password validation methods
  async validatePassword(userId: string, password: string): Promise<PasswordValidationResult> {
    return authOperationsService.validatePassword(userId, password);
  }

  validatePasswordStrength(password: string): PasswordValidationResult {
    return authOperationsService.validatePasswordStrength(password);
  }

  async getPasswordHistoryCount(userId: string): Promise<number> {
    return passwordHistoryService.getPasswordHistoryCount(userId);
  }
}

export const authService = new AuthService();
