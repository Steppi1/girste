import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<LA_TUA_ANON_PUBLIC_KEY>'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Ottiene tutti i post, ordinati per data desc */
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

/** Ottiene tutte le splash-text */
export async function getSplashTxts() {
  const { data, error } = await supabase
    .from('splashtxt')
    .select('phrase')
  if (error) throw error
  return data.map(r => r.phrase)
}

/** Aggiunge una nuova splash-text */
export async function addSplashTxt(phrase) {
  const { error } = await supabase
    .from('splashtxt')
    .insert({ phrase })
  if (error) throw error
}
