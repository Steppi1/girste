
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const panzoomContainer = document.getElementById('panzoom')
const NUM_COLUMNS = 6

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function buildMosaic(imageUrls) {
  panzoomContainer.innerHTML = ''
  const columns = []

  for (let i = 0; i < NUM_COLUMNS; i++) {
    const column = document.createElement('div')
    column.classList.add('column')
    columns.push(column)
    panzoomContainer.appendChild(column)
  }

  shuffle(imageUrls).forEach((url, index) => {
    const tile = document.createElement('div')
    tile.classList.add('tile')

    const img = document.createElement('img')
    img.src = url
    img.alt = `img-${index}`

    tile.appendChild(img)
    columns[index % NUM_COLUMNS].appendChild(tile)
  })

  return new Promise((resolve) => {
    let loaded = 0
    const total = imageUrls.length
    const imgs = panzoomContainer.querySelectorAll('img')
    imgs.forEach((img) => {
      if (img.complete) {
        loaded++
        if (loaded === total) resolve()
      } else {
        img.onload = () => {
          loaded++
          if (loaded === total) resolve()
        }
      }
    })
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

  await buildMosaic(urls)
  setupPanzoom()
}

function setupPanzoom() {
  const panzoomInstance = panzoom(panzoomContainer, {
    maxZoom: 5,
    minZoom: 0.1,
    smoothScroll: false
  })

  panzoomInstance.zoomAbs(0, 0, 1.5)

  // Centra dopo il caricamento effettivo delle immagini
  setTimeout(() => {
    const bbox = panzoomContainer.getBoundingClientRect()
    const canvasCenterX = bbox.width / 2
    const canvasCenterY = bbox.height / 2

    const viewCenterX = window.innerWidth / 2
    const viewCenterY = window.innerHeight / 2

    const offsetX = viewCenterX - canvasCenterX * 1.5
    const offsetY = viewCenterY - canvasCenterY * 1.5

    panzoomInstance.moveTo(offsetX, offsetY)
  }, 100)
}

fetchImages()
