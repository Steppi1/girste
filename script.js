// — DOM references
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — Costanti per limiti di zoom
const minScale = 0.1;
const maxScale = 5;

// — Fisher–Yates shuffle per randomizzare le immagini
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — Crea la galleria in stile masonry
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

// — Inizializza tutto
fetch('images.json')
  .then(res => res.json())
  .then(images => {
    buildGallery(images, () => {
      requestAnimationFrame(() => {
        const galleryBounds = panzoomEl.getBoundingClientRect();
        const wrapperBounds = wrapper.getBoundingClientRect();

        const scaleX = wrapperBounds.width  / galleryBounds.width;
        const scaleY = wrapperBounds.height / galleryBounds.height;
        const initialScale = Math.min(scaleX, scaleY) * 0.95;

        const instance = panzoom(panzoomEl, {
          minZoom: minScale,
          maxZoom: maxScale,
          zoomSpeed: 0.065,
          beforeWheel: () => false,
          beforeMouseDown: () => true
        });

        instance.zoomAbs(0, 0, initialScale);

        const scaledW = galleryBounds.width  * initialScale;
        const scaledH = galleryBounds.height * initialScale;
        const centerX = (wrapperBounds.width  - scaledW) / 2;
        const centerY = (wrapperBounds.height - scaledH) / 2;

        instance.moveTo(centerX, centerY);

        // — Bottone refresh
        document.querySelector('button[title="refresh"]')
          .addEventListener('click', () => {
            panzoomEl.innerHTML = '';
            buildGallery(images, () => {
              requestAnimationFrame(() => {
                const newBounds = panzoomEl.getBoundingClientRect();
                const scaleX = wrapper.clientWidth  / newBounds.width;
                const scaleY = wrapper.clientHeight / newBounds.height;
                const newScale = Math.min(scaleX, scaleY) * 0.95;

                instance.zoomAbs(0, 0, newScale);

                const scaledW = newBounds.width * newScale;
                const scaledH = newBounds.height * newScale;

                instance.moveTo(
                  (wrapper.clientWidth  - scaledW) / 2,
                  (wrapper.clientHeight - scaledH) / 2
                );
              });
            });
          });
      });
    });
  })
  .catch(console.error);

// — Toggle tema chiaro/scuro
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
