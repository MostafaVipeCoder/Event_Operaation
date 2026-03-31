import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nipunwrewluxaikyfbzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_PsvF2yugR6vWfUsYCLdQPw_YsD7l5jt';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('company_submissions')
    .delete()
    .eq('submission_id', '5dbfb45d-982f-4cf2-bdae-ff9a18baa980');

  if (error) console.error(error);
  else console.log('Successfully deleted the YouTube test record.');
}

run();
