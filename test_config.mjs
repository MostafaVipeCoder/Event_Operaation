import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nipunwrewluxaikyfbzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_PsvF2yugR6vWfUsYCLdQPw_YsD7l5jt';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const formId = '75f9e47a-7e2e-4041-9bd7-4d533ebbf256';

  const { data, error } = await supabase
    .from('form_field_configs')
    .select('*')
    .eq('form_id', formId);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Form Fields:', JSON.stringify(data, null, 2));
}

test();
