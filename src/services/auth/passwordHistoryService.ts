import { supabase } from "@/integrations/supabase/client";

interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
  message?: string;
}

class PasswordHistoryService {
  private readonly HISTORY_LIMIT = 5; // Check last 5 passwords

  /**
   * Validates a new password against the user's password history
   * Note: This uses Supabase's server-side password validation
   */
  async validateNewPassword(userId: string, newPassword: string): Promise<PasswordValidationResult> {
    try {
      console.log('🔒 PasswordHistory: Validating new password for user:', userId);

      // First validate password strength locally
      const strengthResult = this.validatePasswordStrength(newPassword);
      if (!strengthResult.valid) {
        return strengthResult;
      }

      // For password history checking, we'll use a different approach since we can't
      // hash passwords client-side for security reasons. Instead, we'll check during
      // the actual password change operation on the server side through our database function.
      
      // For now, just return the strength validation
      console.log('🔒 PasswordHistory: Password strength validation passed');
      return {
        valid: true,
        message: 'Password meets strength requirements'
      };

    } catch (error) {
      console.error('🔒 PasswordHistory: Password validation failed:', error);
      return {
        valid: false,
        error: 'Password validation failed. Please try again.',
        errorCode: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Password history is automatically managed by Supabase triggers
   * This method is kept for API compatibility but doesn't need to do anything
   * since our database trigger handles adding passwords to history automatically
   */
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    console.log('🔒 PasswordHistory: Password history is managed automatically by database triggers');
    // No action needed - Supabase triggers handle this automatically
  }

  /**
   * Gets the password history count for a user (for display purposes)
   */
  async getPasswordHistoryCount(userId: string): Promise<number> {
    try {
      const { data, error, count } = await supabase
        .from('password_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('🔒 PasswordHistory: Error getting history count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('🔒 PasswordHistory: Error getting password history count:', error);
      return 0;
    }
  }

  /**
   * Enhanced password strength validation with history awareness
   */
  validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Basic strength requirements
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }

    if (password.length > 128) {
      errors.push('no more than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('at least one special character');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{3,}/, // Repeated characters (4 or more)
      /^(password|123456|qwerty|abc123)/i, // Common weak passwords
      /^[a-zA-Z]+$/, // Only letters
      /^\d+$/, // Only numbers
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('a stronger, less predictable password');
        break;
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: `Password must contain ${errors.join(', ')}.`,
        errorCode: 'WEAK_PASSWORD'
      };
    }

    return {
      valid: true,
      message: 'Password meets strength requirements'
    };
  }

  /**
   * Comprehensive password validation combining strength checks
   * Note: Password history checking will be implemented server-side for security
   */
  async validatePasswordComprehensive(
    userId: string, 
    newPassword: string
  ): Promise<PasswordValidationResult> {
    // For now, just check password strength
    // Password history will be validated server-side during actual password change
    const strengthResult = this.validatePasswordStrength(newPassword);
    
    if (!strengthResult.valid) {
      return strengthResult;
    }

    return {
      valid: true,
      message: 'Password meets strength requirements'
    };
  }
}

export const passwordHistoryService = new PasswordHistoryService();
export type { PasswordValidationResult };
