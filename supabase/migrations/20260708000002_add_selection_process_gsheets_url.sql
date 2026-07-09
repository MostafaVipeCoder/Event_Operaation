-- Add column for selection process Google Sheets URL
ALTER TABLE events ADD COLUMN IF NOT EXISTS selection_process_gsheets_url TEXT;
