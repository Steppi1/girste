// ————— DOM refs —————
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// ————— Stato pan/zoom —————
let scale   = 1,
    originX = 0,
    originY = 0;

// ————— Per pinch touch su mobile —————
let lastTouchDist   = null,
    lastTouchCenter = null;

// ————— Unico metodo per applicare pan & zoom —————
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// ————— Shuffle array —————
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ————— Build gallery via <canvas> —————
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));

  // svuota e crea n colonne
  panzoomEl.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
  }
  const cols = panzoomEl.querySelectorAll('.column');

  // per ogni URL creo un off-DOM Image e un <canvas>
  const promises = images.map((src, i) => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // canvas a risoluzione naturale
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // append nella colonna
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.appendChild(canvas);
        cols[i % n].appendChild(tile);
        resolve();
      };
      img.onerror = () => resolve();
    });
  });

  Promise.all(promises).then(() => {
    // dopo il load, riallineo distribuendo per altezza minima
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

    // centratura iniziale
    scale   = window.innerWidth >= 768 ? 1 : 0.3;
    originX = (wrapper.clientWidth  - panzoomEl.clientWidth  * scale)/2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale)/2;
    updateTransform();

    // allinea icona footer
    const grp = document.querySelector('.icon-group');
    const ftr = document.querySelector('.icon-footer img');
    if (grp && ftr) ftr.style.width = `${grp.offsetWidth}px`;
  });
}

// ————— Fetch & avvia buildGallery —————
function fetchImages() {
  fetch('images.json')
    .then(r => r.json())
    .then(buildGallery)
    .catch(e => console.error('Errore nel caricamento:', e));
}
fetchImages();

// ————— Pan con un dito (mobile) —————
wrapper.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    originX = originX; originY = originY; // inizializzazione
    wrapper._panStart = { x: t.clientX - originX, y: t.clientY - originY };
  }
  if (e.touches.length === 2) {
    // pinch init
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

wrapper.addEventListener('touchmove', e => {
  if (e.touches.length === 1 && wrapper._panStart) {
    e.preventDefault();
    const t = e.touches[0];
    originX = t.clientX - wrapper._panStart.x;
    originY = t.clientY - wrapper._panStart.y;
    updateTransform();
  }
  else if (e.touches.length === 2 && lastTouchDist !== null) {
    e.preventDefault();
    const [a, b] = e.touches;
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    const dist = Math.hypot(dx, dy);
    const rect = wrapper.getBoundingClientRect();
    const center = {
      x: (a.clientX + b.clientX)/2 - rect.left,
      y: (a.clientY + b.clientY)/2 - rect.top
    };

    const factor = dist / lastTouchDist;
    const newScale = Math.min(Math.max(0.1, scale * factor), 5);

    // mantieni il pinch-center fermo
    originX += center.x - lastTouchCenter.x;
    originY += center.y - lastTouchCenter.y;
    originX -= (center.x - originX) * (newScale/scale - 1);
    originY -= (center.y - originY) * (newScale/scale - 1);

    scale = newScale;
    updateTransform();

    lastTouchDist   = dist;
    lastTouchCenter = center;
  }
}, { passive: false });

wrapper.addEventListener('touchend', e => {
  delete wrapper._panStart;
  if (e.touches.length < 2) {
    lastTouchDist = null;
    lastTouchCenter = null;
  }
});

// ————— PointerEvents pan/pinch (desktop + touchpad + support) —————
{
  const active = new Map(); // pointerId→{x,y}
  let pinchData = null;

  wrapper.addEventListener('pointerdown', e => {
    wrapper.setPointerCapture(e.pointerId);
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (active.size === 2) {
      const [p1, p2] = Array.from(active.values());
      const dx = p1.x - p2.x, dy = p1.y - p2.y;
      pinchData = {
        distance: Math.hypot(dx, dy),
        center: { x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2 },
        originX, originY, scale
      };
    }
  });

  wrapper.addEventListener('pointermove', e => {
    if (!active.has(e.pointerId)) return;
    const prev = active.get(e.pointerId);
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (active.size === 1) {
      // pan
      originX += e.clientX - prev.x;
      originY += e.clientY - prev.y;
      updateTransform();
    }
    else if (active.size === 2 && pinchData) {
      const [a, b] = Array.from(active.values());
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      const center = { x:(a.x+b.x)/2, y:(a.y+b.y)/2 };

      const factor = dist / pinchData.distance;
      const newScale = Math.min(Math.max(0.1, pinchData.scale * factor), 5);

      originX = pinchData.originX
              + (center.x - pinchData.center.x)
              - (center.x - pinchData.center.x)*(newScale/pinchData.scale);
      originY = pinchData.originY
              + (center.y - pinchData.center.y)
              - (center.y - pinchData.center.y)*(newScale/pinchData.scale);

      scale = newScale;
      updateTransform();
    }
  });

  wrapper.addEventListener('pointerup',   e => {
    active.delete(e.pointerId);
    wrapper.releasePointerCapture(e.pointerId);
    if (active.size < 2) pinchData = null;
  });
  wrapper.addEventListener('pointercancel', e => {
    active.delete(e.pointerId);
    wrapper.releasePointerCapture(e.pointerId);
    if (active.size < 2) pinchData = null;
  });
}

// ————— Wheel zoom —————
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const r = wrapper.getBoundingClientRect();
  const x = e.clientX - r.left,
        y = e.clientY - r.top;
  const d = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + d)), 5);

  originX -= (x - originX)*(newScale/scale - 1);
  originY -= (y - originY)*(newScale/scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// ————— Theme toggle & refresh —————
document.getElementById('toggle-theme')
  .addEventListener('click', () => document.body.classList.toggle('light-mode'));

const rBtn = document.querySelector('button[title="refresh"]');
rBtn.removeAttribute('onclick');
rBtn.addEventListener('click', fetchImages);
