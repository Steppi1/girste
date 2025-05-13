import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' }
  })
  if (error) {
    console.error('Supabase error', error)
    return
  }
  const grid = document.getElementById('masonry')
  grid.innerHTML = ''
  data.sort(() => 0.5 - Math.random()).forEach(item => {
    const img = document.createElement('img')
    img.src = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${item.name}`
    img.alt = item.name
    img.loading = 'lazy'
    img.style.width = '100%'  // full quality natural size, constrained by CSS
    grid.appendChild(img)
  })
}

function initPanzoom() {
  const elem = document.getElementById('panzoom')
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const initialZoom = isMobile ? 0.2 : 0.4

  const pz = panzoom(elem, {
    maxZoom: 4,
    minZoom: 0.1,
    pinchZoom: true,
    panOnlyWhenZoomed: false,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: false,
    beforeWheel: e => elem.contains(e.target)
  })

  // Prevent page scrolling when interacting with panzoom
  elem.addEventListener('wheel', e => e.preventDefault(), { passive: false })

  setTimeout(() => {
    const grid = document.getElementById('masonry')
    const rect = grid.getBoundingClientRect()
    const offsetX = (window.innerWidth - rect.width * initialZoom) / 2 - rect.left
    const offsetY = -rect.top + 20
    pz.zoomAbs(0, 0, initialZoom)
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
