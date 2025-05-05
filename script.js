// script.js

// DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// stato pan/zoom
let scale = 1, originX = 0, originY = 0;
let initialPinch = null;
const pointers = new Map();

// riconosciamo desktop
const isDesktop = window.innerWidth >= 768;

// shuffle e updateTransform
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// build gallery
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

  let loadedCount = 0;
  const total = images.length;

  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;       // qualità originale
    img.loading = 'lazy';
    img.decoding = 'async';

    img.onload = () => {
      loadedCount++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const short = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      short.appendChild(tile);

      if (loadedCount === total) {
        centerGallery();
      }
    };
  });
}

// centra gallery (solo desktop)
function centerGallery() {
  if (!isDesktop) return;
  scale = 1;
  originX = (wrapper.clientWidth  - panzoomEl.clientWidth  * scale) / 2;
  originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
  updateTransform();
}

// fetch & build
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore:', e));

// pan/zoom custom (solo desktop)
if (isDesktop) {
  // wheel zoom
  wrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const r = wrapper.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const d = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale * (1 + d)), 5);
    originX -= (x - originX) * (newScale/scale - 1);
    originY -= (y - originY) * (newScale/scale - 1);
    scale = newScale;
    updateTransform();
  }, { passive: false });

  // pointer pan & pinch
  wrapper.addEventListener('pointerdown', e => {
    wrapper.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      initialPinch = {
        distance: Math.hypot(p1.x - p2.x, p1.y - p2.y),
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
      originX += e.clientX - prev.x;
      originY += e.clientY - prev.y;
      updateTransform();
    } else if (pointers.size === 2 && initialPinch) {
      const [a, b] = Array.from(pointers.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const center = { x: (a.x + b.x)/2, y: (a.y + b.y)/2 };
      const factor = dist / initialPinch.distance;
      const newScale = Math.min(
        Math.max(0.1, initialPinch.scale * factor),
        5
      );

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
    fetch('images.json')
      .then(r => r.json())
      .then(buildGallery);
  });

// Chrome-only: ridimensiona footer icons text
window.addEventListener('load', () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) return;

  const icons = document.querySelectorAll('#sticky-bar .icon-group img');
  const footerImg = document.querySelector('#sticky-bar .icon-footer img');
  let totalWidth = 0;
  icons.forEach(img => {
    totalWidth += img.getBoundingClientRect().width;
  });
  footerImg.style.width = `${totalWidth}px`;
  footerImg.style.height = 'auto';
});
