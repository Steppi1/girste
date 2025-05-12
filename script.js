// script.js
import { getImageUrls, getPosts, getSplashTxts } from './supabase.js'
import panzoom from 'https://unpkg.com/panzoom@9.4.3/dist/panzoom.esm.js'

// — DOM references
const wrapper   = document.getElementById('wrapper')
const panzoomEl = document.getElementById('panzoom')

// — Limiti di zoom
const minScale = 0.1
const maxScale = 5

// — Fisher–Yates shuffle per randomizzare un array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// — Costruisce la galleria in stile masonry + lazy-load
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

      // trova la colonna più corta
      const shortest = cols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      )
      shortest.appendChild(tile)

      loaded++
      if (loaded === count && typeof onComplete === 'function') {
        onComplete()
      }
    }
  })
}

// — Inizializzazione principale (IIFE async)
;(async () => {
  try {
    // 1) Prendo le immagini dal bucket Supabase
    const images = await getImageUrls('mosaic')
    console.log('Immagini caricate:', images)

    if (images.length === 0) {
      console.warn('Nessuna immagine trovata nel bucket "mosaic"!')
      return
    }

    // 2) Costruisco la gallery e avvio panzoom al termine
    buildGallery(images, () => {
      requestAnimationFrame(() => {
        const gb = panzoomEl.getBoundingClientRect()
        const wb = wrapper.getBoundingClientRect()

        const scaleX = wb.width  / gb.width
        const scaleY = wb.height / gb.height
        const isMobile = window.matchMedia('(pointer: coarse)').matches
        const margin  = isMobile ? 0.8 : 0.95
        const initialScale = Math.min(scaleX, scaleY) * margin

        const instance = panzoom(panzoomEl, {
          minZoom: minScale,
          maxZoom: maxScale,
          zoomSpeed: 0.065,
          filterKey:       () => true,
          beforeWheel:     () => false,
          beforeMouseDown: () => false,
          bounds: true,
          boundsPadding: 0.2,
        })

        instance.zoomAbs(0, 0, initialScale)
        const scaledW = gb.width  * initialScale
        const scaledH = gb.height * initialScale
        instance.moveTo((wb.width - scaledW) / 2, (wb.height - scaledH) / 2)
      })
    })

    // 3) (Opzionale) Carico e monto post e splash-text se hai sezioni dedicate
    // const posts = await getPosts()
    // const splashTxts = await getSplashTxts()
    // // Es. montaggio post e frasi

  } catch (err) {
    console.error('Errore in inizializzazione script.js:', err)
  }
})()

// — Toggle tema chiaro/scuro
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  )

// — Bottone “refresh”
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => window.location.reload())
