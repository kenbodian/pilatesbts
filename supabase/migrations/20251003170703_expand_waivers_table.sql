/*
  # Expand waivers table to include all client information

  1. Schema Changes
    - Add columns to `waivers` table:
      - `date_of_birth` (date) - Client's date of birth
      - `occupation` (text) - Client's occupation
      - `emergency_contact_name` (text) - Emergency contact full name (renaming emergency_contact)
      - `emergency_contact_phone` (text) - Emergency contact phone (renaming emergency_phone)
      - `emergency_contact_relationship` (text) - Relationship to emergency contact
      - `previous_injuries` (text, nullable) - Previous injuries or surgeries
      - `current_pain` (text, nullable) - Current pain or discomfort
      - `pregnancy_status` (text, nullable) - Pregnancy status if applicable
      - `fitness_level` (text) - Current fitness level (beginner/intermediate/advanced)
      - `exercise_history` (text, nullable) - History of exercise activities
      - `pilates_experience` (text, nullable) - Previous Pilates experience
      - `fitness_goals` (text) - Client's fitness goals
      - `preferred_schedule` (text, nullable) - Preferred class schedule
      - `how_did_you_hear` (text, nullable) - How they heard about the studio
      - `additional_notes` (text, nullable) - Any additional notes

  2. Data Migration
    - Rename existing emergency_contact to emergency_contact_name
    - Rename existing emergency_phone to emergency_contact_phone

  3. Security
    - Update RLS policies to allow users to update their own waiver data
    - Maintain existing security policies for insert and select
*/

-- Add new columns to waivers table
DO $$
BEGIN
  -- Add date_of_birth if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE waivers ADD COLUMN date_of_birth date;
  END IF;

  -- Add occupation if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'occupation'
  ) THEN
    ALTER TABLE waivers ADD COLUMN occupation text;
  END IF;

  -- Rename emergency_contact to emergency_contact_name if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'emergency_contact'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'emergency_contact_name'
  ) THEN
    ALTER TABLE waivers RENAME COLUMN emergency_contact TO emergency_contact_name;
  END IF;

  -- Rename emergency_phone to emergency_contact_phone if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'emergency_phone'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'emergency_contact_phone'
  ) THEN
    ALTER TABLE waivers RENAME COLUMN emergency_phone TO emergency_contact_phone;
  END IF;

  -- Add emergency_contact_relationship if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'emergency_contact_relationship'
  ) THEN
    ALTER TABLE waivers ADD COLUMN emergency_contact_relationship text;
  END IF;

  -- Add previous_injuries if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'previous_injuries'
  ) THEN
    ALTER TABLE waivers ADD COLUMN previous_injuries text;
  END IF;

  -- Add current_pain if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'current_pain'
  ) THEN
    ALTER TABLE waivers ADD COLUMN current_pain text;
  END IF;

  -- Add pregnancy_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'pregnancy_status'
  ) THEN
    ALTER TABLE waivers ADD COLUMN pregnancy_status text;
  END IF;

  -- Add fitness_level if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'fitness_level'
  ) THEN
    ALTER TABLE waivers ADD COLUMN fitness_level text;
  END IF;

  -- Add exercise_history if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'exercise_history'
  ) THEN
    ALTER TABLE waivers ADD COLUMN exercise_history text;
  END IF;

  -- Add pilates_experience if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'pilates_experience'
  ) THEN
    ALTER TABLE waivers ADD COLUMN pilates_experience text;
  END IF;

  -- Add fitness_goals if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'fitness_goals'
  ) THEN
    ALTER TABLE waivers ADD COLUMN fitness_goals text;
  END IF;

  -- Add preferred_schedule if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'preferred_schedule'
  ) THEN
    ALTER TABLE waivers ADD COLUMN preferred_schedule text;
  END IF;

  -- Add how_did_you_hear if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'how_did_you_hear'
  ) THEN
    ALTER TABLE waivers ADD COLUMN how_did_you_hear text;
  END IF;

  -- Add additional_notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waivers' AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE waivers ADD COLUMN additional_notes text;
  END IF;
END $$;

-- Add RLS policy for users to update their own waiver data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'waivers' 
    AND policyname = 'Users can update their own waiver'
  ) THEN
    CREATE POLICY "Users can update their own waiver"
      ON waivers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
