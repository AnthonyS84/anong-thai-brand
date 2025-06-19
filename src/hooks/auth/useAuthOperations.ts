
import { authService, type AuthUser } from '@/services/authService';
import { mfaAuthService } from '@/services/mfaAuthService';

export function useAuthOperations(
  user: any,
  setUser: (user: any) => void,
  setSession: (session: any) => void,
  setUserProfile: (profile: any) => void,
  setMfaPending: (pending: boolean) => void
) {
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const result = await authService.signUp({ email, password, firstName, lastName });
      
      // Check if email verification is required
      const requiresVerification = result.requiresEmailVerification;
      
      if (requiresVerification) {
        console.log('📧 Account created - email verification required');
        return { 
          accountCreated: true, 
          user: result.user,
          session: result.session,
          requiresEmailVerification: true
        };
      } else {
        console.log('✅ Account created and verified successfully');
        return { 
          accountCreated: true, 
          user: result.user,
          session: result.session,
          requiresEmailVerification: false
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting sign in process with MFA enforcement');
      
      mfaAuthService.clearMFASession();
      
      console.log('🔒 Initiating MFA signin (required for all users)');
      const mfaResult = await mfaAuthService.initiateSignIn({ email, password });
      
      console.log('🎯 MFA signin result:', mfaResult);
      
      if (mfaResult.mfaRequired) {
        console.log('✅ MFA flow initiated successfully');
        return { mfaRequired: true };
      }
      
      console.error('❌ Unexpected: MFA not required when it should be');
      throw new Error('Authentication system error - MFA expected');
      
    } catch (error) {
      console.error('❌ Sign in error:', error);
      mfaAuthService.clearMFASession();
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🔄 Auth: Starting logout process');
    
    // Always clear local state first, regardless of Supabase session validity
    console.log('🧹 Auth: Clearing local state immediately');
    mfaAuthService.clearMFASession();
    setMfaPending(false);
    setUser(null);
    setSession(null);
    setUserProfile(null);
    
    // Check if we have a valid session before attempting Supabase logout
    try {
      console.log('🔍 Auth: Checking current session validity');
      const currentSession = await authService.getCurrentSession();
      
      if (currentSession) {
        console.log('🔄 Auth: Valid session found, attempting Supabase logout');
        await authService.signOut();
        console.log('✅ Auth: Supabase logout successful');
      } else {
        console.log('ℹ️ Auth: No valid session found, skipping Supabase logout');
      }
      
    } catch (error: any) {
      console.log('ℹ️ Auth: Supabase logout failed (expected for invalid sessions):', error?.message);
      // Don't throw - the user is effectively logged out locally
    }
    
    console.log('✅ Auth: Logout process completed');
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Omit<AuthUser, 'id' | 'email'>>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await authService.updateUserProfile(user.id, updates);
      const updatedProfile = await authService.getUserProfile(user.id);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Enhanced password change with history validation
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // Email verification methods
  const resendVerificationEmail = async (email: string) => {
    try {
      return await authService.resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string, email: string) => {
    try {
      return await authService.verifyEmail(token, email);
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const getEmailVerificationStatus = async () => {
    try {
      return await authService.getEmailVerificationStatus();
    } catch (error) {
      console.error('Get verification status error:', error);
      throw error;
    }
  };

  const requiresEmailVerification = async () => {
    try {
      return await authService.requiresEmailVerification();
    } catch (error) {
      console.error('Check verification requirement error:', error);
      return false;
    }
  };

  // Password validation methods
  const validatePassword = async (password: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      return await authService.validatePassword(user.id, password);
    } catch (error) {
      console.error('Password validation error:', error);
      throw error;
    }
  };

  const validatePasswordStrength = (password: string) => {
    return authService.validatePasswordStrength(password);
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    changePassword,
    resendVerificationEmail,
    verifyEmail,
    getEmailVerificationStatus,
    requiresEmailVerification,
    validatePassword,
    validatePasswordStrength
  };
}
