-- Migration: Fix PDP constraint and add simpler function (2024-12-20)
-- This migration ensures proper constraint handling and provides a fallback function

-- Drop the complex function if it exists
DROP FUNCTION IF EXISTS manage_pdp_and_observations(uuid, text, uuid, date, date);

-- Create a simpler function that handles the basic archive and create
CREATE OR REPLACE FUNCTION archive_and_create_pdp(
  p_player_id uuid,
  p_content text,
  p_coach_id uuid,
  p_start_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive any existing active PDP for this player
  UPDATE pdp 
  SET 
    archived_at = now(),
    end_date = p_start_date,
    updated_at = now()
  WHERE 
    player_id = p_player_id 
    AND archived_at IS NULL;

  -- Insert the new PDP
  INSERT INTO pdp (
    player_id,
    content,
    coach_id,
    start_date,
    end_date,
    archived_at,
    created_at,
    updated_at
  ) VALUES (
    p_player_id,
    p_content,
    p_coach_id,
    p_start_date,
    NULL,
    NULL,
    now(),
    now()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION archive_and_create_pdp(uuid, text, uuid, date) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION archive_and_create_pdp(uuid, text, uuid, date) IS 'Simple function to archive existing PDP and create new one'; 