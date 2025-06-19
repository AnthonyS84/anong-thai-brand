import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid authentication')
    }

    // Parse request body
    const { currentPassword, newPassword }: PasswordChangeRequest = await req.json()

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required')
    }

    // Validate password strength
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: strengthValidation.error,
          errorCode: 'WEAK_PASSWORD'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Current password is incorrect',
          errorCode: 'INVALID_CURRENT_PASSWORD'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      
      // Check if it's a password reuse error
      if (updateError.message?.includes('recently used') || 
          updateError.message?.includes('history')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'This password was recently used. Please choose a different password.',
            errorCode: 'PASSWORD_REUSED'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }

      throw updateError
    }

    // Log security event
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'PASSWORD_CHANGED',
        resource_type: 'user_account',
        resource_id: user.id,
        details: { 
          changed_via: 'secure_password_change_function',
          timestamp: new Date().toISOString()
        },
        success: true
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password changed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Password change error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Password change failed',
        errorCode: 'INTERNAL_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Password strength validation function
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be no more than 128 characters' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' }
  }

  // Check for weak patterns
  if (/(.)\1{3,}/.test(password)) {
    return { valid: false, error: 'Password cannot contain more than 3 repeated characters' }
  }

  if (/^(password|123456|qwerty|abc123)/i.test(password)) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password' }
  }

  return { valid: true }
}
