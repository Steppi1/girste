// script.js
import { getImageUrls, getPosts, getSplashTxts } from './supabase.js'
import panzoom from 'https://unpkg.com/panzoom@9.4.3/dist/panzoom.esm.js'

// — DOM refs
const wrapper   = document.getElementById('wrapper')
const panzoomEl = document.getElementById('panzoom')

// — Limiti zoom
const minScale = 0.1, maxScale = 5

// — Shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// — Build masonry
function buildGallery(images, onComplete) {
  shuffle(images)
  const n = Math.floor(Math.sqrt(images.length))
  panzoomEl.innerHTML = ''
  const cols = Array.from({ length: n }, () => {
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
      const shortest = cols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      )
      shortest.appendChild(tile)
      if (++loaded === images.length && onComplete) onComplete()
    }
  })
}

// — Funzione di init
;(async () => {
  // Carico TUTTO da supabase
  const [images, posts, splashTxts] = await Promise.all([
    getImageUrls(),
    getPosts(),
    getSplashTxts()
  ])

  // --- 1) Galleria
  buildGallery(images, () => {
    requestAnimationFrame(() => {
      const gb = panzoomEl.getBoundingClientRect()
      const wb = wrapper.getBoundingClientRect()
      const scaleX = wb.width  / gb.width
      const scaleY = wb.height / gb.height
      const isMobile = window.matchMedia('(pointer: coarse)').matches
      const margin = isMobile ? 0.8 : 0.95
      const initialScale = Math.min(scaleX, scaleY) * margin

      const instance = panzoom(panzoomEl, {
        minZoom: minScale, maxZoom: maxScale,
        zoomSpeed: 0.065, filterKey: () => true,
        beforeWheel: () => false, beforeMouseDown: () => false,
        bounds: true, boundsPadding: 0.2
      })
      instance.zoomAbs(0, 0, initialScale)
      const scaledW = gb.width  * initialScale
      const scaledH = gb.height * initialScale
      instance.moveTo((wb.width - scaledW)/2, (wb.height - scaledH)/2)
    })
  })

  // --- 2) Monta i post nella tua sezione blog (esempio)
  const blogEl = document.getElementById('blog')
  if (blogEl && posts.length) {
    blogEl.innerHTML = posts.map(p =>
      `<article>
         <h2>${p.title}</h2>
         <time>${new Date(p.date).toLocaleDateString()}</time>
         <div>${p.content}</div>
       </article>`
    ).join('')
  }

  // --- 3) Mostra le splash texts (esempio)
  const splashEl = document.getElementById('splash')
  if (splashEl && splashTxts.length) {
    splashEl.textContent =
      splashTxts[Math.floor(Math.random() * splashTxts.length)]
  }
})()

// — Toggle tema
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  )

// — Refresh button
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => window.location.reload())
