-- ==========================================
-- SUPABASE RLS FIX FOR AGENDA BUILDER
-- ==========================================
-- Run this script in your Supabase SQL Editor
-- to fix the 401 Unauthorized and 42501 RLS errors.

-- 1. Enable RLS on all relevant tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_slots ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies (optional, but safe to avoid conflicts)
DROP POLICY IF EXISTS "Public Select events" ON events;
DROP POLICY IF EXISTS "Public Insert events" ON events;
DROP POLICY IF EXISTS "Public Update events" ON events;
DROP POLICY IF EXISTS "Public Delete events" ON events;

DROP POLICY IF EXISTS "Public Select event_days" ON event_days;
DROP POLICY IF EXISTS "Public Insert event_days" ON event_days;
DROP POLICY IF EXISTS "Public Update event_days" ON event_days;
DROP POLICY IF EXISTS "Public Delete event_days" ON event_days;

-- 3. Create permissive policies for 'anon' and 'authenticated' roles
-- We allow full CRUD for anyone with the API key (Public Builder Model)

-- Events Table
CREATE POLICY "Public CRUD events" ON events
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Event Days Table
CREATE POLICY "Public CRUD event_days" ON event_days
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Agenda Slots Table
CREATE POLICY "Public CRUD agenda_slots" ON agenda_slots
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Experts Table
CREATE POLICY "Public CRUD experts" ON experts
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Companies Table
CREATE POLICY "Public CRUD companies" ON companies
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Verify Column names (Check if they match api.js)
-- Ensure primary keys are correctly set and typed.
-- This script assumes:
-- events (event_id UUID)
-- event_days (day_id UUID, event_id UUID)
-- agenda_slots (slot_id UUID, day_id UUID)
-- experts (expert_id UUID, event_id UUID)
-- companies (company_id UUID, event_id UUID)

COMMIT;
