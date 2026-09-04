/*
  # Drop the signup email trigger

  The on_auth_user_created trigger tried to call the send-signup-emails edge
  function from Postgres via pg_net. It has failed on every sign-up since it
  was created ("operator does not exist: text ->> unknown") because the
  app.settings it reads are not set and its fallback casts a text setting as
  json. The app already calls send-signup-emails directly after sign-up, so a
  working trigger would send every admin notice twice.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
