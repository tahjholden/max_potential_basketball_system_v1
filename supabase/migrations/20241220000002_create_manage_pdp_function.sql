-- Migration: Create manage_pdp_and_observations function (2024-12-20)
-- This function handles PDP creation/updates by archiving existing PDPs and creating new ones

-- Drop the function if it exists (to handle any parameter changes)
DROP FUNCTION IF EXISTS manage_pdp_and_observations(uuid, text, uuid, date, date);

CREATE OR REPLACE FUNCTION manage_pdp_and_observations(
  player_id uuid,
  new_content text,
  new_coach_id uuid,
  new_start_date date,
  new_end_date date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_pdp_id uuid;
  new_pdp_id uuid;
BEGIN
  -- Start a transaction
  BEGIN
    -- 1. Archive any existing active PDP for this player
    UPDATE pdp 
    SET 
      archived_at = now(),
      end_date = COALESCE(new_end_date, now()::date),
      updated_at = now()
    WHERE 
      pdp.player_id = manage_pdp_and_observations.player_id 
      AND pdp.archived_at IS NULL
    RETURNING id INTO old_pdp_id;

    -- 2. Re-link observations to the now-archived PDP (if one existed)
    IF old_pdp_id IS NOT NULL THEN
      UPDATE observations 
      SET 
        pdp_id = old_pdp_id,
        updated_at = now()
      WHERE 
        observations.player_id = manage_pdp_and_observations.player_id 
        AND observations.pdp_id IS NULL;
    END IF;

    -- 3. Insert the new PDP as the sole active record
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
      manage_pdp_and_observations.player_id,
      new_content,
      new_coach_id,
      new_start_date,
      new_end_date,
      NULL, -- Active PDP
      now(),
      now()
    ) RETURNING id INTO new_pdp_id;

    -- 4. Link any unlinked observations to the new PDP
    UPDATE observations 
    SET 
      pdp_id = new_pdp_id,
      updated_at = now()
    WHERE 
      observations.player_id = manage_pdp_and_observations.player_id 
      AND observations.pdp_id IS NULL;

    -- Commit the transaction
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on any error
      ROLLBACK;
      RAISE;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION manage_pdp_and_observations(uuid, text, uuid, date, date) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION manage_pdp_and_observations(uuid, text, uuid, date, date) IS 'Manages PDP creation/updates by archiving existing PDPs, re-linking observations, and creating new active PDPs'; 