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

// — Inizializzazione principale
fetch('images.json')
  .then(res => res.json())
  .then(images => {
    buildGallery(images, () => {
      requestAnimationFrame(() => {
        const galleryBounds = panzoomEl.getBoundingClientRect();
        const wrapperBounds = wrapper.getBoundingClientRect();

        const scaleX = wrapperBounds.width  / galleryBounds.width;
        const scaleY = wrapperBounds.height / galleryBounds.height;
        const isMobile = window.matchMedia('(pointer: coarse)').matches;
        const marginFactor = isMobile ? 0.8 : 0.95;
        const initialScale = Math.min(scaleX, scaleY) * marginFactor;

        const instance = panzoom(panzoomEl, {
          minZoom: minScale,
          maxZoom: maxScale,
          zoomSpeed: 0.065,
          filterKey:   () => true,   // lascia gestire ogni tasto
          beforeWheel: () => false,  // non ignorare mai lo scroll
          beforeMouseDown: () => false, // permette il drag con mouse (pan) :contentReference[oaicite:0]{index=0}
          bounds: true,
          boundsPadding: 0.2
        });

        instance.zoomAbs(0, 0, initialScale);

        const scaledW = galleryBounds.width  * initialScale;
        const scaledH = galleryBounds.height * initialScale;
        const centerX = (wrapperBounds.width  - scaledW) / 2;
        const centerY = (wrapperBounds.height - scaledH) / 2;
        instance.moveTo(centerX, centerY);
      });
    });
  })
  .catch(console.error);

// — Toggle tema chiaro/scuro
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
  

// — Bottone "refresh" identico al browser
document.querySelector('button[title="refresh"]')
  .addEventListener('click', () => window.location.reload());
