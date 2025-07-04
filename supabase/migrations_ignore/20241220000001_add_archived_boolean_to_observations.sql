-- Migration: Add archived boolean to observations (2024-12-20)
-- This enables clean boolean-based filtering for archived vs active observations

-- Step 1: Add archived boolean column to observations
ALTER TABLE observations ADD COLUMN archived boolean DEFAULT false;

-- Step 2: Create index for archived boolean in observations
CREATE INDEX idx_observations_archived ON observations(archived);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN observations.archived IS 'Boolean flag indicating if observation is archived. Used for UI filtering.';

-- Step 4: Update existing observations to have archived = false (active)
UPDATE observations SET archived = false WHERE archived IS NULL; 