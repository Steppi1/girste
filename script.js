import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const panzoomContainer = document.getElementById('panzoom')
const NUM_COLUMNS = 5

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

  return new Promise((resolve) => {
    const shuffledUrls = shuffle(imageUrls)
    let loaded = 0

    shuffledUrls.forEach((url, index) => {
      const tile = document.createElement('div')
      tile.classList.add('tile')

      const img = document.createElement('img')
      img.src = url
      img.alt = `img-${index}`

      img.onload = () => {
        loaded++
        if (loaded === shuffledUrls.length) resolve()
      }

      tile.appendChild(img)
      const shortestColumn = columns.reduce((prev, curr) =>
        prev.scrollHeight <= curr.scrollHeight ? prev : curr
      )
      shortestColumn.appendChild(tile)
    })
  })
}

async function fetchImages() {
  const { data, error } = await supabase
    .storage
    .from('mosaic')
    .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } })

  if (error) {
    console.error('Errore nel caricamento immagini:', error)
    return
  }

  const urls = await Promise.all(
    data.map(async file => {
      const { data: urlData } = await supabase
        .storage
        .from('mosaic')
        .getPublicUrl(file.name)
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

  const initialScale = 1.2

  // 1) Zoom attorno al centro del container
  const rect = panzoomContainer.getBoundingClientRect()
  const centerX = rect.width  / 2
  const centerY = rect.height / 2
  panzoomInstance.zoomAbs(centerX, centerY, initialScale)

  // 2) Calcola dimensioni del contenuto scalato e centralo
  //    scrollWidth/Height sono le dimensioni originali (prima della trasformazione)
  const contentWidth  = panzoomContainer.scrollWidth  * initialScale
  const contentHeight = panzoomContainer.scrollHeight * initialScale

  const offsetX = (rect.width  - contentWidth ) / 2
  const offsetY = (rect.height - contentHeight) / 2

  panzoomInstance.moveTo(offsetX, offsetY)
}

fetchImages()
