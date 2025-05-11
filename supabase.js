// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔁 INSERISCI QUI I TUOI DATI
const SUPABASE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk4Njk3MSwiZXhwIjoyMDYyNTYyOTcxfQ.O5irmj9bNlwlskfAhw-CHxXwEILNzUyon4Q-0iLvyxQ'     // ← il tuo project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'                  // ← la tua anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 📤 Inserisce un post nella tabella "posts"
export async function insertPost({ title, snippet, content, tag, image_url = null }) {
  const { data, error } = await supabase.from('posts').insert([
    { title, snippet, content, tag, image_url }
  ])
  if (error) throw error
  return data
}

// 📥 Legge tutti i post ordinati per data (più recente prima)
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
