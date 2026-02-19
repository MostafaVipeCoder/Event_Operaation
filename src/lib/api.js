import { supabase } from './supabase';
import { fetchAndParseGoogleSheet } from './excel';

// ==========================================
// EVENT APIs
// ==========================================

export const getEvents = async () => {
    console.log('[Supabase] Fetching all events');
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Supabase Error] getEvents:', error);
        throw error;
    }
    return data;
};

export const getEvent = async (eventId) => {
    console.log(`[Supabase] Fetching event: ${eventId}`);
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single();

    if (error) {
        console.error(`[Supabase Error] getEvent (${eventId}):`, error);
        throw error;
    }
    return data;
};

export const getFullAgenda = async (eventId) => {
    console.log(`[Supabase] Fetching full agenda for event: ${eventId}`);

    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single();
    if (eventError) throw eventError;

    const { data: days, error: daysError } = await supabase
        .from('event_days')
        .select('*')
        .eq('event_id', eventId)
        .order('day_number', { ascending: true });
    if (daysError) throw daysError;

    const dayIds = days.map(d => d.day_id);
    let slots = [];
    if (dayIds.length > 0) {
        const { data: slotsData, error: slotsError } = await supabase
            .from('agenda_slots')
            .select('*')
            .in('day_id', dayIds)
            .order('sort_order', { ascending: true });
        if (slotsError) throw slotsError;
        slots = slotsData;
    }

    const { data: experts, error: expertsError } = await supabase
        .from('experts')
        .select('*')
        .eq('event_id', eventId);
    if (expertsError) throw expertsError;

    const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('event_id', eventId);
    if (companiesError) throw companiesError;

    return {
        event,
        days: days.map(day => ({
            ...day,
            slots: slots.filter(s => s.day_id === day.day_id)
        })),
        experts,
        companies
    };
};

export const getExperts = async (eventId) => {
    const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('event_id', eventId);
    if (error) throw error;
    return data;
};

export const getCompanies = async (eventId) => {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('event_id', eventId);
    if (error) throw error;
    return data;
};

