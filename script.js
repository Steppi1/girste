// elementi DOM
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// stato pan/zoom
let scale   = 1,
    originX = 0,
    originY = 0;

// per gestire i pointer multipli
const pointers = new Map();    // pointerId → {x, y}
let initialPinch = null;       // dati per il pinch iniziale

// helper: applica trasform sul container
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// shuffle in-place
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// costruisce la galleria
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

    return new Promise(res => { img.onload = img.onerror = res; });
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

    // centratura e zoom iniziale
    scale = window.innerWidth >= 768 ? 1 : 0.3;
    originX = (wrapper.clientWidth - panzoomEl.clientWidth * scale) / 2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
    updateTransform();

    // allinea footer icon
    const grp = document.querySelector('.icon-group');
    const ftr = document.querySelector('.icon-footer img');
    if (grp && ftr) ftr.style.width = `${grp.offsetWidth}px`;
  });
}

// carica immagini
function fetchImages() {
  fetch('images.json')
    .then(r => r.json())
    .then(buildGallery)
    .catch(e => console.error('Errore nel caricamento:', e));
}
fetchImages();

// ——————————————
// PointerEvents PAN & PINCH
// ——————————————

wrapper.addEventListener('pointerdown', e => {
  wrapper.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  // se siamo in due pointer, inizia pinch
  if (pointers.size === 2) {
    const [p1, p2] = Array.from(pointers.values());
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    initialPinch = {
      distance: Math.hypot(dx, dy),
      center: { x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2 },
      originX, originY, scale
    };
  }
});

wrapper.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    // PAN
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    originX += dx;
    originY += dy;
    updateTransform();

  } else if (pointers.size === 2 && initialPinch) {
    // PINCH
    const [a, b] = Array.from(pointers.values());
    const dx = a.x - b.x, dy = a.y - b.y;
    const dist = Math.hypot(dx, dy);
    const center = { x: (a.x + b.x)/2, y: (a.y + b.y)/2 };
    const factor = dist / initialPinch.distance;
    const newScale = Math.min(Math.max(0.1, initialPinch.scale * factor), 5);

    // mantieni il punto “center” fisso
    originX = initialPinch.originX
            + (center.x - initialPinch.center.x)
            - (center.x - initialPinch.center.x) * (newScale/initialPinch.scale);
    originY = initialPinch.originY
            + (center.y - initialPinch.center.y)
            - (center.y - initialPinch.center.y) * (newScale/initialPinch.scale);
    scale = newScale;
    updateTransform();
  }
});

wrapper.addEventListener('pointerup', e => {
  pointers.delete(e.pointerId);
  wrapper.releasePointerCapture(e.pointerId);
  if (pointers.size < 2) initialPinch = null;
});
wrapper.addEventListener('pointercancel', e => {
  pointers.delete(e.pointerId);
  wrapper.releasePointerCapture(e.pointerId);
  if (pointers.size < 2) initialPinch = null;
});

// ——————————————
// WHEEL ZOOM
// ——————————————

wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const r = wrapper.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 5);
  originX -= (x - originX) * (newScale/scale - 1);
  originY -= (y - originY) * (newScale/scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// ——————————————
// THEME TOGGLE & REFRESH
// ——————————————

const toggleBtn = document.getElementById('toggle-theme');
if (toggleBtn) toggleBtn.addEventListener('click', () =>
  document.body.classList.toggle('light-mode')
);

const refreshBtn = document.querySelector('button[title="refresh"]');
if (refreshBtn) {
  refreshBtn.removeAttribute('onclick');
  refreshBtn.addEventListener('click', fetchImages);
}
