import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://mcvvvhpmpouuupwqlbsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
)

const wrapper = document.getElementById('wrapper')
const panzoomEl = document.getElementById('panzoom')
const masonryEl = document.getElementById('masonry')

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', { limit: 500 })

  if (error) {
    console.error('❌ Errore caricamento immagini:', error)
    return
  }

  const shuffled = data.sort(() => Math.random() - 0.5)

  for (const item of shuffled) {
    const img = document.createElement('img')
    img.src = `https://mcvvvhpmpouuupwqlbsn.supabase.co/storage/v1/object/public/mosaic/${item.name}`
    img.className = 'tile'
    img.loading = 'eager'
    masonryEl.appendChild(img)
  }

  await new Promise(r => setTimeout(r, 500)) // attende layout

  setupZoom()
}

function setupZoom() {
  const panzoomInstance = window.panzoom(panzoomEl, {
    maxZoom: 4,
    minZoom: 0.05,
    bounds: true,
    boundsPadding: 2,
    smoothScroll: true
  })

  panzoomEl.style.touchAction = 'none'

  const wrapperRect = wrapper.getBoundingClientRect()
  const contentRect = panzoomEl.getBoundingClientRect()

  const scaleX = wrapperRect.width / contentRect.width
  const scaleY = wrapperRect.height / contentRect.height
  const scale = Math.min(scaleX, scaleY) * 0.9

  panzoomInstance.zoomAbs(0, 0, scale)

  const offsetX = (wrapperRect.width - contentRect.width * scale) / 2
  const offsetY = (wrapperRect.height - contentRect.height * scale) / 2

  panzoomInstance.moveTo(offsetX, offsetY)
}

loadImages()