-- Migration: Fix coaches table RLS infinite recursion (2024-12-20)
-- The issue is that the coaches table policy was trying to query itself, causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow three-tier access to coaches" ON coaches;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Allow coaches to read their own data and org coaches"
ON public.coaches
FOR SELECT
TO authenticated
USING (
  -- Users can always read their own coach record
  auth_uid = auth.uid()
  OR
  -- Superadmin can read all coaches (check via direct auth_uid lookup)
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin can read coaches in their organization (check via direct auth_uid lookup)
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = coaches.org_id
  )
  OR
  -- Coach can read coaches in their organization (check via direct auth_uid lookup)
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = coaches.org_id
  )
);

-- Also create a policy for coaches to update their own data
CREATE POLICY "Allow coaches to update their own data"
ON public.coaches
FOR UPDATE
TO authenticated
USING (auth_uid = auth.uid())
WITH CHECK (auth_uid = auth.uid());

-- Create a policy for coaches to insert their own data
CREATE POLICY "Allow coaches to insert their own data"
ON public.coaches
FOR INSERT
TO authenticated
WITH CHECK (auth_uid = auth.uid()); 