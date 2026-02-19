-- Add UI settings columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS experts_color TEXT DEFAULT '#9333ea',
ADD COLUMN IF NOT EXISTS startups_color TEXT DEFAULT '#059669',
ADD COLUMN IF NOT EXISTS header_settings JSONB DEFAULT '{}'::jsonb;

-- Comment describing the header_settings structure
COMMENT ON COLUMN events.header_settings IS 'Stores UI settings like header_title, header_description, font_family, text_color, etc.';
