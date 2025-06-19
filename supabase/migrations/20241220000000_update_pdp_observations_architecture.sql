-- Migration: Update PDP + Observations Architecture (2024-12-20)
-- Changes:
-- 1. Add archived_at to observations
-- 2. Ensure pdp_id is a foreign key in observations
-- 3. Do NOT drop archived boolean from pdp
-- 4. Do NOT drop any columns, only add if missing

-- Step 1: Add archived_at column to observations
ALTER TABLE observations ADD COLUMN archived_at timestamptz;

-- Step 2: Add pdp_id column to observations
ALTER TABLE observations ADD COLUMN pdp_id uuid;

-- Step 3: Add foreign key constraint for pdp_id
ALTER TABLE observations ADD CONSTRAINT observations_pdp_id_fkey FOREIGN KEY (pdp_id) REFERENCES pdp(id) ON DELETE SET NULL;

-- Step 4: Create index for archived_at in observations
CREATE INDEX idx_observations_archived_at ON observations(archived_at);

-- Step 5: Create index for pdp_id in observations
CREATE INDEX idx_observations_pdp_id ON observations(pdp_id);

-- Step 6: Create index for archived_at in pdp
CREATE INDEX idx_pdp_archived_at ON pdp(archived_at);

-- Step 7: Add comments for documentation
COMMENT ON COLUMN pdp.archived_at IS 'Timestamp when PDP was archived. NULL means active PDP.';
COMMENT ON COLUMN observations.pdp_id IS 'Reference to the active PDP when observation was created. NULL if no active PDP existed.';
COMMENT ON COLUMN observations.archived_at IS 'Timestamp when observation was archived. NULL means active observation.'; 