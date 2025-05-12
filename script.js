// script.js
import { supabase } from './supabase.js'

// — DOM references
const wrapper   = document.getElementById('wrapper')
const panzoomEl = document.getElementById('panzoom')

// — Limiti di zoom
const minScale = 0.1
const maxScale = 5

// — Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// — Costruisce la galleria masonry
function buildGallery(images, onComplete) {
  shuffle(images)
  const count = images.length
  const colsN = Math.floor(Math.sqrt(count)) || 1

  panzoomEl.innerHTML = ''
  const cols = Array.from({ length: colsN }, () => {
    const c = document.createElement('div')
    c.className = 'column'
    panzoomEl.appendChild(c)
    return c
  })

  let loaded = 0
  images.forEach(src => {
    const img = new Image()
    img.src      = src
    img.loading  = 'lazy'
    img.decoding = 'async'
    img.onload = () => {
      const tile = document.createElement('div')
      tile.className = 'tile'
      tile.appendChild(img)

      // append alla colonna più corta
      const shortest = cols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      )
      shortest.appendChild(tile)

      if (++loaded === count && typeof onComplete === 'function') {
        onComplete()
      }
    }
  })
}

// — Inizializza pan & zoom una volta costruita la galleria
function initPanzoom() {
  const gb = panzoomEl.getBoundingClientRect()
  const wb = wrapper.getBoundingClientRect()

  const scaleX = wb.width  / gb.width
  const scaleY = wb.height / gb.height
  const margin = window.matchMedia('(pointer: coarse)').matches
    ? 0.8
    : 0.95
  const initialScale = Math.min(scaleX, scaleY) * margin

  const instance = panzoom(panzoomEl, {
    minZoom:        minScale,
    maxZoom:        maxScale,
    zoomSpeed:      0.065,
    filterKey:      () => true,
    beforeWheel:    () => false,
    beforeMouseDown:() => false,
    bounds:         true,
    boundsPadding:  0.2,
  })

  instance.zoomAbs(0, 0, initialScale)

  const scaledW = gb.width  * initialScale
  const scaledH = gb.height * initialScale
  instance.moveTo(
    (wb.width  - scaledW) / 2,
    (wb.height - scaledH) / 2
  )
}

// — Carica le immagini da Supabase e monta la galleria
;(async () => {
  try {
    const { data: files, error } = await supabase
      .storage
      .from('mosaic')
      .list('', { limit: 1000 })

    if (error) {
      console.error('Errore listing bucket mosaic:', error)
      return
    }

    const images = files
      .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .map(f => {
        const { data, error: urlErr } = supabase
          .storage
          .from('mosaic')
          .getPublicUrl(f.name)
        if (urlErr) console.error(`getPublicUrl ${f.name}:`, urlErr)
        return data.publicUrl
      })
      .filter(url => !!url)

    if (!images.length) {
      console.warn('Nessuna immagine trovata nel bucket "mosaic"')
      return
    }

    buildGallery(images, initPanzoom)
  } catch (err) {
    console.error('Errore inizializzazione mosaico:', err)
  }
})()

// — Sticky-bar: toggle tema e refresh
document
  .getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  )

document
  .querySelector('button[title="refresh"]')
  .addEventListener('click', () =>
    window.location.reload()
  )
