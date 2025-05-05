// script.js

// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — pan/zoom state
let scale = 1, originX = 0, originY = 0;
let initialPinch = null;
const pointers = new Map();

// — disable native touch actions so pointer events handle everything
wrapper.style.touchAction = 'none';

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
    img.src      = src;    // full-quality image
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


// — POINTER PAN & PINCH (all devices)
wrapper.addEventListener('pointerdown', e => {
  wrapper.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [p1, p2] = Array.from(pointers.values());
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    initialPinch = {
      distance: Math.hypot(dx, dy),
      scale,
      originX,
      originY,
      center: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    };
  }
});

wrapper.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    // pan
    originX += e.clientX - prev.x;
    originY += e.clientY - prev.y;
    updateTransform();
  } else if (pointers.size === 2 && initialPinch) {
    // pinch-to-zoom
    const [a, b] = Array.from(pointers.values());
    const dx = a.x - b.x, dy = a.y - b.y;
    const dist = Math.hypot(dx, dy);
    const factor = dist / initialPinch.distance;
    let newScale = initialPinch.scale * factor;
    newScale = Math.min(Math.max(newScale, 0.1), 5);

    // focal point in wrapper coords
    const rect = wrapper.getBoundingClientRect();
    const focalX = initialPinch.center.x - rect.left;
    const focalY = initialPinch.center.y - rect.top;

    // adjust origin so focal point stays under fingers
    originX = focalX - (focalX - initialPinch.originX) * (newScale / initialPinch.scale);
    originY = focalY - (focalY - initialPinch.originY) * (newScale / initialPinch.scale);

    scale = newScale;
    updateTransform();
  }
});

wrapper.addEventListener('pointerup', e => {
  pointers.delete(e.pointerId);
  wrapper.releasePointerCapture(e.pointerId);
  if (pointers.size < 2) initialPinch = null;
});

// — WHEEL ZOOM (mouse wheel)
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect  = wrapper.getBoundingClientRect();
  const x     = e.clientX - rect.left;
  const y     = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  let newScale = scale * (1 + delta);
  newScale = Math.min(Math.max(newScale, 0.1), 5);

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
