/*
  # Create intake forms table for client health and fitness information

  1. New Tables
    - `intake_forms`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users.id
      - `full_name` (text) - Client's full name
      - `email` (text) - Client's email
      - `phone` (text) - Client's phone number
      - `date_of_birth` (date) - Client's date of birth
      - `occupation` (text) - Client's occupation
      - `emergency_contact_name` (text) - Emergency contact name
      - `emergency_contact_phone` (text) - Emergency contact phone
      - `emergency_contact_relationship` (text) - Relationship to client
      - `physician_name` (text, nullable) - Primary care physician
      - `physician_phone` (text, nullable) - Physician phone number
      - `current_medications` (text, nullable) - List of current medications
      - `previous_injuries` (text, nullable) - Previous injuries or surgeries
      - `current_pain` (text, nullable) - Current pain or discomfort areas
      - `medical_conditions` (text, nullable) - Medical conditions (diabetes, heart disease, etc)
      - `pregnancy_status` (text, nullable) - Pregnancy status if applicable
      - `fitness_level` (text) - Current fitness level (beginner, intermediate, advanced)
      - `exercise_history` (text, nullable) - Previous exercise experience
      - `pilates_experience` (text, nullable) - Previous Pilates experience
      - `fitness_goals` (text) - Primary fitness goals
      - `preferred_schedule` (text, nullable) - Preferred days/times for sessions
      - `how_did_you_hear` (text, nullable) - How they heard about the studio
      - `additional_notes` (text, nullable) - Any additional information
      - `submitted_at` (timestamptz) - When the form was submitted
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `intake_forms` table
    - Users can insert and read their own intake forms
    - Users can update their own intake forms
*/

CREATE TABLE IF NOT EXISTS intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  occupation text NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,
  emergency_contact_relationship text NOT NULL,
  physician_name text,
  physician_phone text,
  current_medications text,
  previous_injuries text,
  current_pain text,
  medical_conditions text,
  pregnancy_status text,
  fitness_level text NOT NULL,
  exercise_history text,
  pilates_experience text,
  fitness_goals text NOT NULL,
  preferred_schedule text,
  how_did_you_hear text,
  additional_notes text,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own intake form"
  ON intake_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own intake form"
  ON intake_forms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own intake form"
  ON intake_forms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_intake_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_intake_forms_updated_at'
  ) THEN
    CREATE TRIGGER update_intake_forms_updated_at
      BEFORE UPDATE ON intake_forms
      FOR EACH ROW
      EXECUTE FUNCTION update_intake_form_updated_at();
  END IF;
END $$;