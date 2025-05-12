import { supabase } from './supabase.js'

// — DOM Elements —
const authPanel   = document.getElementById('auth-panel')
const adminPanel  = document.getElementById('admin-panel')
const emailInput  = document.getElementById('email')
const passInput   = document.getElementById('password')
const btnLogin    = document.getElementById('btn-login')
const btnLogout   = document.getElementById('btn-logout')
const authFb      = document.getElementById('auth-feedback')

const navButtons  = document.querySelectorAll('.nav-btn')
const sections    = document.querySelectorAll('.section')

const fbNewPost   = document.getElementById('fb-new-post')
const fbNewSplash = document.getElementById('fb-new-splash')
const listPosts   = document.getElementById('list-posts')
const listSplash  = document.getElementById('list-splash')
const listPhotos  = document.getElementById('list-photos')

const npTitle     = document.getElementById('np-title')
const npSnippet   = document.getElementById('np-snippet')
const npContent   = document.getElementById('np-content')
const npTag       = document.getElementById('np-tag')
const btnNewPost  = document.getElementById('submit-new-post')

let currentUser = null

// — UI Helpers —
function showSection(id) {
  sections.forEach(s => s.id === id
    ? s.classList.add('active')
    : s.classList.remove('active')
  )
  navButtons.forEach(b => b.dataset.section === id
    ? b.classList.add('active')
    : b.classList.remove('active')
  )
}

function toggleAuth(loggedIn) {
  authPanel.style.display  = loggedIn ? 'none' : 'block'
  adminPanel.style.display = loggedIn ? 'block' : 'none'
  authFb.textContent = ''
  if (loggedIn) loadAllLists()
}

// — Auth Flow —
window.addEventListener('load', async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) console.error(error)
  if (session) currentUser = session.user
  toggleAuth(!!session)
  if (session) showSection('new-post')
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
    showSection('new-post')
  }
})

btnLogout.addEventListener('click', async () => {
  await supabase.auth.signOut()
  currentUser = null
  toggleAuth(false)
})

// — Navigation —
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showSection(btn.dataset.section)
    if (btn.dataset.section === 'edit-post')    loadPosts()
    if (btn.dataset.section === 'manage-splash') loadSplashes()
    if (btn.dataset.section === 'manage-photos') loadPhotos()
  })
})

// — Load All Lists —
async function loadAllLists() {
  await Promise.all([ loadPosts(), loadSplashes(), loadPhotos() ])
}

// — Posts — 
async function loadPosts() {
  listPosts.textContent = '⏳ Caricamento…'
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    listPosts.textContent = 'Errore: ' + error.message
    return
  }
  if (!data.length) {
    listPosts.textContent = 'Nessun post.'
    return
  }
  listPosts.innerHTML = data.map(p => `
    <div data-id="${p.id}">
      <strong>${p.title}</strong>
      <button class="edit-post">✏️</button>
      <button class="del-post">🗑️</button>
    </div>
  `).join('')

  listPosts.querySelectorAll('.edit-post').forEach(btn => {
    btn.onclick = () => {
      const id = btn.parentElement.dataset.id
      const post = data.find(x => x.id == id)
      npTitle.value   = post.title
      npSnippet.value = post.snippet
      npContent.value = post.content
      npTag.value     = post.tag
      showSection('new-post')
      btnNewPost.textContent        = 'Aggiorna Post'
      btnNewPost.dataset.editId     = id
    }
  })
  listPosts.querySelectorAll('.del-post').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.parentElement.dataset.id
      if (!confirm('Confermi?')) return
      await supabase.from('posts').delete().eq('id', id)
      loadPosts()
    }
  })
}

btnNewPost.addEventListener('click', async () => {
  fbNewPost.textContent = ''
  const payload = {
    title:   npTitle.value,
    snippet: npSnippet.value,
    content: npContent.value,
    tag:     npTag.value,
    user_id: currentUser.id
  }
  if (btnNewPost.dataset.editId) {
    await supabase
      .from('posts')
      .update(payload)
      .eq('id', btnNewPost.dataset.editId)
    delete btnNewPost.dataset.editId
    btnNewPost.textContent = 'Pubblica Post'
  } else {
    await supabase
      .from('posts')
      .insert([payload])
  }
  npTitle.value = npSnippet.value = npContent.value = ''
  npTag.value = 'tools'
  fbNewPost.textContent = '✅ Operazione completata'
  fbNewPost.className = 'feedback ok'
  loadPosts()
})

// — Splashes —
async function loadSplashes() {
  listSplash.textContent = '⏳ Caricamento…'
  const { data, error } = await supabase
    .from('splashtxt')
    .select('*')

  if (error) {
    listSplash.textContent = 'Errore: ' + error.message
    return
  }
  if (!data.length) {
    listSplash.textContent = 'Nessuno splash.'
    return
  }
  listSplash.innerHTML = data.map(s => `
    <div data-id="${s.id}">
      "${s.phrase}"
      <button class="del-splash">🗑️</button>
    </div>
  `).join('')

  listSplash.querySelectorAll('.del-splash').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.parentElement.dataset.id
      if (!confirm('Cancelli?')) return
      await supabase.from('splashtxt').delete().eq('id', id)
      loadSplashes()
    }
  })
}

document.getElementById('submit-new-splash').addEventListener('click', async () => {
  const phrase = prompt('Inserisci splash-text:')
  if (!phrase) return
  await supabase
    .from('splashtxt')
    .insert({ phrase, user_id: currentUser.id })
  fbNewSplash.textContent = '✅ Aggiunto!'
  fbNewSplash.className = 'feedback ok'
  loadSplashes()
})

// — Photos —
async function loadPhotos() {
  listPhotos.textContent = '⏳ Caricamento…'
  const { data, error } = await supabase
    .storage
    .from('images')
    .list('', { limit: 100 })

  if (error) {
    listPhotos.textContent = 'Errore: ' + error.message
    return
  }
  if (!data.length) {
    listPhotos.textContent = 'Nessuna foto.'
    return
  }
  listPhotos.innerHTML = data.map(f => {
    const url = supabase
      .storage
      .from('images')
      .getPublicUrl(f.name).data.publicUrl
    return `
      <div data-file="${f.name}" style="margin-bottom:1rem;">
        <img src="${url}" style="max-width:120px;">
        <button class="del-photo">🗑️</button>
      </div>
    `
  }).join('')

  listPhotos.querySelectorAll('.del-photo').forEach(btn => {
    btn.onclick = async () => {
      const file = btn.parentElement.dataset.file
      if (!confirm('Eliminare?')) return
      await supabase.storage.from('images').remove([file])
      loadPhotos()
    }
  })
}
