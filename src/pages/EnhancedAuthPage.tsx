import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailVerification } from '@/components/auth/EmailVerification';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import type { PasswordValidationResult } from '@/services/authService';

export function EnhancedAuthPage() {
  const { user, requiresEmailVerification, changePassword, getEmailVerificationStatus } = useAuth();
  const { toast } = useToast();
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  
  // Email verification state
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    email: string | null;
    isVerified: boolean;
    canResend: boolean;
    nextResendTime?: string;
    attemptCount: number;
  } | null>(null);

  // Check email verification status on component mount
  useEffect(() => {
    if (user) {
      checkEmailVerificationStatus();
    }
  }, [user]);

  const checkEmailVerificationStatus = async () => {
    try {
      const needsVerification = await requiresEmailVerification();
      setNeedsEmailVerification(needsVerification);
      
      const status = await getEmailVerificationStatus();
      setEmailStatus(status);
    } catch (error) {
      console.error('Error checking email verification status:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation?.valid) {
      toast({
        title: "Invalid Password",
        description: "Please fix the password validation errors before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      
      toast({
        title: "Password Changed Successfully! 🔒",
        description: "Your password has been updated with enhanced security validation.",
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordValidation(null);
      
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Handle specific error types
      let errorMessage = "Failed to change password. Please try again.";
      
      if (error.message?.includes('recently used')) {
        errorMessage = "This password was recently used. Please choose a different password.";
      } else if (error.message?.includes('current password')) {
        errorMessage = "Current password is incorrect.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordValidation = (isValid: boolean, result: PasswordValidationResult) => {
    setPasswordValidation(result);
  };

  const handleEmailVerificationComplete = () => {
    setNeedsEmailVerification(false);
    checkEmailVerificationStatus();
    toast({
      title: "Email Verified! ✅",
      description: "Your email has been successfully verified.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-md py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access enhanced security features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">Enhanced Security Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage your account security with our enhanced features including email verification,
          password history validation, and comprehensive security monitoring.
        </p>
      </div>

      {/* Email Verification Alert */}
      {needsEmailVerification && (
        <Alert className="border-amber-200 bg-amber-50">
          <Mail className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Email Verification Required:</strong> Please verify your email address to ensure account security.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="email-verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email-verification" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Verification</span>
          </TabsTrigger>
          <TabsTrigger value="password-security" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Password Security</span>
          </TabsTrigger>
          <TabsTrigger value="security-overview" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security Overview</span>
          </TabsTrigger>
        </TabsList>

        {/* Email Verification Tab */}
        <TabsContent value="email-verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email Verification</span>
              </CardTitle>
              <CardDescription>
                Verify your email address to ensure account security and enable all features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {needsEmailVerification ? (
                <EmailVerification 
                  email={emailStatus?.email || undefined}
                  onVerificationComplete={handleEmailVerificationComplete}
                />
              ) : (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Your email address is verified and secure!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Security Tab */}
        <TabsContent value="password-security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Password Security</span>
              </CardTitle>
              <CardDescription>
                Change your password with enhanced security validation and history checking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <PasswordStrengthIndicator
                      password={newPassword}
                      userId={user.id}
                      showHistoryCheck={true}
                      onValidationChange={handlePasswordValidation}
                      className="mt-3"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Passwords do not match
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isChangingPassword || !passwordValidation?.valid || newPassword !== confirmPassword}
                  className="w-full"
                >
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Overview Tab */}
        <TabsContent value="security-overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Email Address:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verification Status:</span>
                  {needsEmailVerification ? (
                    <span className="text-amber-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                {emailStatus && (
                  <div className="flex items-center justify-between">
                    <span>Verification Attempts:</span>
                    <span className="font-medium">{emailStatus.attemptCount}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Password History:</span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Protected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Strength Requirements:</span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Enforced
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>MFA Enabled:</span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Required
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Email verification required</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Password history validation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Strong password requirements</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Mandatory MFA authentication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Rate limiting protection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Security audit logging</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
