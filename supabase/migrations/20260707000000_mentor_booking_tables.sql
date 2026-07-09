-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, email)
);

-- Create mentor_slots table
CREATE TABLE IF NOT EXISTS mentor_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id UUID NOT NULL REFERENCES mentor_slots(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    booker_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_slots_mentor_id ON mentor_slots(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_slots_start_time ON mentor_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your auth setup)
CREATE POLICY "Allow public read access to mentors" 
    ON mentors FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access to available slots" 
    ON mentor_slots FOR SELECT 
    USING (true);

CREATE POLICY "Allow public to create bookings" 
    ON bookings FOR INSERT 
    WITH CHECK (true);
