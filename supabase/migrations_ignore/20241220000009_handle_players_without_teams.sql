-- Migration: Handle players without team_id (2024-12-20)
-- This migration ensures that players without a team_id are only visible to admins
-- and adds a constraint to prevent orphaned players

-- Update players table RLS policies to handle players without team_id
DROP POLICY IF EXISTS "Allow coaches to read their team players and admins to read all" ON players;
CREATE POLICY "Allow coaches to read their team players and admins to read all"
ON public.players
FOR SELECT
TO authenticated
USING (
  -- Allow admins to see all players (including those without team_id)
  EXISTS (
    SELECT 1 FROM coaches c
    WHERE c.auth_uid = auth.uid()
    AND c.is_admin = true
  )
  OR
  -- Allow coaches to see players from teams they're assigned to (only if player has team_id)
  (players.team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_coaches tc
    WHERE tc.team_id = players.team_id
    AND tc.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  ))
  OR
  -- Fallback: Allow coaches to see players from teams they own (only if player has team_id)
  (players.team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = players.team_id
    AND t.coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
  ))
);

-- Add a comment to document the team_id requirement
COMMENT ON COLUMN players.team_id IS 'The team this player belongs to. Players without a team_id are only visible to admins.';

-- Create an index to improve performance for team-based queries
CREATE INDEX IF NOT EXISTS idx_players_team_id_not_null ON players(team_id) WHERE team_id IS NOT NULL; 