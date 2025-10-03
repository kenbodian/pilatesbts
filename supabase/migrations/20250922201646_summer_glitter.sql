/*
  # Create waivers table for Pilates by the Sea

  1. New Tables
    - `waivers`
      - `id` (uuid, primary key) - Unique identifier for each waiver
      - `user_id` (uuid, foreign key) - References auth.users.id
      - `full_name` (text) - User's full legal name
      - `email` (text) - User's email address
      - `phone` (text) - User's phone number
      - `emergency_contact` (text) - Emergency contact name
      - `emergency_phone` (text) - Emergency contact phone
      - `medical_conditions` (text, nullable) - Any medical conditions to note
      - `signed_at` (timestamptz) - When the waiver was signed

  2. Security
    - Enable RLS on `waivers` table
    - Add policy for users to insert their own waiver data
    - Add policy for users to read their own waiver data
*/

CREATE TABLE IF NOT EXISTS waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  emergency_contact text NOT NULL,
  emergency_phone text NOT NULL,
  medical_conditions text,
  signed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own waiver"
  ON waivers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own waiver"
  ON waivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);