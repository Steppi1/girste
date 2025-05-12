// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** 1) Posts dal DB */
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

/** 2) Splash texts dal DB */
export async function getSplashTxts() {
  const { data, error } = await supabase
    .from('splashtxt')
    .select('phrase')
  if (error) throw error
  return data.map(r => r.phrase)
}

/** 3) Aggiunge una nuova splash-text (se ti serve) */
export async function addSplashTxt(phrase) {
  const { error } = await supabase
    .from('splashtxt')
    .insert({ phrase })
  if (error) throw error
}

/** 4) Elenca i file del bucket 'mosaic' e restituisce gli URL pubblici */
export async function getImageUrls(bucket = 'mosaic') {
  const { data: files, error } = await supabase
    .storage
    .from(bucket)
    .list('', { limit: 1000 })
  if (error) {
    console.error('Errore listing files:', error)
    return []
  }
  return files
    .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f.name))
    .map(f =>
      supabase
        .storage
        .from(bucket)
        .getPublicUrl(f.name)
        .publicURL
    )
}
