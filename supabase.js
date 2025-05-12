import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5...laTuaAnonKey'
export const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Per la pagina pubblica dei files */
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}
