import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Ottiene tutti i post, ordinati per data discendente */
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
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

/** Elenca i file del bucket 'mosaic' e restituisce gli URL pubblici */
export async function getImageUrls(bucket = 'mosaic') {
  // 1) Lista i file
  const { data: files, error: listError } = await supabase
    .storage
    .from(bucket)
    .list('', { limit: 1000 })

  if (listError) {
    console.error('Errore listing files:', listError)
    return []
  }

  // 2) Per ciascun file valido, ottieni l’URL pubblico
  const urls = []
  for (const f of files) {
    if (!/\.(jpe?g|png|webp|gif)$/i.test(f.name)) continue

    // getPublicUrl ora restituisce { data: { publicUrl }, error }
    const { data: urlData, error: urlError } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(f.name)

    if (urlError) {
      console.error(`Errore getPublicUrl per ${f.name}:`, urlError)
    } else if (urlData && urlData.publicUrl) {
      urls.push(urlData.publicUrl)
    }
  }

  console.log(`Caricate ${urls.length} immagini dal bucket '${bucket}'`)
  return urls
}
