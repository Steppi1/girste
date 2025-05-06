const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

const initialScale = 0.4;
const minScale     = 0.1;
const maxScale     = 5;

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function buildGallery(images, onComplete) {
  shuffle(images);
  const n    = Math.floor(Math.sqrt(images.length));
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
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onload = () => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const shortest = cols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      loaded++;
      if (loaded === images.length && onComplete) onComplete();
    };
  });
}

fetch('images.json')
  .then(res => res.json())
  .then(images => {
    buildGallery(images, () => {
      panzoomEl.style.transform = `scale(${initialScale})`;

      const instance = panzoom(panzoomEl, {
        minZoom: minScale,
        maxZoom: maxScale,
        zoomSpeed: 0.065,
        filterKey: () => true,
        beforeWheel: () => false,
        beforeMouseDown: () => true
      });

      const rect = panzoomEl.getBoundingClientRect();
      const centerX = (wrapper.clientWidth  - rect.width) / 2;
      const centerY = (wrapper.clientHeight - rect.height) / 2;
      instance.pan(centerX, centerY);

      document.querySelector('button[title="refresh"]')
        .addEventListener('click', () => {
          panzoomEl.innerHTML = '';
          buildGallery(images, () => {
            panzoomEl.style.transform = `scale(${initialScale})`;
            instance.reset();
            const r = panzoomEl.getBoundingClientRect();
            instance.pan(
              (wrapper.clientWidth - r.width) / 2,
              (wrapper.clientHeight - r.height) / 2
            );
          });
        });
    });
  })
  .catch(console.error);

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
