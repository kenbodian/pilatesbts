/*
  # Create admin role system

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users.id
      - `role` (text) - Role type (admin, member)
      - `created_at` (timestamptz) - When role was assigned
      - `created_by` (uuid, nullable) - Who assigned the role

  2. Security
    - Enable RLS on `user_roles` table
    - Users can read their own role
    - Only admins can manage roles (via service role)

  3. RLS Policy Updates
    - Add admin policies to intake_forms table for full access
    - Add admin policies to waivers table for full access

  4. Functions
    - Helper function to check if user is admin
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "Users can read their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND user_roles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for intake_forms
CREATE POLICY "Admins can read all intake forms"
  ON intake_forms
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admin policies for waivers
CREATE POLICY "Admins can read all waivers"
  ON waivers
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Note: To assign admin role to a user, use the Supabase dashboard or service role:
-- INSERT INTO user_roles (user_id, role) VALUES ('user-uuid-here', 'admin');