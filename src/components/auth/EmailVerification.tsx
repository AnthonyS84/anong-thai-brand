import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Mail, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationProps {
  email?: string;
  onVerificationComplete?: () => void;
  className?: string;
}

export function EmailVerification({ 
  email: propEmail, 
  onVerificationComplete,
  className = "" 
}: EmailVerificationProps) {
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    email: string | null;
    isVerified: boolean;
    canResend: boolean;
    nextResendTime?: string;
    attemptCount: number;
  } | null>(null);
  const { toast } = useToast();

  // Load verification status on component mount
  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const status = await authService.getEmailVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationToken.trim()) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the verification code from your email.",
        variant: "destructive",
      });
      return;
    }

    if (!verificationStatus?.email) {
      toast({
        title: "Error",
        description: "No email found for verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyEmail(verificationToken, verificationStatus.email);
      
      if (result.success) {
        toast({
          title: "Email Verified! ✅",
          description: "Your email has been successfully verified.",
        });
        
        // Reload status to reflect changes
        await loadVerificationStatus();
        
        // Call completion callback
        onVerificationComplete?.();
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid or expired verification code.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationStatus?.email) {
      toast({
        title: "Error",
        description: "No email found for resending verification.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const result = await authService.resendVerificationEmail(verificationStatus.email);
      
      if (result.success) {
        toast({
          title: "Verification Email Sent! 📧",
          description: "Please check your email for the new verification code.",
        });
        
        // Reload status to update resend eligibility
        await loadVerificationStatus();
      } else {
        toast({
          title: "Resend Failed",
          description: result.error || "Failed to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Resend Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getNextResendTime = () => {
    if (!verificationStatus?.nextResendTime) return null;
    return new Date(verificationStatus.nextResendTime).toLocaleString();
  };

  if (!verificationStatus) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="ml-2">Loading verification status...</span>
      </div>
    );
  }

  if (verificationStatus.isVerified) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Email verified successfully! Your account is fully activated.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We sent a verification code to{' '}
          <span className="font-semibold">{verificationStatus.email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {verificationStatus.attemptCount > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Verification emails sent: {verificationStatus.attemptCount}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <Button 
          onClick={handleVerifyEmail}
          disabled={isLoading || !verificationToken.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the email?</p>
          
          {verificationStatus.canResend ? (
            <Button
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Please wait before requesting another verification email.
                {verificationStatus.nextResendTime && (
                  <div className="mt-1 text-xs">
                    Next resend available: {getNextResendTime()}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
