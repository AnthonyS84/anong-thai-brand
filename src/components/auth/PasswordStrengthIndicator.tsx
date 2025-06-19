import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { authService, type PasswordValidationResult } from '@/services/authService';

interface PasswordStrengthIndicatorProps {
  password: string;
  userId?: string; // For checking against password history
  onValidationChange?: (isValid: boolean, result: PasswordValidationResult) => void;
  showHistoryCheck?: boolean;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
  isMet: boolean;
}

export function PasswordStrengthIndicator({
  password,
  userId,
  onValidationChange,
  showHistoryCheck = false,
  className = ""
}: PasswordStrengthIndicatorProps) {
  const [strengthResult, setStrengthResult] = useState<PasswordValidationResult | null>(null);
  const [historyResult, setHistoryResult] = useState<PasswordValidationResult | null>(null);
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);

  const criteria: PasswordCriteria[] = [
    {
      label: "At least 8 characters",
      test: (pwd) => pwd.length >= 8,
      isMet: password.length >= 8
    },
    {
      label: "Contains lowercase letter",
      test: (pwd) => /[a-z]/.test(pwd),
      isMet: /[a-z]/.test(password)
    },
    {
      label: "Contains uppercase letter",
      test: (pwd) => /[A-Z]/.test(pwd),
      isMet: /[A-Z]/.test(password)
    },
    {
      label: "Contains number",
      test: (pwd) => /\d/.test(pwd),
      isMet: /\d/.test(password)
    },
    {
      label: "Contains special character",
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      isMet: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  ];

  const metCriteria = criteria.filter(c => c.isMet).length;
  const strengthPercentage = (metCriteria / criteria.length) * 100;

  const getStrengthLevel = () => {
    if (metCriteria <= 2) return { level: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (metCriteria <= 3) return { level: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-500' };
    if (metCriteria <= 4) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    return { level: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const { level, color, bgColor } = getStrengthLevel();

  // Check password strength
  useEffect(() => {
    if (!password) {
      setStrengthResult(null);
      onValidationChange?.(false, { valid: false, message: 'Password is required' });
      return;
    }

    const result = authService.validatePasswordStrength(password);
    setStrengthResult(result);

    // If no history check needed, use strength result directly
    if (!showHistoryCheck || !userId) {
      onValidationChange?.(result.valid, result);
    }
  }, [password, showHistoryCheck, userId, onValidationChange]);

  // Check password history if enabled
  useEffect(() => {
    if (!showHistoryCheck || !userId || !password || !strengthResult?.valid) {
      setHistoryResult(null);
      return;
    }

    const checkHistory = async () => {
      setIsCheckingHistory(true);
      try {
        const result = await authService.validatePassword(userId, password);
        setHistoryResult(result);
        
        // Combine strength and history results
        const finalResult = result.valid ? strengthResult : result;
        onValidationChange?.(finalResult.valid, finalResult);
      } catch (error) {
        console.error('Error checking password history:', error);
        setHistoryResult({
          valid: false,
          error: 'Could not check password history',
          errorCode: 'HISTORY_CHECK_FAILED'
        });
        onValidationChange?.(false, {
          valid: false,
          error: 'Could not validate password',
          errorCode: 'VALIDATION_ERROR'
        });
      } finally {
        setIsCheckingHistory(false);
      }
    };

    // Debounce the history check
    const timeoutId = setTimeout(checkHistory, 500);
    return () => clearTimeout(timeoutId);
  }, [password, userId, showHistoryCheck, strengthResult, onValidationChange]);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-semibold ${color}`}>{level}</span>
        </div>
        <Progress 
          value={strengthPercentage} 
          className="h-2"
        />
      </div>

      {/* Password Criteria */}
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center space-x-2">
            {criterion.isMet ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-gray-400" />
            )}
            <span className={`text-xs ${criterion.isMet ? 'text-green-600' : 'text-gray-500'}`}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>

      {/* Validation Messages */}
      {strengthResult && !strengthResult.valid && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {strengthResult.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Password History Check */}
      {showHistoryCheck && userId && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Info className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Password History Check</span>
          </div>
          
          {isCheckingHistory && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                Checking against recent passwords...
              </AlertDescription>
            </Alert>
          )}

          {historyResult && !historyResult.valid && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {historyResult.error}
              </AlertDescription>
            </Alert>
          )}

          {historyResult && historyResult.valid && strengthResult?.valid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Password meets all requirements and hasn't been used recently
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Overall Validation Status */}
      {strengthResult?.valid && (!showHistoryCheck || historyResult?.valid) && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Password meets all security requirements
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
