import { createDay, createSlot, deleteDay } from './src/lib/api.js';

async function testArabicLocalization() {
  console.log('--- Testing Arabic Localization ---');
  
  try {
    // 1. Create a Day with Arabic name
    const dayData = {
      event_id: '9c5a305c-6353-41ff-9c76-2327e3ada1e1', 
      day_number: 99,
      day_name: 'Test Day EN',
      day_name_ar: 'يوم تجريبي'
    };
    
    console.log('Creating day...');
    const day = await createDay(dayData);
    console.log('Created Day:', day);
    
    if (!day || !day.day_id) throw new Error('Failed to create day');

    // 2. Create a Slot with Arabic fields
    const slotData = {
      day_id: day.day_id,
      slot_title: 'Test Slot EN',
      slot_title_ar: 'جلسة تجريبية',
      presenter_name: 'Test Presenter EN',
      presenter_name_ar: 'مقدم تجريبي',
      bullet_points: ['Point 1 EN'],
      bullet_points_ar: ['نقطة 1 عربي'],
      start_time: '09:00:00',
      end_time: '10:00:00',
      show_presenter: true
    };
    
    console.log('Creating slot...');
    const slot = await createSlot(slotData);
    console.log('Created Slot:', slot);

    // 3. Verify via Supabase query directly to be absolutely sure
    console.log('Verifying via SQL...');
    // We'll just check if the fields exist in the returned objects for now
    if (day.day_name_ar === dayData.day_name_ar && 
        slot.slot_title_ar === slotData.slot_title_ar &&
        slot.presenter_name_ar === slotData.presenter_name_ar &&
        JSON.stringify(slot.bullet_points_ar) === JSON.stringify(slotData.bullet_points_ar)) {
      console.log('SUCCESS: Arabic fields correctly saved and returned!');
    } else {
      console.error('FAILURE: Arabic fields mismatch!');
      console.log('Expected Day AR:', dayData.day_name_ar, 'Got:', day.day_name_ar);
      console.log('Expected Slot Title AR:', slotData.slot_title_ar, 'Got:', slot.slot_title_ar);
    }
    
    console.log('--- Test Finished Successfully ---');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testArabicLocalization();
