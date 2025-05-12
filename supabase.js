import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
export const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Ottiene tutti i post dalla tabella public.posts */
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

/** Legge tutte le splash-text dalla tabella public.splashtxt */
export async function getSplashTxts() {
  const { data, error } = await supabase
    .from('splashtxt')
    .select('phrase')
  if (error) throw error
  return data.map(r => r.phrase)
}

// supabase.js
export async function addSplashTxt(phrase) {
  const { error } = await supabase
    .from('splashtxt')
    .insert({ phrase })     // <- qui NON passi più l'id
  if (error) throw error
}
