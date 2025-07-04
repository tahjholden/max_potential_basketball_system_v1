-- Migration: Create teams table and update players table (2024-12-20)
-- This migration creates the missing teams table and adds team_id to players

-- Step 1: Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Add team_id column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Step 4: Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Step 5: Add comments for documentation
COMMENT ON TABLE teams IS 'Teams that coaches manage';
COMMENT ON COLUMN teams.coach_id IS 'The coach who manages this team';
COMMENT ON COLUMN players.team_id IS 'The team this player belongs to'; 