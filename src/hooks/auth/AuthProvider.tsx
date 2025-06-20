
import { createContext } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    session,
    userProfile,
    isLoading,
    mfaPending,
    setUser,
    setSession,
    setUserProfile,
    setMfaPending
  } = useAuthState();

  const {
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
  } = useAuthOperations(user, setUser, setSession, setUserProfile, setMfaPending);

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isLoading,
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
    validatePasswordStrength,
    mfaPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
