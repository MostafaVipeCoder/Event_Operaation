import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nipunwrewluxaikyfbzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_PsvF2yugR6vWfUsYCLdQPw_YsD7l5jt';

/** @type {import('@supabase/supabase-js').SupabaseClient<import('../types/database.types').Database>} */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
