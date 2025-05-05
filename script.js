// script.js
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

let scale = 1, lastScale = 1;
let posX = 0, posY = 0;

// Applica trasformazione
function setTransform() {
  panzoomEl.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Limita valore tra min e max
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Centra e resetta gallery
function centerGallery() {
  scale = lastScale = 1;
  posX = posY = 0;
  setTransform();
  const offsetX = (wrapper.clientWidth  - panzoomEl.scrollWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.scrollHeight) / 2;
  posX = offsetX; posY = offsetY;
  setTransform();
}

// Costruisce la masonry gallery
function buildGallery(images) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.style.display = 'inline-block';
    col.style.verticalAlign = 'top';
    col.style.margin = '0 4px';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  let loaded = 0;
  images.forEach(src => {
    const img = new Image();
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.display = 'block';
    img.style.maxWidth = 'none';
    img.style.height = 'auto';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.appendChild(img);
      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);
      if (loaded === images.length) centerGallery();
    };
  });
}

// Carica immagini e inizializza interazioni
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    buildGallery(images);

    // Interact.js: drag + inertia + elastic limits
    interact(panzoomEl)
      .draggable({
        inertia: {
          resistance: 20,
          minSpeed: 100,
          endSpeed: 10
        },
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: wrapper,
            endOnly: true,
            elementRect: { top: -0.25, left: -0.25, bottom: 1.25, right: 1.25 }
          })
        ],
        listeners: {
          move(event) {
            posX += event.dx;
            posY += event.dy;
            setTransform();
          }
        }
      })
      .gesturable({
        listeners: {
          move(event) {
            scale = clamp(lastScale * event.scale, 0.25, 5);
            setTransform();
          },
          end() {
            lastScale = scale;
          }
        }
      });

    // Panzoom: wheel zoom centrato sul cursore
    const panzoomWheel = Panzoom(panzoomEl, { minScale: 0.25, maxScale: 5, animate: false });
    wrapper.addEventListener('wheel', e => {
      e.preventDefault();
      panzoomWheel.zoomWithWheel(e);
      const t = panzoomWheel.getTransform();
      scale = lastScale = t.scale;
      posX = t.x; posY = t.y;
    }, { passive: false });
  })
  .catch(console.error);

// Refresh gallery
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => {
    fetch('images.json')
      .then(r => r.json())
      .then(imgs => {
        buildGallery(imgs);
        centerGallery();
      });
  });

// Toggle tema chiaro/scuro
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
