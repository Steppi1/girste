// script.js

// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — pan/zoom state
let scale = 1, originX = 0, originY = 0;

// — track active pointers
const pointers = {};
let initialPinch = null;

// — helper: apply CSS transform
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

// — center gallery after all images loaded
function centerGallery() {
  scale = 1;
  originX = (wrapper.clientWidth  - panzoomEl.clientWidth  * scale) / 2;
  originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
  updateTransform();
}

// — build Masonry-style gallery from an array of image URLs
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
    img.src      = src;    // full-quality
    img.loading  = 'lazy';
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

// — fetch images.json and initialize gallery
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore:', e));

// — enable pointer events pan & pinch everywhere
wrapper.style.touchAction = 'none';

// — pointerdown: register pointer and maybe start pinch
wrapper.addEventListener('pointerdown', e => {
  wrapper.setPointerCapture(e.pointerId);
  pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
  const ids = Object.keys(pointers);
  if (ids.length === 2) {
    const [p1, p2] = ids.map(id => pointers[id]);
    // record initial pinch data
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    initialPinch = {
      distance: Math.hypot(dx, dy),
      scale,
      // world focal point under fingers:
      worldFocal: getWorldFocal(p1, p2)
    };
  }
});

// — pointermove: pan if one pointer, pinch if two
wrapper.addEventListener('pointermove', e => {
  if (!(e.pointerId in pointers)) return;
  const prev = pointers[e.pointerId];
  pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
  const ids = Object.keys(pointers);

  if (ids.length === 1) {
    // pan
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    originX += dx;
    originY += dy;
    updateTransform();
  } else if (ids.length === 2 && initialPinch) {
    // pinch-to-zoom
    const [a, b] = ids.map(id => pointers[id]);
    const dist    = Math.hypot(a.x - b.x, a.y - b.y);
    const ratio   = dist / initialPinch.distance;
    let newScale  = initialPinch.scale * ratio;
    newScale      = Math.min(Math.max(newScale, 0.1), 5);

    // compute local focal point in container coords
    const focal   = getDOMFocal(a, b);
    // adjust origin so worldFocal maps to focal
    originX = focal.x - initialPinch.worldFocal.x * newScale;
    originY = focal.y - initialPinch.worldFocal.y * newScale;
    scale   = newScale;
    updateTransform();
  }
});

// — pointerup / pointercancel: release pointers
wrapper.addEventListener('pointerup',   cleanupPointer);
wrapper.addEventListener('pointercancel', cleanupPointer);

function cleanupPointer(e) {
  delete pointers[e.pointerId];
  wrapper.releasePointerCapture(e.pointerId);
  if (Object.keys(pointers).length < 2) initialPinch = null;
}

// — wheel zoom for mouse
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect  = wrapper.getBoundingClientRect();
  const x     = e.clientX - rect.left;
  const y     = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(scale * (1 + delta), 0.1), 5);
  originX -= (x - originX) * (newScale/scale - 1);
  originY -= (y - originY) * (newScale/scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — helpers to compute focal points
function getWorldFocal(p1, p2) {
  const fX   = (p1.x + p2.x) / 2;
  const fY   = (p1.y + p2.y) / 2;
  const rect = wrapper.getBoundingClientRect();
  const localX = fX - rect.left;
  const localY = fY - rect.top;
  return {
    x: (localX - originX) / scale,
    y: (localY - originY) / scale
  };
}
function getDOMFocal(p1, p2) {
  const fX   = (p1.x + p2.x) / 2;
  const fY   = (p1.y + p2.y) / 2;
  const rect = wrapper.getBoundingClientRect();
  return {
    x: fX - rect.left,
    y: fY - rect.top
  };
}

// — theme toggle
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
