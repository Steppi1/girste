// Elementi DOM
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// Stati interni
let scale           = 1,
    originX         = 0,
    originY         = 0;
let isPanning       = false,
    startX          = 0,
    startY          = 0;
let lastTouchDist   = null,
    lastTouchCenter = null;
let rafScheduled    = false;

// Rileva iOS (solo lì serve fallback touch-pan)
const isIOS = /iP(ad|hone|od)/.test(navigator.platform)
           || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const needsTouchPan = isIOS || !window.PointerEvent;

// Inizializza pinch-to-zoom (due dita)
wrapper.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    const [t1, t2] = e.touches;
    const dx = t1.clientX - t2.clientX,
          dy = t1.clientY - t2.clientY;
    lastTouchDist = Math.hypot(dx, dy);
    const r = wrapper.getBoundingClientRect();
    lastTouchCenter = {
      x: (t1.clientX + t2.clientX) / 2 - r.left,
      y: (t1.clientY + t2.clientY) / 2 - r.top
    };
  }
}, { passive: false });

// One-finger pan fallback (solo su iOS o browser senza PointerEvent)
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
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          updateTransform();
          rafScheduled = false;
        });
      }
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', e => {
    if (e.touches.length === 0) isPanning = false;
  });
}

// Pointer-events pan (desktop e tutti i browser col supporto)
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

// Wheel-zoom (desktop e mobile)
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

// Pinch-to-zoom vero (due dita)
wrapper.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const dx = t1.clientX - t2.clientX,
          dy = t1.clientY - t2.clientY;
    const dist = Math.hypot(dx, dy);
    const r = wrapper.getBoundingClientRect();
    const cx = (t1.clientX + t2.clientX) / 2 - r.left;
    const cy = (t1.clientY + t2.clientY) / 2 - r.top;

    if (lastTouchDist !== null && lastTouchCenter !== null) {
      const factor = dist / lastTouchDist;
      const newScale = Math.min(Math.max(0.1, scale * factor), 5);
      originX += cx - lastTouchCenter.x;
      originY += cy - lastTouchCenter.y;
      originX -= (cx - originX) * (newScale / scale - 1);
      originY -= (cy - originY) * (newScale / scale - 1);
      scale = newScale;
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          updateTransform();
          rafScheduled = false;
        });
      }
    }

    lastTouchDist   = dist;
    lastTouchCenter = { x: cx, y: cy };
  }
}, { passive: false });

wrapper.addEventListener('touchend', e => {
  if (e.touches.length < 2) {
    lastTouchDist   = null;
    lastTouchCenter = null;
  }
});

// Shuffle in-place
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Trasforma con GPU
function updateTransform() {
  panzoomEl.style.transform = `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// Costruisce la galleria
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));

  panzoomEl.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
  }
  const cols = panzoomEl.querySelectorAll('.column');

  const promises = images.map((src, i) => {
    const img = document.createElement('img');
    img.src      = src;
    img.loading  = 'lazy';
    img.decoding = 'async';

    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.appendChild(img);
    cols[i % n].appendChild(tile);

    return new Promise(r => { img.onload = img.onerror = r; });
  });

  Promise.all(promises).then(() => {
    const tiles = Array.from(panzoomEl.querySelectorAll('.tile'));
    panzoomEl.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const col = document.createElement('div');
      col.className = 'column';
      panzoomEl.appendChild(col);
    }
    const newCols = panzoomEl.querySelectorAll('.column');
    tiles.forEach(t => {
      const short = Array.from(newCols).reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      short.appendChild(t);
    });

    scale = window.innerWidth >= 768 ? 1 : 0.3;
    originX = (wrapper.clientWidth - panzoomEl.clientWidth * scale) / 2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
    updateTransform();

    const grp = document.querySelector('.icon-group');
    const ftr = document.querySelector('.icon-footer img');
    if (grp && ftr) ftr.style.width = `${grp.offsetWidth}px`;
  });
}

// Recupera immagini
function fetchImages() {
  fetch('images.json')
    .then(r => r.json())
    .then(buildGallery)
    .catch(e => console.error('Errore nel caricamento:', e));
}

// Avvio
fetchImages();

// Theme toggle
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
