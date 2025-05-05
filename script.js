// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato pan/zoom
let scale = 1, originX = 0, originY = 0;
let isPanning = false, startX = 0, startY = 0;
let lastTouchDist = null, lastTouchCenter = null;
let rafScheduled = false;

// — shuffle in-place
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — applica transform
function updateTransform() {
  panzoomEl.style.transform =
    `translate(${originX}px, ${originY}px) scale(${scale})`;
  panzoomEl.style.transformOrigin = '0 0';
}

// — costruisci gallery (append a “shortest column” on load)
function buildGallery(images) {
  shuffle(images);
  const nCols = Math.floor(Math.sqrt(images.length));
  const columns = [];

  // crea colonne
  panzoomEl.innerHTML = '';
  for (let i = 0; i < nCols; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  // per ogni URL, crea <img> e tile, append solo su load
  const loadPromises = images.map(src => {
    return new Promise(resolve => {
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.decoding = 'async';

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      img.onload = img.onerror = () => {
        // appendi al column più corta
        const short = columns.reduce((a, b) =>
          a.offsetHeight < b.offsetHeight ? a : b
        );
        short.appendChild(tile);
        resolve();
      };
    });
  });

  // dopo che tutte le immagini sono state append
  Promise.all(loadPromises).then(() => {
    // centro e zoom iniziale
    const isDesktop = window.innerWidth >= 768;
    scale = isDesktop ? 1 : 0.3;
    originX = (wrapper.clientWidth - panzoomEl.clientWidth * scale) / 2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
    updateTransform();

    // allinea icona footer
    const group = document.querySelector('.icon-group');
    const footerIcon = document.querySelector('.icon-footer img');
    if (group && footerIcon) {
      footerIcon.style.width = `${group.offsetWidth}px`;
    }
  });
}

// — fetch JSON e buildGallery
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore nel caricamento:', e));

// — wheel zoom
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 5);
  originX -= (x - originX) * (newScale/scale - 1);
  originY -= (y - originY) * (newScale/scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — pointerdown / pointermove / pointerup (mouse & touchpad)
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

// — touchstart per pinch init
wrapper.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    const [a, b] = e.touches;
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    lastTouchDist = Math.hypot(dx, dy);
    const rect = wrapper.getBoundingClientRect();
    lastTouchCenter = {
      x: (a.clientX + b.clientX)/2 - rect.left,
      y: (a.clientY + b.clientY)/2 - rect.top
    };
  }
}, { passive: false });

// — touchmove per pinch (due dita)
wrapper.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [a, b] = e.touches;
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    const dist = Math.hypot(dx, dy);
    const rect = wrapper.getBoundingClientRect();
    const cx = (a.clientX + b.clientX)/2 - rect.left;
    const cy = (a.clientY + b.clientY)/2 - rect.top;

    if (lastTouchDist !== null && lastTouchCenter !== null) {
      const factor = dist / lastTouchDist;
      const newScale = Math.min(Math.max(0.1, scale * factor), 5);
      originX += cx - lastTouchCenter.x;
      originY += cy - lastTouchCenter.y;
      originX -= (cx - originX) * (newScale/scale - 1);
      originY -= (cy - originY) * (newScale/scale - 1);
      scale = newScale;
      updateTransform();
    }

    lastTouchDist = dist;
    lastTouchCenter = { x: cx, y: cy };
  }
}, { passive: false });

wrapper.addEventListener('touchend', e => {
  if (e.touches.length < 2) {
    lastTouchDist = null;
    lastTouchCenter = null;
  }
});

// — tema chiaro/scuro
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );

// — refresh gallery
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    fetch('images.json')
      .then(r => r.json())
      .then(buildGallery);
  });
