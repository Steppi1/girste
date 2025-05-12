// files/auth.js
import { supabase } from '../supabase.js'
import { showSection } from './nav.js'   // ← IMPORT NECESSARIO

const authPanel   = document.getElementById('auth-panel')
const adminPanel  = document.getElementById('admin-panel')
const emailInput  = document.getElementById('email')
const passInput   = document.getElementById('password')
const btnLogin    = document.getElementById('btn-login')
const btnLogout   = document.getElementById('btn-logout')
const authFb      = document.getElementById('auth-feedback')

let currentUser = null

window.addEventListener('load', async () => {
  const { data:{ session } } = await supabase.auth.getSession()
  if (session) {
    currentUser = session.user
    toggleAuth(true)
  } else {
    toggleAuth(false)
  }
})

btnLogin.addEventListener('click', async () => {
  authFb.textContent = ''
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passInput.value
  })
  if (error) {
    authFb.textContent = error.message
    authFb.className = 'feedback error'
  } else {
    currentUser = data.user
    toggleAuth(true)
  }
})

btnLogout.addEventListener('click', async () => {
  await supabase.auth.signOut()
  currentUser = null
  toggleAuth(false)
})

export function toggleAuth(ok) {
  authPanel.style.display  = ok ? 'none' : 'block'
  adminPanel.style.display = ok ? 'block' : 'none'
  authFb.textContent = ''
  if (ok) showSection('new-post')
}
