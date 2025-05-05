// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato pan/zoom
let scale = 1;
let originX = 0, originY = 0;

// — variabili per pinch nativo
let lastScale = 1;
let gestureStartOriginX = 0;
let gestureStartOriginY = 0;

// — applica trasformazione
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// — centra la gallery (solo al caricamento)
function centerGallery() {
  originX = (wrapper.clientWidth  - panzoomEl.clientWidth * scale)  / 2;
  originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
  updateTransform();
}

// — shuffle Fisher-Yates
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — build Masonry-style
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const cols = [];
  panzoomEl.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    cols.push(col);
  }

  let loaded = 0, total = images.length;
  images.forEach(src => {
    const img = document.createElement('img');
    img.src      = src;
    img.loading  = 'lazy';
    img.decoding = 'async';
    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);
      const shortest = cols.reduce((a,b)=> a.offsetHeight < b.offsetHeight ? a : b);
      shortest.appendChild(tile);
      if (loaded === total) centerGallery();
    };
  });
}

// — fetch + init gallery
fetch('images.json')
  .then(r => r.json())
  .then(images => { buildGallery(images); })
  .catch(e => console.error(e));

// — drag con Interact.js
interact(wrapper)
  .draggable({
    inertia: true,
    listeners: {
      move(event) {
        originX += event.dx;
        originY += event.dy;
        updateTransform();
      }
    }
  });

// — pinch con Interact.js
interact(wrapper)
  .gesturable({
    listeners: {
      start(event) {
        lastScale = scale;
      },
      move(event) {
        const newScale = Math.max(0.1, Math.min(5, lastScale * event.scale));
        const rect = wrapper.getBoundingClientRect();
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;
        originX = cx - (cx - originX) * (newScale / scale);
        originY = cy - (cy - originY) * (newScale / scale);
        scale = newScale;
        updateTransform();
      }
    }
  });

// — zoom con wheel (desktop)
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(5, Math.max(0.1, scale * (1 + delta)));
  originX = cx - (cx - originX) * (newScale / scale);
  originY = cy - (cy - originY) * (newScale / scale);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — refresh & tema (invariati)
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    scale = 1; originX = 0; originY = 0;
    fetch('images.json')
      .then(r => r.json())
      .then(imgs => buildGallery(imgs));
  });

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );

// — GESTURE NATIVE iOS / Safari MOBILE —  
wrapper.addEventListener('gesturestart', e => {
  lastScale = scale;
  gestureStartOriginX = originX;
  gestureStartOriginY = originY;
});

wrapper.addEventListener('gesturechange', e => {
  e.preventDefault();
  // nuovo scale
  const unclamped = lastScale * e.scale;
  const newScale = Math.max(0.1, Math.min(5, unclamped));
  // punto di focalizzazione
  const rect = wrapper.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  // calcola origine rispetto allo scale iniziale
  originX = cx - (cx - gestureStartOriginX) * (newScale / lastScale);
  originY = cy - (cy - gestureStartOriginY) * (newScale / lastScale);
  scale = newScale;
  updateTransform();
});

wrapper.addEventListener('gestureend', () => {
  lastScale = scale;
});

// — HAMMER.JS PINCH (fallback mobile)
const hammer = new Hammer(wrapper);
hammer.get('pinch').set({ enable: true });

let hammerStartScale;
hammer.on('pinchstart', () => {
  hammerStartScale = scale;
});

hammer.on('pinchmove', ev => {
  // calcola nuovo scale e mantieni il focus
  const newScale = Math.max(0.1, Math.min(5, hammerStartScale * ev.scale));
  const rect = wrapper.getBoundingClientRect();
  const cx = ev.center.x - rect.left;
  const cy = ev.center.y - rect.top;

  originX = cx - (cx - originX) * (newScale / scale);
  originY = cy - (cy - originY) * (newScale / scale);
  scale = newScale;
  updateTransform();
});
