-- Create booking_notifications table for fallback storage
CREATE TABLE IF NOT EXISTS booking_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    recipients TEXT[] NOT NULL,
    data JSONB NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);
