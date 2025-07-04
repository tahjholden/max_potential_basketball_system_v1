-- Migration: Fix RLS policies to use team_coaches junction table (2024-12-20)
-- This migration updates RLS policies to properly handle the many-to-many relationship
-- between coaches and teams through the team_coaches junction table

-- Update players table RLS policies to use team_coaches junction table
DROP POLICY IF EXISTS "Allow coaches to read their team players and admins to read all" ON players;
CREATE POLICY "Allow coaches to read their team players and admins to read all"
ON public.players
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all players
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see players from teams they're assigned to
  EXISTS (
    SELECT 1 FROM team_coaches tc
    WHERE tc.team_id = players.team_id
    AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
  OR
  -- Fallback: Allow coaches to see players from teams they own (direct coach_id relationship)
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update observations table RLS policies to use team_coaches junction table
DROP POLICY IF EXISTS "Allow coaches to read observations for their team players and admins to read all" ON observations;
CREATE POLICY "Allow coaches to read observations for their team players and admins to read all"
ON public.observations
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all observations
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see observations for players in teams they're assigned to
  EXISTS (
    SELECT 1 FROM players p
    JOIN team_coaches tc ON tc.team_id = p.team_id
    WHERE p.id = observations.player_id
    AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
  OR
  -- Fallback: Allow coaches to see observations for players in teams they own
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update PDP table RLS policies to use team_coaches junction table
DROP POLICY IF EXISTS "Allow coaches to read pdps for their team players and admins to read all" ON pdp;
CREATE POLICY "Allow coaches to read pdps for their team players and admins to read all"
ON public.pdp
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all PDPs
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see PDPs for players in teams they're assigned to
  EXISTS (
    SELECT 1 FROM players p
    JOIN team_coaches tc ON tc.team_id = p.team_id
    WHERE p.id = pdp.player_id
    AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
  OR
  -- Fallback: Allow coaches to see PDPs for players in teams they own
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update teams table RLS policies to use team_coaches junction table
DROP POLICY IF EXISTS "Allow coaches to read their own teams and admins to read all" ON teams;
CREATE POLICY "Allow coaches to read their own teams and admins to read all"
ON public.teams
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all teams
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see teams they're assigned to
  EXISTS (
    SELECT 1 FROM team_coaches tc
    WHERE tc.team_id = teams.id
    AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
  OR
  -- Fallback: Allow coaches to see teams they own
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
);

-- Update activity_log table RLS policies to use team_coaches junction table
DROP POLICY IF EXISTS "Allow coaches to read activity logs for their team players and admins to read all" ON activity_log;
CREATE POLICY "Allow coaches to read activity logs for their team players and admins to read all"
ON public.activity_log
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all activity logs
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see activity logs for their team players
  (
    -- For observation-related logs
    (observation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM observations obs
      JOIN players p ON p.id = obs.player_id
      JOIN team_coaches tc ON tc.team_id = p.team_id
      WHERE obs.id = activity_log.observation_id
      AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
    ))
    OR
    -- For PDP-related logs
    (pdp_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM pdp
      JOIN players p ON p.id = pdp.player_id
      JOIN team_coaches tc ON tc.team_id = p.team_id
      WHERE pdp.id = activity_log.pdp_id
      AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
    ))
    OR
    -- For general logs (performed_by should be the coach)
    (performed_by IN (SELECT id FROM coaches WHERE auth_uid = auth.uid()))
  )
  OR
  -- Fallback: Allow coaches to see activity logs for players in teams they own
  (
    -- For observation-related logs
    (observation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM observations obs
      JOIN players p ON p.id = obs.player_id
      JOIN teams t ON t.id = p.team_id
      WHERE obs.id = activity_log.observation_id
      AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
    ))
    OR
    -- For PDP-related logs
    (pdp_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM pdp
      JOIN players p ON p.id = pdp.player_id
      JOIN teams t ON t.id = p.team_id
      WHERE pdp.id = activity_log.pdp_id
      AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
    ))
  )
); 