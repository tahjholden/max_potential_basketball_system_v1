-- Migration: Update RLS policies for team-based schema (2024-12-20)
-- This migration updates RLS policies to work with the new schema where:
-- - coach_id only exists on teams table
-- - players are accessed through team relationships
-- - coaches access players via teams.coach_id

-- Drop old policies that reference non-existent coach_id fields
DROP POLICY IF EXISTS "Allow insert for matching coach" ON pdp;
DROP POLICY IF EXISTS "Allow coaches to update their own pdps" ON pdp;
DROP POLICY IF EXISTS "Allow coaches to update their own observations" ON observations;

-- Update players table RLS policies
-- Allow coaches to read players from their teams
DROP POLICY IF EXISTS "Allow authenticated users to read players" ON players;
CREATE POLICY "Allow coaches to read their team players"
ON public.players
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to insert players into their teams
DROP POLICY IF EXISTS "Allow authenticated users to insert players" ON players;
CREATE POLICY "Allow coaches to insert players into their teams"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to update players in their teams
CREATE POLICY "Allow coaches to update their team players"
ON public.players
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to delete players from their teams
CREATE POLICY "Allow coaches to delete their team players"
ON public.players
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update observations table RLS policies
-- Allow coaches to read observations for players in their teams
DROP POLICY IF EXISTS "Allow authenticated users to read observations" ON observations;
CREATE POLICY "Allow coaches to read observations for their team players"
ON public.observations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to insert observations for players in their teams
DROP POLICY IF EXISTS "Allow authenticated users to insert observations" ON observations;
CREATE POLICY "Allow coaches to insert observations for their team players"
ON public.observations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to update observations for players in their teams
CREATE POLICY "Allow coaches to update observations for their team players"
ON public.observations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to delete observations for players in their teams
CREATE POLICY "Allow coaches to delete observations for their team players"
ON public.observations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = observations.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update PDP table RLS policies
-- Allow coaches to read PDPs for players in their teams
DROP POLICY IF EXISTS "Allow authenticated users to read all pdps" ON pdp;
CREATE POLICY "Allow coaches to read pdps for their team players"
ON public.pdp
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to insert PDPs for players in their teams
DROP POLICY IF EXISTS "Allow authenticated users to insert pdp" ON pdp;
CREATE POLICY "Allow coaches to insert pdps for their team players"
ON public.pdp
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to update PDPs for players in their teams
DROP POLICY IF EXISTS "Allow authenticated users to update pdp" ON pdp;
CREATE POLICY "Allow coaches to update pdps for their team players"
ON public.pdp
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Allow coaches to delete PDPs for players in their teams
CREATE POLICY "Allow coaches to delete pdps for their team players"
ON public.pdp
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players p
    JOIN teams t ON t.id = p.team_id
    WHERE p.id = pdp.player_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  )
);

-- Update teams table RLS policies
-- Allow coaches to read their own teams
CREATE POLICY "Allow coaches to read their own teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
);

-- Allow coaches to insert teams (they become the coach)
CREATE POLICY "Allow coaches to insert teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
);

-- Allow coaches to update their own teams
CREATE POLICY "Allow coaches to update their own teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
)
WITH CHECK (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
);

-- Allow coaches to delete their own teams
CREATE POLICY "Allow coaches to delete their own teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
);

-- Update activity_log table RLS policies
-- Allow coaches to read activity logs for their team players
DROP POLICY IF EXISTS "Allow authenticated users to read activity_log" ON activity_log;
CREATE POLICY "Allow coaches to read activity logs for their team players"
ON public.activity_log
FOR SELECT
TO authenticated
USING (
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
  OR
  -- For general logs (performed_by should be the coach)
  (performed_by IN (SELECT id FROM coaches WHERE auth_uid = auth.uid()))
);

-- Allow coaches to insert activity logs
DROP POLICY IF EXISTS "Allow authenticated users to insert activity_log" ON activity_log;
CREATE POLICY "Allow coaches to insert activity logs"
ON public.activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  performed_by IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
); 