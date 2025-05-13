import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase
const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// carica e monta immagini in ordine random
async function loadImages() {
  const { data, error } = await supabase
    .storage
    .from('mosaic')
    .list('', { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } })

  if (error) return console.error('Supabase error', error)

  const grid = document.getElementById('masonry')
  grid.innerHTML = ''

  // random shuffle
  const shuffled = data.sort(() => 0.5 - Math.random())

  for (const item of shuffled) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${item.name}`
    const img = document.createElement('img')
    img.src = url
    img.alt = item.name
    img.loading = 'lazy'
    grid.appendChild(img)
  }
}

// inizializza panzoom con limiti e inerzia
function initPanzoom() {
  const elem = document.getElementById('panzoom')
  const pz = panzoom(elem, {
    maxZoom: 4,
    minZoom: 0.2,
    bounds: true,
    boundsPadding: 0.2,
    smoothScroll: true
  })

  setTimeout(() => {
    const grid = document.getElementById('masonry')
    const rect = grid.getBoundingClientRect()

    const targetZoom = 0.4
    const offsetX = (window.innerWidth - rect.width * targetZoom) / 2 - rect.left
    const offsetY = (window.innerHeight - rect.height * targetZoom) / 2 - rect.top

    pz.zoomAbs(0, 0, targetZoom)
    pz.moveBy(offsetX, offsetY)
  }, 300)
}

// toggle light/dark
function initThemeToggle() {
  const btn = document.getElementById('toggle-theme')
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode')
    const img = btn.querySelector('img')
    if (document.body.classList.contains('dark-mode')) {
      img.src = 'assets/bright-icon.svg'
    } else {
      img.src = 'assets/dark-icon.svg'
    }
  })
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadImages()
  initPanzoom()
  initThemeToggle()
})
