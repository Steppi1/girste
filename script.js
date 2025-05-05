// script.js

// DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// pan/zoom state
let scale = 1, originX = 0, originY = 0;
const touchData = {
  initialX: 0, initialY: 0,
  initialOriginX: 0, initialOriginY: 0,
  initialPinchDistance: 0,
  initialPinchCenter: { x: 0, y: 0 },
  initialPinchScale: 1,
  isPinching: false
};

// shuffle helper
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// apply CSS transform
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// build Masonry-style gallery
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  let loaded = 0, total = images.length;
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;            // full-quality image
    img.loading = 'lazy';
    img.decoding = 'async';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === total) {
        centerGallery();
      }
    };
  });
}

// center the gallery
function centerGallery() {
  scale = 1;
  originX = (wrapper.clientWidth  - panzoomEl.clientWidth  * scale) / 2;
  originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
  updateTransform();
}

// fetch & init
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore:', e));

// TOUCH EVENTS for mobile
if ('ontouchstart' in window) {
  wrapper.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches;
    if (t.length === 1) {
      touchData.isPinching = false;
      touchData.initialX = t[0].clientX;
      touchData.initialY = t[0].clientY;
      touchData.initialOriginX = originX;
      touchData.initialOriginY = originY;
    } else if (t.length === 2) {
      touchData.isPinching = true;
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      touchData.initialPinchDistance = Math.hypot(dx, dy);
      touchData.initialPinchCenter = {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2
      };
      touchData.initialOriginX = originX;
      touchData.initialOriginY = originY;
      touchData.initialPinchScale = scale;
    }
  }, { passive: false });

  wrapper.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches;
    if (t.length === 1 && !touchData.isPinching) {
      const dx = t[0].clientX - touchData.initialX;
      const dy = t[0].clientY - touchData.initialY;
      originX = touchData.initialOriginX + dx;
      originY = touchData.initialOriginY + dy;
      updateTransform();
    } else if (t.length === 2 && touchData.isPinching) {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      const dist = Math.hypot(dx, dy);
      const center = {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2
      };
      const factor = dist / touchData.initialPinchDistance;
      const newScale = Math.min(Math.max(0.1, touchData.initialPinchScale * factor), 5);

      originX = touchData.initialOriginX
              + (center.x - touchData.initialPinchCenter.x)
              - (center.x - touchData.initialPinchCenter.x) * (newScale / touchData.initialPinchScale);
      originY = touchData.initialOriginY
              + (center.y - touchData.initialPinchCenter.y)
              - (center.y - touchData.initialPinchCenter.y) * (newScale / touchData.initialPinchScale);
      scale = newScale;
      updateTransform();
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', e => {
    if (e.touches.length < 2) {
      touchData.isPinching = false;
    }
  });
}
// POINTER & WHEEL EVENTS for desktop
else {
  // wheel zoom
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

  // pointer pan & pinch
  const pointers = new Map();
  let initialPinch = null;

  wrapper.addEventListener('pointerdown', e => {
    wrapper.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      initialPinch = {
        distance: Math.hypot(p1.x - p2.x, p1.y - p2.y),
        center:   { x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2 },
        originX, originY, scale
      };
    }
  });

  wrapper.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      originX += e.clientX - prev.x;
      originY += e.clientY - prev.y;
      updateTransform();
    } else if (pointers.size === 2 && initialPinch) {
      const [a, b] = Array.from(pointers.values());
      const dist   = Math.hypot(a.x - b.x, a.y - b.y);
      const center = { x:(a.x+b.x)/2, y:(a.y+b.y)/2 };
      const factor = dist / initialPinch.distance;
      const newScale = Math.min(Math.max(0.1, initialPinch.scale * factor), 5);

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
}

// theme toggle & refresh
document.getElementById('toggle-theme')
  .addEventListener('click', () => document.body.classList.toggle('light-mode'));

document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    fetch('images.json').then(r => r.json()).then(buildGallery);
  });
