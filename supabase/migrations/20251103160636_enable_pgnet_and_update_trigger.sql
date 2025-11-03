/*
  # Enable pg_net Extension and Update Signup Email Trigger

  1. Purpose
    - Enable pg_net extension for async HTTP requests
    - Update the trigger function to properly call the edge function

  2. Changes
    - Enable pg_net extension if not already enabled
    - Update the handle_new_user_signup function with proper implementation
*/

-- Enable pg_net extension for async HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop and recreate the function with updated implementation
DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  -- Build the edge function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-signup-emails';
  
  -- If URL setting is not available, try to build it from request
  IF function_url IS NULL OR function_url = '/functions/v1/send-signup-emails' THEN
    function_url := 'https://' || current_setting('request.headers', true)::json->>'host' || '/functions/v1/send-signup-emails';
  END IF;

  -- Call edge function asynchronously
  SELECT INTO request_id extensions.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'sub'
    ),
    body := jsonb_build_object(
      'userEmail', NEW.email,
      'userName', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user signup
    RAISE WARNING 'Failed to send signup emails: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();