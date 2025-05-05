// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato
let scale      = 0.4;    // dezoom iniziale (40%)
let posX        = 0;
let posY        = 0;
const minScale = 0.1;
const maxScale = 5;

// — helper: applica trasform
function updateTransform() {
  panzoomEl.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// — clamp
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// — shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — centra inizialmente
function centerInitial() {
  const rect = panzoomEl.getBoundingClientRect();
  posX = (wrapper.clientWidth  - rect.width ) / 2;
  posY = (wrapper.clientHeight - rect.height) / 2;
  updateTransform();
}

// — build gallery
function buildGallery(images, onComplete) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const cols = [];
  panzoomEl.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'column';
    panzoomEl.appendChild(c);
    cols.push(c);
  }

  let loaded = 0;
  images.forEach(src => {
    const img = new Image();
    img.src      = src;
    img.loading  = 'lazy';
    img.decoding = 'async';
    img.style.display  = 'block';
    img.style.maxWidth = 'none';
    img.style.height   = 'auto';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const shortest = cols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === images.length && onComplete) onComplete();
    };
  });
}

// — inizializza
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    // costruisci e poi centra
    buildGallery(images, () => {
      centerInitial();

      // attiva pan-zoom
      panzoom(panzoomEl, e => {
        posX += e.dx;
        posY += e.dy;

        if (e.dz) {
          const old = scale;
          scale = clamp(old * (1 + e.dz), minScale, maxScale);
          const rect = panzoomEl.getBoundingClientRect();
          const fx = e.x - rect.left;
          const fy = e.y - rect.top;
          posX -= fx * (scale/old - 1);
          posY -= fy * (scale/old - 1);
        }

        const limitX = wrapper.clientWidth  * 2;
        const limitY = wrapper.clientHeight * 2;
        posX = clamp(posX, -limitX, limitX);
        posY = clamp(posY, -limitY, limitY);

        updateTransform();
      });
    });

    // refresh
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoomEl.innerHTML = '';
        scale = 0.4; posX = posY = 0;
        buildGallery(images, centerInitial);
      });
  })
  .catch(console.error);

// — tema toggle
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
