// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato pan/zoom
let scale = 1;
let originX = 0, originY = 0;

// — applica trasformazione
function updateTransform() {
  panzoomEl.style.transform =
    `translate3d(${originX}px, ${originY}px,0) scale(${scale})`;
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
      // append alla colonna più corta
      const shortest = cols.reduce((a,b)=> a.offsetHeight<b.offsetHeight?a:b);
      shortest.appendChild(tile);
      if (loaded === total) centerGallery();
    };
  });
}

// — fetch + init gallery
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    buildGallery(images);
  })
  .catch(e=>console.error(e));

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
let lastScale = 1;
interact(wrapper)
  .gesturable({
    listeners: {
      start() {
        lastScale = scale;
      },
      move(event) {
        // calcola nuovo scale
        scale = Math.max(0.1, Math.min(5, lastScale * event.scale));
        // mantieni il focus al centro del gesto
        const rect = wrapper.getBoundingClientRect();
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;
        // aggiorna origin per tenere fermo il punto di focus
        originX = cx - (cx - originX) * (scale / lastScale);
        originY = cy - (cy - originY) * (scale / lastScale);
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
  let newScale = Math.min(5, Math.max(0.1, scale * (1 + delta)));
  originX = cx - (cx - originX) * (newScale / scale);
  originY = cy - (cy - originY) * (newScale / scale);
  scale = newScale;
  updateTransform();
}, { passive: false });

// — refresh & tema (invariati)
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    panzoomEl.innerHTML = '';
    fetch('images.json')
      .then(r=>r.json())
      .then(imgs => {
        // reset stato
        scale = 1; originX = 0; originY = 0;
        buildGallery(imgs);
      });
  });

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
