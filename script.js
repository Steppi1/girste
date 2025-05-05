// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — stato iniziale
let scale      = 0.6;    // dezoomato al 60%
let lastScale  = scale;
let posX        = 0;
let posY        = 0;
const minScale = 0.2;
const maxScale = 5;

// — helper: applica trasformazione
function updateTransform() {
  panzoomEl.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// — helper: clamp
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// — Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — centra e applica dezoom
function centerGallery() {
  const rect = panzoomEl.getBoundingClientRect();
  posX = (wrapper.clientWidth  - rect.width ) / 2;
  posY = (wrapper.clientHeight - rect.height) / 2;
  updateTransform();
}

// — build Masonry-style gallery
function buildGallery(images, onComplete) {
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

  let loaded = 0;
  images.forEach(src => {
    const img = document.createElement('img');
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

      // append to shortest column
      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === images.length) onComplete();
    };
  });
}

// — fetch images, init gallery + interactions
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    buildGallery(images, () => {
      // dopo il load, centro + trasformo
      scale = lastScale = 0.6;
      centerGallery();

      // — Interact.js: drag con inertia + limiti ampi
      interact(panzoomEl)
        .draggable({
          inertia: true,
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: {
                // estendi i limiti di ± wrapper size
                left:   -wrapper.clientWidth,
                right:  wrapper.clientWidth * 2,
                top:    -wrapper.clientHeight,
                bottom: wrapper.clientHeight * 2
              },
              endOnly: false
            })
          ],
          listeners: {
            move(event) {
              posX += event.dx;
              posY += event.dy;
              updateTransform();
            }
          }
        })
        .gesturable({
          inertia: true,
          listeners: {
            move(event) {
              // calcolo nuova scala
              const newScale = clamp(lastScale * event.scale, minScale, maxScale);
              // punto focale relativo all'elemento
              const rect = panzoomEl.getBoundingClientRect();
              const fx = event.clientX - rect.left;
              const fy = event.clientY - rect.top;
              // aggiusto pos per mantenere fuoco
              posX -= fx * (newScale / scale - 1);
              posY -= fy * (newScale / scale - 1);
              scale = newScale;
              updateTransform();
            },
            end() {
              lastScale = scale;
            }
          }
        });

      // — wheel zoom centrato sul cursore
      wrapper.addEventListener('wheel', e => {
        e.preventDefault();
        const rect = panzoomEl.getBoundingClientRect();
        const delta = -e.deltaY * 0.002; // sensibilità
        const newScale = clamp(scale * (1 + delta), minScale, maxScale);
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        posX -= mx * (newScale / scale - 1);
        posY -= my * (newScale / scale - 1);
        scale = lastScale = newScale;
        updateTransform();
      }, { passive: false });
    });

    // — refresh button
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoomEl.innerHTML = '';
        buildGallery(images, () => {
          scale = lastScale = 0.6;
          centerGallery();
        });
      });
  })
  .catch(console.error);

// — theme toggle
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
