// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — helper: centra e resetta la gallery
function centerGallery(panzoomInstance) {
  panzoomInstance.reset();
  const offsetX = (wrapper.clientWidth  - panzoomEl.clientWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.clientHeight) / 2;
  panzoomInstance.pan(offsetX, offsetY, { animate: true });
}

// — helper: mescola l’array (Fisher-Yates)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — build Masonry-style gallery
function buildGallery(images, panzoomInstance) {
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
      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === total) centerGallery(panzoomInstance);
    };
  });
}

// — fetch immagini e inizializza Panzoom + gallery
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    // 1) Inizializza Panzoom SENZA contain → panning/zoom liberi
    const panzoom = Panzoom(panzoomEl, {
      maxScale: 5,
      minScale: 0.1,
      animate: true,
      step: 0.3
    });

    // 2) Zoom via rotellina
    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });
    // 3) Pan su pointerdown
    wrapper.addEventListener('pointerdown', panzoom.handlePointerDown);

    // 4) Build + centra
    buildGallery(images, panzoom);

    // 5) Refresh gallery
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoom.reset();
        panzoomEl.innerHTML = '';
        fetch('images.json')
          .then(r => r.json())
          .then(imgs => buildGallery(imgs, panzoom));
      });
  })
  .catch(e => console.error('Errore:', e));

// — toggle tema
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
