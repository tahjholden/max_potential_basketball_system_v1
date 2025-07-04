-- Enable RLS on the pdp table if it's not already enabled.
-- This is idempotent and won't cause an error if it's already enabled.
ALTER TABLE pdp ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists, to ensure a clean slate for creating it.
-- This makes the migration re-runnable.
DROP POLICY IF EXISTS "Allow insert for matching coach" ON pdp;

-- Create the policy to allow coaches to insert PDPs for their players.
-- The check ensures that the coach_id in the new PDP record
-- corresponds to the currently authenticated user's coach record.
CREATE POLICY "Allow insert for matching coach"
ON pdp
FOR INSERT
WITH CHECK (
  coach_id IN (SELECT id FROM coaches WHERE auth_uid = auth.uid())
); 