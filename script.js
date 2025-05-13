import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' }
  })
  if (error) console.error('Supabase error', error)

  const grid = document.getElementById('masonry')
  grid.innerHTML = ''
  (data || []).sort(() => 0.5 - Math.random()).forEach(item => {
    const url = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${item.name}`
    const img = document.createElement('img')
    img.src = url
    img.alt = item.name
    img.loading = 'lazy'
    grid.appendChild(img)
  })
}

function initPanzoom() {
  const elem = document.getElementById('panzoom')
  const pz = panzoom(elem, {
    maxZoom: 4, minZoom: 0.2, bounds: true, boundsPadding: 0.2, smoothScroll: true
  })
  setTimeout(() => {
    const grid = document.getElementById('masonry')
    const rect = grid.getBoundingClientRect()
    const zoom = 0.4
    const offsetX = (window.innerWidth - rect.width * zoom) / 2 - rect.left
    const offsetY = (window.innerHeight - rect.height * zoom) / 2 - rect.top
    pz.zoomAbs(0, 0, zoom)
    pz.moveBy(offsetX, offsetY)
  }, 300)
}

function initThemeToggle() {
  document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode')
  })
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadImages()
  initPanzoom()
  initThemeToggle()
})
