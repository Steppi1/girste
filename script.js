// script.js

// DOM elements
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

let scale           = 1,
    originX         = 0,
    originY         = 0;
let isPanning       = false,
    startX          = 0,
    startY          = 0;
let lastTouchDist   = null,
    lastTouchCenter = null;
let rafScheduled    = false;

// 1) Safari/iOS detection & decide if we need the touch-pan fallback
const isSafari     = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const needsTouchPan = !window.PointerEvent || isSafari;

// 2) Pinch‐init: salva distanza e centro quando partono due tocchi
wrapper.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    const [t1, t2] = e.touches;
    const dx = t1.clientX - t2.clientX,
          dy = t1.clientY - t2.clientY;
    lastTouchDist = Math.hypot(dx, dy);
    const rect = wrapper.getBoundingClientRect();
    lastTouchCenter = {
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top
    };
  }
}, { passive: false });

// 3) One-finger pan fallback (solo su Safari/iOS o browser senza PointerEvent)
if (needsTouchPan) {
  wrapper.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      e.preventDefault();
      isPanning = true;
      startX = e.touches[0].clientX - originX;
      startY = e.touches[0].clientY - originY;
    }
  }, { passive: false });

  wrapper.addEventListener('touchmove', e => {
    if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      originX = e.touches[0].clientX - startX;
      originY = e.touches[0].clientY - startY;
      updateTransform();
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
      isPanning = false;
    }
  });
}

// 4) PointerEvents pan (desktop + non-Safari browsers)
if (!needsTouchPan) {
  wrapper.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    isPanning = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    wrapper.setPointerCapture(e.pointerId);
    wrapper.style.cursor = 'grabbing';
  });

  wrapper.addEventListener('pointermove', e => {
    if (!isPanning || rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      originX = e.clientX - startX;
      originY = e.clientY - startY;
      updateTransform();
      rafScheduled = false;
    });
  });

  wrapper.addEventListener('pointerup', () => {
    isPanning = false;
    wrapper.style.cursor = 'grab';
  });
}

// Utility: mescola un array in-place
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Applica transform al container
function updateTransform() {
  panzoomEl.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  panzoomEl.style.transformOrigin = '0 0';
  // reset + riattiva will-change per evitare thrashing a zoom medi
  panzoomEl.style.willChange = 'auto';
  requestAnimationFrame(() => {
    panzoomEl.style.willChange = 'transform';
  });
}

// Costruisce la galleria a colonne
function buildGallery(images) {
  shuffle(images);
  const numColumns = Math.floor(Math.sqrt(images.length));

  // Crea colonne
  panzoomEl.innerHTML = '';
  for (let i = 0; i < numColumns; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
  }
  const cols = panzoomEl.querySelectorAll('.column');

  // Crea tile e raccogli promise di caricamento
  const promises = images.map((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';

    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.appendChild(img);
    cols[i % cols.length].appendChild(tile);

    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  // Quando tutte le immagini sono pronte…
  Promise.all(promises).then(() => {
    const tiles = Array.from(panzoomEl.querySelectorAll('.tile'));
    panzoomEl.innerHTML = '';
    // Ricrea colonne e distribuisci per altezza minima
    for (let i = 0; i < numColumns; i++) {
      const col = document.createElement('div');
      col.className = 'column';
      panzoomEl.appendChild(col);
    }
    const newCols = panzoomEl.querySelectorAll('.column');
    tiles.forEach(tile => {
      const shortest = Array.from(newCols).reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);
    });

    // Centra inizialmente
    scale = window.innerWidth >= 768 ? 1.0 : 0.3;
    originX = (wrapper.clientWidth - panzoomEl.clientWidth * scale) / 2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
    updateTransform();

    // Allinea l'icona footer
    const group = document.querySelector('.icon-group');
    const footerIcon = document.querySelector('.icon-footer img');
    if (group && footerIcon) {
      footerIcon.style.width = `${group.offsetWidth}px`;
    }
  });
}

// Carica immagini via JSON
function fetchImages() {
  fetch('images.json')
    .then(r => r.json())
    .then(buildGallery)
    .catch(err => console.error('Errore nel caricamento:', err));
}

// Avvio
fetchImages();

// Zoom con rotella
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const x = e.clientX - rect.left,
        y = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 5);
  originX -= (x - originX) * (newScale / scale - 1);
  originY -= (y - originY) * (newScale / scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// Pinch-to-zoom (due dita)
wrapper.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const dx = t1.clientX - t2.clientX,
          dy = t1.clientY - t2.clientY;
    const dist = Math.hypot(dx, dy);
    const rect = wrapper.getBoundingClientRect();
    const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
    const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;

    if (lastTouchDist !== null && lastTouchCenter !== null) {
      const factor = dist / lastTouchDist;
      const newScale = Math.min(Math.max(0.1, scale * factor), 5);
      originX += centerX - lastTouchCenter.x;
      originY += centerY - lastTouchCenter.y;
      originX -= (centerX - originX) * (newScale / scale - 1);
      originY -= (centerY - originY) * (newScale / scale - 1);
      scale = newScale;
      updateTransform();
    }

    lastTouchDist = dist;
    lastTouchCenter = { x: centerX, y: centerY };
  }
}, { passive: false });

wrapper.addEventListener('touchend', e => {
  if (e.touches.length < 2) {
    lastTouchDist = null;
    lastTouchCenter = null;
  }
});

// Tema chiaro/scuro
const toggleThemeBtn = document.getElementById('toggle-theme');
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
  });
}

// Refresh gallery
const refreshBtn = document.querySelector('button[title="refresh"]');
if (refreshBtn) {
  refreshBtn.removeAttribute('onclick');
  refreshBtn.addEventListener('click', fetchImages);
}
