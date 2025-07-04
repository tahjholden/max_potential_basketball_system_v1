-- Migration: Add superadmin and organization support (2024-12-20)
-- This migration adds the missing columns and updates RLS policies for the three-tier role system:
-- - Superadmin: sees all data across all organizations
-- - Admin: sees all data within their organization
-- - Coach: sees only data for teams they're assigned to within their organization

-- Add missing columns to coaches table
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS is_superadmin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS org_id uuid;

-- Add missing columns to other tables if they don't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS org_id uuid;

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS org_id uuid;

ALTER TABLE observations 
ADD COLUMN IF NOT EXISTS org_id uuid,
ADD COLUMN IF NOT EXISTS pdp_id uuid REFERENCES pdp(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES coaches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES coaches(id) ON DELETE SET NULL;

ALTER TABLE pdp 
ADD COLUMN IF NOT EXISTS org_id uuid,
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE activity_log 
ADD COLUMN IF NOT EXISTS performed_by uuid REFERENCES coaches(id) ON DELETE SET NULL;

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update RLS policies to support the three-tier role system

-- Players table: Superadmin sees all, Admin sees org data, Coach sees team data
DROP POLICY IF EXISTS "Allow coaches to read their team players and admins to read all" ON players;
CREATE POLICY "Allow three-tier access to players"
ON public.players
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all players
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all players in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = players.org_id
  )
  OR
  -- Coach: see players from teams they're assigned to within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN team_coaches tc ON tc.coach_id = c.id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = players.org_id
    AND tc.team_id = players.team_id
  )
  OR
  -- Fallback: Coach sees players from teams they own within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN teams t ON t.coach_id = c.id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = players.org_id
    AND t.id = players.team_id
  )
);

-- Observations table: Superadmin sees all, Admin sees org data, Coach sees team data
DROP POLICY IF EXISTS "Allow coaches to read observations for their team players and admins to read all" ON observations;
CREATE POLICY "Allow three-tier access to observations"
ON public.observations
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all observations
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all observations in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = observations.org_id
  )
  OR
  -- Coach: see observations for players in teams they're assigned to within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN team_coaches tc ON tc.coach_id = c.id
    JOIN players p ON p.team_id = tc.team_id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = observations.org_id
    AND p.id = observations.player_id
  )
  OR
  -- Fallback: Coach sees observations for players in teams they own within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN teams t ON t.coach_id = c.id
    JOIN players p ON p.team_id = t.id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = observations.org_id
    AND p.id = observations.player_id
  )
);

-- PDP table: Superadmin sees all, Admin sees org data, Coach sees team data
DROP POLICY IF EXISTS "Allow coaches to read pdps for their team players and admins to read all" ON pdp;
CREATE POLICY "Allow three-tier access to pdps"
ON public.pdp
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all PDPs
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all PDPs in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = pdp.org_id
  )
  OR
  -- Coach: see PDPs for players in teams they're assigned to within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN team_coaches tc ON tc.coach_id = c.id
    JOIN players p ON p.team_id = tc.team_id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = pdp.org_id
    AND p.id = pdp.player_id
  )
  OR
  -- Fallback: Coach sees PDPs for players in teams they own within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN teams t ON t.coach_id = c.id
    JOIN players p ON p.team_id = t.id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = pdp.org_id
    AND p.id = pdp.player_id
  )
);

-- Teams table: Superadmin sees all, Admin sees org data, Coach sees assigned teams
DROP POLICY IF EXISTS "Allow coaches to read their own teams and admins to read all" ON teams;
CREATE POLICY "Allow three-tier access to teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all teams
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all teams in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = teams.org_id
  )
  OR
  -- Coach: see teams they're assigned to within their org
  EXISTS (
    SELECT 1 FROM coaches c
    JOIN team_coaches tc ON tc.team_id = teams.id
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = teams.org_id
    AND tc.coach_id = c.id
  )
  OR
  -- Fallback: Coach sees teams they own within their org
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = teams.org_id
    AND teams.coach_id = c.id
  )
);

-- Coaches table: Superadmin sees all, Admin sees org coaches, Coach sees org coaches
DROP POLICY IF EXISTS "Allow authenticated users to read coaches" ON coaches;
CREATE POLICY "Allow three-tier access to coaches"
ON public.coaches
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all coaches
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all coaches in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND c.org_id = coaches.org_id
  )
  OR
  -- Coach: see coaches in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = coaches.org_id
  )
);

-- Activity log table: Superadmin sees all, Admin sees org data, Coach sees team data
DROP POLICY IF EXISTS "Allow coaches to read activity logs for their team players and admins to read all" ON activity_log;
CREATE POLICY "Allow three-tier access to activity logs"
ON public.activity_log
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all activity logs
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin: see all activity logs in their organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
    AND (
      -- For observation-related logs
      (observation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM observations obs
        WHERE obs.id = activity_log.observation_id
        AND obs.org_id = c.org_id
      ))
      OR
      -- For PDP-related logs
      (pdp_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM pdp
        WHERE pdp.id = activity_log.pdp_id
        AND pdp.org_id = c.org_id
      ))
      OR
      -- For general logs (performed_by should be in same org)
      (performed_by IN (SELECT id FROM coaches WHERE org_id = c.org_id))
    )
  )
  OR
  -- Coach: see activity logs for their team players within their org
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND (
      -- For observation-related logs
      (observation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM observations obs
        JOIN players p ON p.id = obs.player_id
        JOIN team_coaches tc ON tc.team_id = p.team_id
        WHERE obs.id = activity_log.observation_id
        AND obs.org_id = c.org_id
        AND tc.coach_id = c.id
      ))
      OR
      -- For PDP-related logs
      (pdp_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM pdp
        JOIN players p ON p.id = pdp.player_id
        JOIN team_coaches tc ON tc.team_id = p.team_id
        WHERE pdp.id = activity_log.pdp_id
        AND pdp.org_id = c.org_id
        AND tc.coach_id = c.id
      ))
      OR
      -- For general logs (performed_by should be the coach)
      (performed_by = c.id)
    )
  )
);

-- Organizations table: Superadmin sees all, Admin sees their org, Coach sees their org
CREATE POLICY "Allow three-tier access to organizations"
ON public.orgs
FOR SELECT
TO authenticated
USING (
  -- Superadmin: see all organizations
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_superadmin = true
  )
  OR
  -- Admin and Coach: see their own organization
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.org_id = orgs.id
  )
);

-- Enable RLS on organizations table
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY; 