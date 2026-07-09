import { supabase } from './supabase';

// Fetch event details
export const getEvent = async (eventId) => {
    const { data, error } = await supabase
        .from('events')
        .select('name, admin_email')
        .eq('id', eventId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * Mentor Booking Library
 * Handles all database operations for the mentor booking module
 */

// ------------------------------
// Mentors CRUD
// ------------------------------

export const getMentors = async (eventId) => {
    // Step 1: Fetch mentors
    const { data: mentors, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('event_id', eventId)
        .order('name');
    if (mentorsError) throw mentorsError;
    
    // Step 2: If there are mentors with master_id, fetch master experts
    const masterIds = mentors.map(m => m.master_id).filter(Boolean);
    let masterExperts = [];
    if (masterIds.length > 0) {
        const { data, error: masterError } = await supabase
            .from('master_experts')
            .select('*')
            .in('id', masterIds);
        if (!masterError && data) {
            masterExperts = data;
        }
    }
    
    // Step 3: Create a map of master_id -> master_expert
    const masterMap = new Map(masterExperts.map(me => [me.id, me]));
    
    // Step 4: Merge data
    return mentors.map(mentor => ({
        ...mentor,
        photo_url: mentor.photo_url || (masterMap.get(mentor.master_id)?.photo_url)
    }));
};

export const getMentorById = async (id) => {
    const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', id)
        .single();
    if (mentorError) throw mentorError;
    
    // If there's a master_id, fetch the master expert
    if (mentor.master_id) {
        const { data: master, error: masterError } = await supabase
            .from('master_experts')
            .select('*')
            .eq('id', mentor.master_id)
            .single();
        if (!masterError && master) {
            return {
                ...mentor,
                photo_url: mentor.photo_url || master.photo_url
            };
        }
    }
    
    return mentor;
};

export const createMentor = async (mentorData) => {
    const { data, error } = await supabase
        .from('mentors')
        .insert([mentorData])
        .select();
    if (error) throw error;
    return data[0];
};

export const updateMentor = async (id, updates) => {
    const { data, error } = await supabase
        .from('mentors')
        .update(updates)
        .eq('id', id)
        .select();
    if (error) throw error;
    return data[0];
};

export const deleteMentor = async (id) => {
    const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

// ------------------------------
// Slots CRUD
// ------------------------------

export const getSlots = async (eventId, mentorId = null) => {
    let query = supabase
        .from('mentor_slots')
        .select('*, mentors(*)')
        .eq('event_id', eventId)
        .order('start_time');
    
    if (mentorId) {
        query = query.eq('mentor_id', mentorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getAvailableSlots = async (eventId, mentorId = null) => {
    let query = supabase
        .from('mentor_slots')
        .select('*, mentors(*)')
        .eq('event_id', eventId)
        .eq('is_available', true)
        .gt('start_time', new Date().toISOString())
        .order('start_time');
    
    if (mentorId) {
        query = query.eq('mentor_id', mentorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createSlot = async (slotData) => {
    const { data, error } = await supabase
        .from('mentor_slots')
        .insert([slotData])
        .select();
    if (error) throw error;
    return data[0];
};

export const updateSlot = async (id, updates) => {
    const { data, error } = await supabase
        .from('mentor_slots')
        .update(updates)
        .eq('id', id)
        .select();
    if (error) throw error;
    return data[0];
};

export const deleteSlot = async (id) => {
    const { error } = await supabase
        .from('mentor_slots')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

// ------------------------------
// Bookings CRUD
// ------------------------------

export const getBookings = async (eventId, mentorId = null) => {
    let query = supabase
        .from('bookings')
        .select('*, mentor_slots(*), mentors(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
    
    if (mentorId) {
        query = query.eq('mentor_id', mentorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createBooking = async (bookingData) => {
    // First, check if slot is still available
    const { data: slot, error: slotError } = await supabase
        .from('mentor_slots')
        .select('*, mentors(*)')
        .eq('id', bookingData.slot_id)
        .single();
    
    if (slotError) throw slotError;
    if (!slot.is_available) throw new Error('Slot is no longer available');

    // Create booking
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
    
    if (bookingError) throw bookingError;

    // Mark slot as unavailable
    await updateSlot(bookingData.slot_id, { is_available: false });

    // Fetch event details to get admin email and event name
    try {
        const event = await getEvent(bookingData.event_id);
        
        // Call Edge Function to send notifications
        await supabase.functions.invoke('send-booking-notifications', {
            body: {
                booking_id: booking[0].id,
                slot_id: bookingData.slot_id,
                mentor_id: bookingData.mentor_id,
                event_id: bookingData.event_id,
                company_name: bookingData.company_name,
                booker_email: bookingData.booker_email,
                start_time: slot.start_time,
                end_time: slot.end_time,
                mentor_name: slot.mentors?.name,
                mentor_email: slot.mentors?.email,
                mentor_photo_url: slot.mentors?.photo_url,
                event_name: event?.name,
                admin_email: event?.admin_email
            }
        });
    } catch (notificationError) {
        console.error('Failed to send booking notifications:', notificationError);
        // Don't fail the booking just because notifications failed
    }

    return booking[0];
};

export const deleteBooking = async (id) => {
    // First, get the booking to find the slot
    const { data: booking, error: getError } = await supabase
        .from('bookings')
        .select('slot_id')
        .eq('id', id)
        .single();
    
    if (getError) throw getError;

    // Delete booking
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
    
    if (error) throw error;

    // Mark slot as available again
    await updateSlot(booking.slot_id, { is_available: true });

    return true;
};
