
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const panzoomContainer = document.getElementById('panzoom')
const NUM_COLUMNS = 5

function buildMosaic(imageUrls) {
  panzoomContainer.innerHTML = ''
  const columns = []

  for (let i = 0; i < NUM_COLUMNS; i++) {
    const column = document.createElement('div')
    column.classList.add('column')
    columns.push(column)
    panzoomContainer.appendChild(column)
  }

  imageUrls.forEach((url, index) => {
    const tile = document.createElement('div')
    tile.classList.add('tile')

    const img = document.createElement('img')
    img.src = url
    img.alt = `img-${index}`

    tile.appendChild(img)
    columns[index % NUM_COLUMNS].appendChild(tile)
  })
}

async function fetchImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  })

  if (error) {
    console.error('Errore nel caricamento immagini:', error)
    return
  }

  const urls = await Promise.all(
    data.map(async file => {
      const { data: urlData } = await supabase.storage.from('mosaic').getPublicUrl(file.name)
      return urlData.publicUrl
    })
  )

  buildMosaic(urls)
  setupPanzoom()
}

function setupPanzoom() {
  const panzoomInstance = panzoom(panzoomContainer, {
    maxZoom: 5,
    minZoom: 0.1,
    smoothScroll: false
  })

  // Applica zoom iniziale e centra la vista
  panzoomInstance.zoomAbs(0, 0, 1.5)

  // Attendi il rendering completo e poi centra il contenuto
  requestAnimationFrame(() => {
    const { width, height } = panzoomContainer.getBoundingClientRect()
    const centerX = width / 2
    const centerY = height / 2
    panzoomInstance.moveTo(window.innerWidth / 2 - centerX * 1.5, window.innerHeight / 2 - centerY * 1.5)
  })
}

fetchImages()
