-- Enhanced Security Features: Email Confirmation and Password History
-- Migration created: 2025-06-19

-- ============================================================================
-- PASSWORD HISTORY TABLE
-- ============================================================================

-- Create password history table to prevent password reuse
CREATE TABLE public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure we can efficiently query by user and date
  CONSTRAINT unique_user_password_combo UNIQUE (user_id, password_hash)
);

-- Enable RLS for password history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own password history (for validation purposes)
CREATE POLICY "Users can view own password history" 
  ON public.password_history 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Only system functions can insert password history
CREATE POLICY "System can manage password history" 
  ON public.password_history 
  FOR ALL 
  TO service_role
  USING (true);

-- Admins can view all password history for security audits
CREATE POLICY "Admins can view all password history" 
  ON public.password_history 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_password_history_user_id ON public.password_history(user_id);
CREATE INDEX idx_password_history_created_at ON public.password_history(created_at);

-- ============================================================================
-- EMAIL VERIFICATION ENHANCEMENT
-- ============================================================================

-- Add email verification tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verification_attempts INTEGER DEFAULT 0;

-- ============================================================================
-- PASSWORD HISTORY FUNCTIONS
-- ============================================================================

-- Function to check if a password was used recently
CREATE OR REPLACE FUNCTION public.check_password_reuse(
  p_user_id UUID,
  p_new_password_hash TEXT,
  p_history_limit INTEGER DEFAULT 5
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  password_exists BOOLEAN := FALSE;
BEGIN
  -- Check if the password hash exists in recent history
  SELECT EXISTS (
    SELECT 1 
    FROM public.password_history 
    WHERE user_id = p_user_id 
    AND password_hash = p_new_password_hash
    ORDER BY created_at DESC 
    LIMIT p_history_limit
  ) INTO password_exists;
  
  RETURN password_exists;
END;
$$;

-- Function to add password to history
CREATE OR REPLACE FUNCTION public.add_password_to_history(
  p_user_id UUID,
  p_password_hash TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new password hash (will be ignored if duplicate due to unique constraint)
  INSERT INTO public.password_history (user_id, password_hash)
  VALUES (p_user_id, p_password_hash)
  ON CONFLICT (user_id, password_hash) DO NOTHING;
  
  -- Keep only the last 10 passwords for each user
  DELETE FROM public.password_history
  WHERE user_id = p_user_id
  AND id NOT IN (
    SELECT id 
    FROM public.password_history 
    WHERE user_id = p_user_id 
    ORDER BY created_at DESC 
    LIMIT 10
  );
END;
$$;

-- Function to validate new password against history
CREATE OR REPLACE FUNCTION public.validate_password_change(
  p_user_id UUID,
  p_new_password_hash TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_reused BOOLEAN;
  result jsonb;
BEGIN
  -- Check if password was used in the last 5 passwords
  SELECT public.check_password_reuse(p_user_id, p_new_password_hash, 5) INTO is_reused;
  
  IF is_reused THEN
    result := jsonb_build_object(
      'valid', false,
      'error', 'Password was recently used. Please choose a different password.',
      'error_code', 'PASSWORD_REUSED'
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'message', 'Password is acceptable'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- ============================================================================
-- EMAIL VERIFICATION FUNCTIONS
-- ============================================================================

-- Function to mark email as verified
CREATE OR REPLACE FUNCTION public.mark_email_verified(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    email_verified_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Function to track email verification attempts
CREATE OR REPLACE FUNCTION public.track_email_verification_sent(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    email_verification_sent_at = NOW(),
    email_verification_attempts = COALESCE(email_verification_attempts, 0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Function to check if user's email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(
  p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_verified BOOLEAN := FALSE;
BEGIN
  SELECT (email_verified_at IS NOT NULL) INTO is_verified
  FROM public.profiles 
  WHERE id = p_user_id;
  
  RETURN COALESCE(is_verified, FALSE);
END;
$$;

-- ============================================================================
-- ENHANCED USER CREATION TRIGGER
-- ============================================================================

-- Update the handle_new_user function to initialize password history
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  encrypted_pw TEXT;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name, email_verification_sent_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE 
      WHEN NEW.email_confirmed_at IS NULL THEN NOW()
      ELSE NULL
    END
  );
  
  -- Add initial password to history if available
  -- Note: This gets the hashed password from Supabase auth
  IF NEW.encrypted_password IS NOT NULL THEN
    INSERT INTO public.password_history (user_id, password_hash)
    VALUES (NEW.id, NEW.encrypted_password)
    ON CONFLICT (user_id, password_hash) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECURITY ENHANCEMENTS FOR EMAIL VERIFICATION
-- ============================================================================

-- Function to resend verification email with rate limiting
CREATE OR REPLACE FUNCTION public.can_resend_verification_email(
  p_user_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_sent TIMESTAMP WITH TIME ZONE;
  attempt_count INTEGER;
  result jsonb;
BEGIN
  SELECT 
    email_verification_sent_at,
    COALESCE(email_verification_attempts, 0)
  INTO last_sent, attempt_count
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Rate limiting: max 3 attempts per hour
  IF attempt_count >= 3 AND last_sent > (NOW() - INTERVAL '1 hour') THEN
    result := jsonb_build_object(
      'can_resend', false,
      'error', 'Too many verification emails sent. Please wait before requesting another.',
      'wait_until', (last_sent + INTERVAL '1 hour')
    );
  -- Rate limiting: wait 2 minutes between attempts
  ELSIF last_sent > (NOW() - INTERVAL '2 minutes') THEN
    result := jsonb_build_object(
      'can_resend', false,
      'error', 'Please wait 2 minutes before requesting another verification email.',
      'wait_until', (last_sent + INTERVAL '2 minutes')
    );
  ELSE
    result := jsonb_build_object(
      'can_resend', true,
      'message', 'Can send verification email'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- ============================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Add indexes for email verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_sent ON public.profiles(email_verification_sent_at);

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old password history (older than 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_password_history()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.password_history
  WHERE created_at < (NOW() - INTERVAL '1 year');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_password_reuse TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_change TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_email_verified TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_resend_verification_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_email_verified TO service_role;
GRANT EXECUTE ON FUNCTION public.track_email_verification_sent TO service_role;
GRANT EXECUTE ON FUNCTION public.add_password_to_history TO service_role;
