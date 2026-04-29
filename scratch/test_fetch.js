
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nipunwrewluxaikyfbzg.supabase.co',
  process.env.SUPABASE_KEY // I don't have this, but I can use execute_sql instead
)

async function test() {
  const { data, error } = await supabase.from('library_resources').select('*')
  console.log(data)
}
