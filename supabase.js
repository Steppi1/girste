// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
export const SUPABASE_KEY = 'la-tua-anon-public-key'
export const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY)

// POSTS
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
export async function upsertPost(post) {
  const { error } = post.id
    ? await supabase.from('posts').update(post).eq('id', post.id)
    : await supabase.from('posts').insert([post])
  if (error) throw error
}
export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

// SPLASH-TEXT
export async function getSplashTxts() {
  const { data, error } = await supabase
    .from('splashtxt')
    .select('*')
  if (error) throw error
  return data
}
export async function addSplashTxt(phrase) {
  const { error } = await supabase
    .from('splashtxt')
    .insert({ phrase })
  if (error) throw error
}
export async function deleteSplashTxt(id) {
  const { error } = await supabase.from('splashtxt').delete().eq('id', id)
  if (error) throw error
}

// FOTO
export async function listPhotos() {
  const { data, error } = await supabase
    .storage
    .from('images')
    .list('', { limit: 100 })
  if (error) throw error
  return data
}
export async function getPhotoUrl(name) {
  const { data } = supabase
    .storage
    .from('images')
    .getPublicUrl(name)
  return data.publicUrl
}
export async function deletePhoto(name) {
  const { error } = await supabase.storage.from('images').remove([name])
  if (error) throw error
}
