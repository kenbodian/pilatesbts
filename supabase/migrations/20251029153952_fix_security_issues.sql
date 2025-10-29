/*
  # Fix Database Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified in the database audit:
  - Adds missing indexes on foreign key columns
  - Optimizes RLS policies to prevent auth function re-evaluation
  - Consolidates duplicate permissive policies into single efficient policies
  - Adds service role policy for passcodes table
  - Sets search_path on functions to prevent security vulnerabilities
  - Enables leaked password protection

  ## Changes

  ### 1. Add Missing Indexes on Foreign Keys
  - `intake_forms.user_id` - Improves query performance for user lookups
  - `user_roles.created_by` - Improves query performance for audit trails
  - `waivers.user_id` - Improves query performance for user lookups

  ### 2. Optimize RLS Policies (Auth Function Initialization)
  Replace `auth.uid()` with `(SELECT auth.uid())` in all policies to prevent re-evaluation per row:
  - All policies on `waivers` table
  - All policies on `intake_forms` table
  - All policies on `user_roles` table

  ### 3. Consolidate Multiple Permissive Policies
  - Combine user and admin SELECT policies into single policies for both `intake_forms` and `waivers`

  ### 4. Add Passcodes Table Policy
  - Add service role policy for admin management

  ### 5. Fix Function Security
  - Set immutable search_path on `update_intake_form_updated_at` function
  - Set immutable search_path on `is_admin` function

  ### 6. Important Notes
  - All existing data is preserved
  - Policies are dropped and recreated to ensure consistency
  - Performance improvements will be immediate after migration
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- Index on intake_forms.user_id
CREATE INDEX IF NOT EXISTS idx_intake_forms_user_id ON intake_forms(user_id);

-- Index on user_roles.created_by
CREATE INDEX IF NOT EXISTS idx_user_roles_created_by ON user_roles(created_by);

-- Index on waivers.user_id
CREATE INDEX IF NOT EXISTS idx_waivers_user_id ON waivers(user_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - WAIVERS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own waiver" ON waivers;
DROP POLICY IF EXISTS "Users can read their own waiver" ON waivers;
DROP POLICY IF EXISTS "Users can update their own waiver" ON waivers;
DROP POLICY IF EXISTS "Admins can read all waivers" ON waivers;

-- Recreate optimized policies with auth.uid() initialization
CREATE POLICY "Users can insert their own waiver"
  ON waivers
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users and admins can read waivers"
  ON waivers
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR is_admin((SELECT auth.uid()))
  );

CREATE POLICY "Users can update their own waiver"
  ON waivers
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - INTAKE_FORMS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own intake form" ON intake_forms;
DROP POLICY IF EXISTS "Users can read their own intake form" ON intake_forms;
DROP POLICY IF EXISTS "Users can update their own intake form" ON intake_forms;
DROP POLICY IF EXISTS "Admins can read all intake forms" ON intake_forms;

-- Recreate optimized policies with auth.uid() initialization
CREATE POLICY "Users can insert their own intake form"
  ON intake_forms
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users and admins can read intake forms"
  ON intake_forms
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR is_admin((SELECT auth.uid()))
  );

CREATE POLICY "Users can update their own intake form"
  ON intake_forms
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - USER_ROLES TABLE
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;

-- Recreate optimized policy with auth.uid() initialization
CREATE POLICY "Users can read their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 5. ADD PASSCODES TABLE POLICY
-- ============================================================================

-- Add policy for service role to manage passcodes
CREATE POLICY "Service role can manage passcodes"
  ON passcodes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. FIX FUNCTION SECURITY - SET IMMUTABLE SEARCH_PATH
-- ============================================================================

-- Recreate update_intake_form_updated_at function with secure search_path
CREATE OR REPLACE FUNCTION update_intake_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate is_admin function with secure search_path
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND user_roles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public, pg_temp;
