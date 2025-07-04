-- Migration: Add archived_at column to pdp table (2024-12-20)
-- This migration adds the missing archived_at column that the RPC function expects

-- Add archived_at column to pdp table
ALTER TABLE pdp ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN pdp.archived_at IS 'Timestamp when PDP was archived. NULL means active PDP.'; 