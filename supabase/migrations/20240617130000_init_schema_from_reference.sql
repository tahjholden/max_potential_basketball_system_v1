-- Migration: Initialize schema from user reference (2024-06-17)

-- Table: players
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  position text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text
);

-- Table: coaches
CREATE TABLE IF NOT EXISTS coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  notes text,
  is_admin boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  auth_uid uuid
);

-- Table: pdp
CREATE TABLE IF NOT EXISTS pdp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  content text,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  start_date date,
  end_date date
);

-- Table: observations
CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  content text,
  observation_date date,
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  activity_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text,
  summary text,
  created_at timestamptz DEFAULT now(),
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  observation_id uuid REFERENCES observations(id) ON DELETE SET NULL,
  pdp_id uuid REFERENCES pdp(id) ON DELETE SET NULL
); 