export const getStartups = async () => {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createEvent = async (eventData) => {
    console.log('[Supabase] Creating event:', eventData.event_name);
    const { data, error } = await supabase
        .from('events')
        .insert({
            event_name: eventData.event_name,
            header_image_url: eventData.header_image_url || '',
            background_image_url: eventData.background_image_url || '',
            footer_image_url: eventData.footer_image_url || '',
            header_height: eventData.header_height || '16rem',
            experts_color: eventData.experts_color || '#9333ea',
            startups_color: eventData.startups_color || '#059669',
            header_settings: eventData.header_settings || {}
        })
        .select()
        .single();

    if (error) {
        console.error('[Supabase Error] createEvent details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }
    return data;
};

export const updateEvent = async (eventId, updates) => {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('event_id', eventId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteEvent = async (eventId) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('event_id', eventId);
    if (error) throw error;
    return { success: true };
};

// ==========================================
// EXPERTS & COMPANIES
// ==========================================

export const createExpert = async (expertData) => {
    const { data, error } = await supabase
        .from('experts')
        .insert(expertData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateExpert = async (expertId, updates) => {
    const { data, error } = await supabase
        .from('experts')
        .update(updates)
        .eq('expert_id', expertId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteExpert = async (expertId) => {
    const { error } = await supabase
        .from('experts')
        .delete()
        .eq('expert_id', expertId);
    if (error) throw error;
    return { success: true };
};

export const createCompany = async (companyData) => {
    const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateCompany = async (companyId, updates) => {
    const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('company_id', companyId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteCompany = async (companyId) => {
    const { error } = await supabase
        .from('companies')
        .delete()
        .eq('company_id', companyId);
    if (error) throw error;
    return { success: true };
};

// ==========================================
// DAY APIs
// ==========================================

export const getEventDays = async (eventId) => {
    const { data, error } = await supabase
        .from('event_days')
        .select('*')
        .eq('event_id', eventId)
        .order('day_number', { ascending: true });
    if (error) throw error;
    return data;
};

export const createDay = async (dayData) => {
    const { data, error } = await supabase
        .from('event_days')
        .insert({
            event_id: dayData.event_id,
            day_number: dayData.day_number,
            day_name: dayData.day_name,
            day_date: dayData.day_date
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateDay = async (dayId, updates) => {
    console.log(`[Supabase] Updating day ${dayId}:`, updates);
    const { data, error } = await supabase
        .from('event_days')
        .update(updates)
        .eq('day_id', dayId)
        .select()
        .single();

    if (error) {
        console.error(`[Supabase Error] updateDay (${dayId}) details:`, {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }
    return data;
};

export const deleteDay = async (dayId) => {
    const { error } = await supabase
        .from('event_days')
        .delete()
        .eq('day_id', dayId);
    if (error) throw error;
    return { success: true };
};

// ==========================================
// SLOT APIs
// ==========================================

export const getAgendaSlots = async (dayId) => {
    const { data, error } = await supabase
        .from('agenda_slots')
        .select('*')
        .eq('day_id', dayId)
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
};

export const createSlot = async (slotData) => {
    const { data, error } = await supabase
        .from('agenda_slots')
        .insert({
            day_id: slotData.day_id,
            start_time: slotData.start_time,
            end_time: slotData.end_time,
            slot_title: slotData.slot_title,
            presenter_name: slotData.presenter_name || '',
            sort_order: slotData.sort_order || 999
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateSlot = async (slotId, updates) => {
    const { data, error } = await supabase
        .from('agenda_slots')
        .update(updates)
        .eq('slot_id', slotId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteSlot = async (slotId) => {
    const { error } = await supabase
        .from('agenda_slots')
        .delete()
        .eq('slot_id', slotId);
    if (error) throw error;
    return { success: true };
};
// ==========================================
// STORAGE APIs
// ==========================================

export const uploadImage = async (file, path = 'covers') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log(`[Supabase Storage] Uploading: ${filePath}`);

    const { error: uploadError } = await supabase.storage
        .from('event-assets')
        .upload(filePath, file);

    if (uploadError) {
        console.error('[Supabase Storage Error] Upload:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('event-assets')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

/**
 * Bulk imports agenda data (days and slots) for an event.
 */
export const importAgendaData = async (eventId, data) => {
    const { days: sheetDays, slots: sheetSlots, experts: sheetExperts, companies: sheetCompanies } = data;
    console.log(`[Supabase] Differential Sync started for event: ${eventId}`);

    const stats = {
        days: { added: 0, updated: 0, skipped: 0 },
        slots: { added: 0, updated: 0, skipped: 0 },
        experts: { added: 0, updated: 0, skipped: 0 },
        companies: { added: 0, updated: 0, skipped: 0 }
    };

    try {
        // --- 1. SYNC DAYS ---
        const { data: existingDays } = await supabase
            .from('event_days')
            .select('*')
            .eq('event_id', eventId);

        const dayIdMap = new Map(); // Maps day_name to day_id

        for (const sDay of sheetDays) {
            const existing = existingDays?.find(d => d.day_name === sDay.day_name);
            if (existing) {
                // Check if update needed
                if (existing.day_date !== sDay.day_date) {
                    await supabase.from('event_days').update({ day_date: sDay.day_date }).eq('day_id', existing.day_id);
                    stats.days.updated++;
                } else {
                    stats.days.skipped++;
                }
                dayIdMap.set(sDay.day_name, existing.day_id);
            } else {
                // Create new
                const { data: newDay, error: dError } = await supabase
                    .from('event_days')
                    .insert([{
                        event_id: eventId,
                        day_name: sDay.day_name,
                        day_date: sDay.day_date,
                        day_number: (existingDays?.length || 0) + stats.days.added + 1
                    }])
                    .select().single();
                if (dError) throw dError;
                dayIdMap.set(sDay.day_name, newDay.day_id);
                stats.days.added++;
            }
        }

        // --- 2. SYNC SLOTS ---
        const dayIds = Array.from(dayIdMap.values());
        let existingSlots = [];
        if (dayIds.length > 0) {
            const { data } = await supabase.from('agenda_slots').select('*').in('day_id', dayIds);
            existingSlots = data || [];
        }

        for (const sSlot of sheetSlots) {
            const targetDayId = dayIdMap.get(sSlot.day_name);
            if (!targetDayId) continue;

            const existing = existingSlots.find(s => s.day_id === targetDayId && s.slot_title === sSlot.slot_title);
            const slotData = {
                start_time: sSlot.start_time,
                end_time: sSlot.end_time,
                presenter_name: sSlot.presenter_name,
                show_presenter: sSlot.show_presenter
            };

            if (existing) {
                const hasChanged = existing.start_time !== slotData.start_time ||
                    existing.end_time !== slotData.end_time ||
                    existing.presenter_name !== slotData.presenter_name ||
                    existing.show_presenter !== slotData.show_presenter;

                if (hasChanged) {
                    await supabase.from('agenda_slots').update(slotData).eq('slot_id', existing.slot_id);
                    stats.slots.updated++;
                } else {
                    stats.slots.skipped++;
                }
            } else {
                await supabase.from('agenda_slots').insert([{
                    day_id: targetDayId,
                    slot_title: sSlot.slot_title,
                    ...slotData,
                    sort_order: existingSlots.filter(s => s.day_id === targetDayId).length + stats.slots.added + 1
                }]);
                stats.slots.added++;
            }
        }

        // --- 3. SYNC EXPERTS ---
        const { data: existingExperts } = await supabase.from('experts').select('*').eq('event_id', eventId);
        if (sheetExperts) {
            for (const sExpert of sheetExperts) {
                const existing = existingExperts?.find(e => e.name === sExpert.name);
                const expertData = {
                    title: sExpert.title,
                    bio: sExpert.bio,
                    linkedin_url: sExpert.linkedin_url
                };

                if (existing) {
                    const hasChanged = existing.title !== expertData.title ||
                        existing.bio !== expertData.bio ||
                        existing.linkedin_url !== expertData.linkedin_url;
                    if (hasChanged) {
                        await supabase.from('experts').update(expertData).eq('expert_id', existing.expert_id);
                        stats.experts.updated++;
                    } else {
                        stats.experts.skipped++;
                    }
                } else {
                    await supabase.from('experts').insert([{ event_id: eventId, name: sExpert.name, ...expertData }]);
                    stats.experts.added++;
                }
            }
        }

        // --- 4. SYNC COMPANIES ---
        const { data: existingCompanies } = await supabase.from('companies').select('*').eq('event_id', eventId);
        if (sheetCompanies) {
            for (const sCompany of sheetCompanies) {
                const existing = existingCompanies?.find(c => c.name === sCompany.name);
                const companyData = {
                    founder: sCompany.founder,
                    location: sCompany.location,
                    industry: sCompany.industry
                };

                if (existing) {
                    const hasChanged = existing.founder !== companyData.founder ||
                        existing.location !== companyData.location ||
                        existing.industry !== companyData.industry;
                    if (hasChanged) {
                        await supabase.from('companies').update(companyData).eq('company_id', existing.company_id);
                        stats.companies.updated++;
                    } else {
                        stats.companies.skipped++;
                    }
                } else {
                    await supabase.from('companies').insert([{ event_id: eventId, name: sCompany.name, ...companyData }]);
                    stats.companies.added++;
                }
            }
        }

        return { success: true, stats };
    } catch (error) {
        console.error('[Supabase Error] Differential Sync:', error);
        throw error;
    }
};

/**
 * Syncs an event's data from its configured Google Sheet.
 */
export const syncEventFromCloud = async (eventId) => {
    try {
        const event = await getEvent(eventId);
        if (!event.gsheets_url) {
            throw new Error('Google Sheets URL not configured for this event.');
        }

        const data = await fetchAndParseGoogleSheet(event.gsheets_url);
        return await importAgendaData(eventId, data);
    } catch (error) {
        console.error('[Supabase] syncEventFromCloud failed:', error);
        throw error;
    }
};

// ==========================================
// REGISTRATION PORTALS APIs
// ==========================================

/**
 * Get form field configuration for an event
 * @param {string} eventId - Event ID
 * @param {string} entityType - 'company' or 'expert'
 */
export const getFormConfig = async (eventId, entityType) => {
    const { data, error } = await supabase
        .from('form_field_configs')
        .select('*')
        .eq('event_id', eventId)
        .eq('entity_type', entityType)
        .order('display_order', { ascending: true });

    if (error) throw error;

    // If no config found, return default fields
    if (!data || data.length === 0) {
        return getDefaultFormConfig(entityType);
    }

    return data;
};

/**
 * Save form field configuration for an event
 * @param {string} eventId - Event ID
 * @param {string} entityType - 'company' or 'expert'
 * @param {Array} fields - Array of field configurations
 */
export const saveFormConfig = async (eventId, entityType, fields) => {
    // Delete existing config
    await supabase
        .from('form_field_configs')
        .delete()
        .eq('event_id', eventId)
        .eq('entity_type', entityType);

    // Insert new config
    const fieldsWithEventId = fields.map(field => ({
        ...field,
        event_id: eventId,
        entity_type: entityType
    }));

    const { data, error } = await supabase
        .from('form_field_configs')
        .insert(fieldsWithEventId)
        .select();

    if (error) throw error;
    return data;
};

/**
 * Submit company registration
 * @param {string} eventId - Event ID
 * @param {Object} formData - Form data from the portal
 */
export const submitCompanyRegistration = async (eventId, formData) => {
    // Extract core fields
    const { startup_name, logo_url, industry, location, ...additionalData } = formData;

    const submission = {
        event_id: eventId,
        startup_name,
        logo_url: logo_url || null,
        industry: industry || null,
        location: location || null,
        additional_data: additionalData,
        status: 'pending'
    };

    const { data, error } = await supabase
        .from('company_submissions')
        .insert([submission])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Submit expert registration
 * @param {string} eventId - Event ID
 * @param {Object} formData - Form data from the portal
 */
export const submitExpertRegistration = async (eventId, formData) => {
    // Extract core fields
    const { expert_name, photo_url, title, company, bio, ...additionalData } = formData;

    const submission = {
        event_id: eventId,
        expert_name,
        photo_url: photo_url || null,
        title: title || null,
        company: company || null,
        bio: bio || null,
        additional_data: additionalData,
        status: 'pending'
    };

    const { data, error } = await supabase
        .from('expert_submissions')
        .insert([submission])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get submissions for an event
 * @param {string} eventId - Event ID
 * @param {string} entityType - 'company' or 'expert'
 * @param {string} status - Filter by status ('pending', 'approved', 'rejected', or 'all')
 */
export const getSubmissions = async (eventId, entityType, status = 'all') => {
    const table = entityType === 'company' ? 'company_submissions' : 'expert_submissions';

    let query = supabase
        .from(table)
        .select('*')
        .eq('event_id', eventId)
        .order('submitted_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/**
 * Approve a submission and copy to companies/experts table
 * @param {string} submissionId - Submission ID
 * @param {string} entityType - 'company' or 'expert'
 */
export const approveSubmission = async (submissionId, entityType) => {
    const submissionsTable = entityType === 'company' ? 'company_submissions' : 'expert_submissions';
    const targetTable = entityType === 'company' ? 'companies' : 'experts';

    // Get submission
    const { data: submission, error: fetchError } = await supabase
        .from(submissionsTable)
        .select('*')
        .eq('submission_id', submissionId)
        .single();

    if (fetchError) throw fetchError;

    // Prepare data for target table
    let targetData;
    if (entityType === 'company') {
        targetData = {
            event_id: submission.event_id,
            startup_name: submission.startup_name,
            logo_url: submission.logo_url,
            industry: submission.industry,
            location: submission.location,
            ...submission.additional_data
        };
    } else {
        targetData = {
            event_id: submission.event_id,
            expert_name: submission.expert_name,
            photo_url: submission.photo_url,
            title: submission.title,
            company: submission.company,
            bio: submission.bio,
            ...submission.additional_data
        };
    }

    // Insert into target table
    const { error: insertError } = await supabase
        .from(targetTable)
        .insert([targetData]);

    if (insertError) throw insertError;

    // Update submission status
    const { data: updated, error: updateError } = await supabase
        .from(submissionsTable)
        .update({
            status: 'approved',
            reviewed_at: new Date().toISOString()
        })
        .eq('submission_id', submissionId)
        .select()
        .single();

    if (updateError) throw updateError;
    return updated;
};

/**
 * Reject a submission
 * @param {string} submissionId - Submission ID
 * @param {string} entityType - 'company' or 'expert'
 * @param {string} reason - Rejection reason
 */
export const rejectSubmission = async (submissionId, entityType, reason) => {
    const table = entityType === 'company' ? 'company_submissions' : 'expert_submissions';

    const { data, error } = await supabase
        .from(table)
        .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason
        })
        .eq('submission_id', submissionId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get default form configuration
 * @param {string} entityType - 'company' or 'expert'
 */
const getDefaultFormConfig = (entityType) => {
    if (entityType === 'company') {
        return [
            {
                field_name: 'startup_name',
                field_label: 'Company Name',
                field_type: 'text',
                is_required: true,
                show_in_card: true,
                display_order: 0,
                placeholder: 'Enter company name'
            },
            {
                field_name: 'logo_url',
                field_label: 'Company Logo',
                field_type: 'file',
                is_required: false,
                show_in_card: true,
                display_order: 1,
                help_text: 'Upload your company logo (JPG, PNG)'
            },
            {
                field_name: 'industry',
                field_label: 'Industry',
                field_type: 'text',
                is_required: false,
                show_in_card: true,
                display_order: 2,
                placeholder: 'e.g., SaaS, E-commerce, FinTech'
            },
            {
                field_name: 'location',
                field_label: 'Location',
                field_type: 'text',
                is_required: false,
                show_in_card: true,
                display_order: 3,
                placeholder: 'e.g., Cairo, Dubai, Remote'
            }
        ];
    } else {
        return [
            {
                field_name: 'expert_name',
                field_label: 'Full Name',
                field_type: 'text',
                is_required: true,
                show_in_card: true,
                display_order: 0,
                placeholder: 'Enter your full name'
            },
            {
                field_name: 'photo_url',
                field_label: 'Photo',
                field_type: 'file',
                is_required: false,
                show_in_card: true,
                display_order: 1,
                help_text: 'Upload a professional photo'
            },
            {
                field_name: 'title',
                field_label: 'Job Title',
                field_type: 'text',
                is_required: false,
                show_in_card: true,
                display_order: 2,
                placeholder: 'e.g., CEO, CTO, Founder'
            },
            {
                field_name: 'company',
                field_label: 'Company',
                field_type: 'text',
                is_required: false,
                show_in_card: true,
                display_order: 3,
                placeholder: 'Company name'
            },
            {
                field_name: 'bio',
                field_label: 'Bio',
                field_type: 'textarea',
                is_required: false,
                show_in_card: true,
                display_order: 4,
                placeholder: 'Brief bio about yourself',
                validation_rules: { maxLength: 500 }
            }
        ];
    }
};
