/*
  # Create passcodes table for secure access control

  1. New Tables
    - `passcodes`
      - `id` (uuid, primary key) - Unique identifier
      - `code` (text, unique) - The actual passcode
      - `name` (text) - Descriptive name for the passcode
      - `is_active` (boolean) - Whether the passcode is currently valid
      - `created_at` (timestamptz) - When the passcode was created
      - `expires_at` (timestamptz, nullable) - Optional expiration date

  2. Security
    - Enable RLS on `passcodes` table
    - No public read access (verified only through edge function)
    - Only service role can manage passcodes

  3. Initial Data
    - Insert the current passcode 'oceans25' as active
*/

CREATE TABLE IF NOT EXISTS passcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz
);

ALTER TABLE passcodes ENABLE ROW LEVEL SECURITY;

-- No public policies - passcodes can only be verified through edge function
-- This ensures passcodes are never exposed to the client

-- Insert the default passcode
INSERT INTO passcodes (code, name, is_active)
VALUES ('oceans25', 'Default Member Passcode', true)
ON CONFLICT (code) DO NOTHING;