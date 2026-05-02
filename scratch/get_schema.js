import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// read local env files since dotenv doesn't load .env.local automatically
try {
  const envConfig = dotenv.parse(readFileSync(resolve('.env.local')))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
} catch (e) {
  console.log('No .env.local found');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: experts, error: err1 } = await supabase.from('experts').select('*').limit(1);
  console.log('experts schema:', experts ? Object.keys(experts[0] || {}) : err1);

  const { data: master, error: err2 } = await supabase.from('master_experts').select('*').limit(1);
  console.log('master_experts schema:', master ? Object.keys(master[0] || {}) : err2);
}

checkSchema();
