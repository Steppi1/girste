// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato pan/zoom
let scale = 1, originX = 0, originY = 0;
let lastScale = 1, lastOriginX = 0, lastOriginY = 0;
let gestureCenterX = 0, gestureCenterY = 0;
let gestureStartOriginX = 0, gestureStartOriginY = 0;

// — applica trasformazione
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px, 0) scale(${scale})`;
}

// — centra la gallery al caricamento
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

  let loaded = 0;
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.srcset =
      `${src.replace(/(\.\w+)$/, '_300$1')} 300w, ` +
      `${src.replace(/(\.\w+)$/, '_600$1')} 600w, ` +
      `${src.replace(/(\.\w+)$/, '_1200$1')} 1200w`;
    img.sizes    = '300px';
    img.loading  = 'lazy';
    img.decoding = 'async';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);
      const shortest = cols.reduce((a,b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);
      if (loaded === images.length) centerGallery();
    };
  });
}

// — fetch + init gallery
fetch('images.json')
  .then(r => r.json())
  .then(buildGallery)
  .catch(e => console.error('Errore:', e));

// — setup Hammer.js per pan & pinch
const hammer = new Hammer(wrapper);
hammer.get('pinch').set({ enable: true });
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// Pan
hammer.on('panstart', () => {
  lastOriginX = originX;
  lastOriginY = originY;
});
hammer.on('panmove', ev => {
  originX = lastOriginX + ev.deltaX;
  originY = lastOriginY + ev.deltaY;
  updateTransform();
});

// Pinch
hammer.on('pinchstart', ev => {
  lastScale = scale;
  const rect = wrapper.getBoundingClientRect();
  gestureCenterX = ev.center.x - rect.left;
  gestureCenterY = ev.center.y - rect.top;
  gestureStartOriginX = originX;
  gestureStartOriginY = originY;
});
hammer.on('pinchmove', ev => {
  const newScale = Math.max(0.1, Math.min(5, lastScale * ev.scale));
  originX = gestureCenterX - (gestureCenterX - gestureStartOriginX) * (newScale / lastScale);
  originY = gestureCenterY - (gestureCenterY - gestureStartOriginY) * (newScale / lastScale);
  scale = newScale;
  updateTransform();
});

// — zoom con wheel (desktop)
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const cx   = e.clientX - rect.left;
  const cy   = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(5, Math.max(0.1, scale * (1 + delta)));
  originX = cx - (cx - originX) * (newScale / scale);
  originY = cy - (cy - originY) * (newScale / scale);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — refresh & theme toggle (invariati)
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    scale = 1; originX = 0; originY = 0;
    fetch('images.json')
      .then(r => r.json())
      .then(buildGallery);
  });

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
