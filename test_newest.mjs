import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nipunwrewluxaikyfbzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_PsvF2yugR6vWfUsYCLdQPw_YsD7l5jt';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: companies, error: compErr } = await supabase.from('company_submissions').select('*').order('created_at', {ascending: false}).limit(5);
  
  if (compErr) console.error(compErr);
  
  console.log("=== COMPANIES ===");
  console.log(JSON.stringify(companies, null, 2));
}

test();
