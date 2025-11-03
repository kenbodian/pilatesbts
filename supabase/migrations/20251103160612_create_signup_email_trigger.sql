/*
  # Create Signup Email Notification Trigger

  1. Purpose
    - Automatically send welcome emails to new users upon registration
    - Notify admin of new user registrations

  2. Changes
    - Create a trigger function that calls the edge function when a user signs up
    - Create a trigger on auth.users table for INSERT operations

  3. Security
    - Function runs with security definer privileges
    - Only triggers on new user creation
*/

-- Create function to call edge function for sending signup emails
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get Supabase URL and service role key from environment
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-signup-emails';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Call edge function asynchronously using pg_net extension
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'userEmail', NEW.email,
        'userName', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
      )
    );

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();