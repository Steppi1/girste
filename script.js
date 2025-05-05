// script.js

// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — pan/zoom state
let scale = 1, originX = 0, originY = 0;
let initialPinchData = null;

// — detect iOS Safari for native pinch gestures
const isIOSSafari = /iP(hone|ad|od)/.test(navigator.userAgent)
                 && /Safari/.test(navigator.userAgent)
                 && !/Chrome|CriOS/.test(navigator.userAgent);

// — helper: apply transform
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// — helper: shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — center gallery after build
function centerGallery() {
  scale = 1;
  originX = (wrapper.clientWidth  - panzoomEl.clientWidth  * scale) / 2;
  originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
  updateTransform();
}

// — build Masonry-style gallery
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';

  // create columns
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  // load images
  let loaded = 0, total = images.length;
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;           // full-quality
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);
      // append to shortest column
      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);
      if (loaded === total) centerGallery();
    };
  });
}

// — fetch images.json and build
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore:', e));

// — iOS Safari: native gesture events
if (isIOSSafari) {
  wrapper.style.touchAction = 'auto';
  let initialScale = scale;

  wrapper.addEventListener('gesturestart', e => {
    e.preventDefault();
    initialScale = scale;
  });

  wrapper.addEventListener('gesturechange', e => {
    e.preventDefault();
    scale = Math.min(Math.max(initialScale * e.scale, 0.1), 5);
    updateTransform();
  });
}

// — custom pan & pinch for non-iOS Safari
const pointers = new Map();

wrapper.addEventListener('pointerdown', e => {
  if (isIOSSafari) return;
  wrapper.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [p1, p2] = Array.from(pointers.values());
    initialPinchData = {
      distance: Math.hypot(p1.x - p2.x, p1.y - p2.y),
      center:   { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      originX, originY, scale
    };
  }
});

wrapper.addEventListener('pointermove', e => {
  if (isIOSSafari) return;
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    // pan
    originX += e.clientX - prev.x;
    originY += e.clientY - prev.y;
    updateTransform();
  } else if (pointers.size === 2 && initialPinchData) {
    // pinch-to-zoom
    const [a, b] = Array.from(pointers.values());
    const dist   = Math.hypot(a.x - b.x, a.y - b.y);
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const factor = dist / initialPinchData.distance;
    const newScale = Math.min(
      Math.max(initialPinchData.scale * factor, 0.1),
      5
    );
    originX = initialPinchData.originX
            + (center.x - initialPinchData.center.x)
            - (center.x - initialPinchData.center.x) * (newScale / initialPinchData.scale);
    originY = initialPinchData.originY
            + (center.y - initialPinchData.center.y)
            - (center.y - initialPinchData.center.y) * (newScale / initialPinchData.scale);
    scale = newScale;
    updateTransform();
  }
});

wrapper.addEventListener('pointerup', e => {
  if (isIOSSafari) return;
  pointers.delete(e.pointerId);
  wrapper.releasePointerCapture(e.pointerId);
  if (pointers.size < 2) initialPinchData = null;
});

// — wheel zoom (desktop)
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(scale * (1 + delta), 0.1), 5);
  originX -= (x - originX) * (newScale/scale - 1);
  originY -= (y - originY) * (newScale/scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — theme toggle
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );

// — refresh button
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    fetch('images.json')
      .then(r => r.json())
      .then(buildGallery);
  });
