-- Add bio column to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add master_id column to mentors table to link to master_experts
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS master_id TEXT;

-- Create index for master_id
CREATE INDEX IF NOT EXISTS idx_mentors_master_id ON mentors(master_id);
