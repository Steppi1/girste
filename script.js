// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — helper: shuffle array (Fisher–Yates)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — center gallery after all images loaded
function centerGallery(panzoom) {
  panzoom.reset();
  const offsetX = (wrapper.clientWidth  - panzoomEl.clientWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.clientHeight) / 2;
  panzoom.pan(offsetX, offsetY, { animate: true });
}

// — build Masonry-style gallery
function buildGallery(images, panzoom) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';

  // create columns
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  // load images
  let loaded = 0;
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

      // append to shortest column
      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === images.length) centerGallery(panzoom);
    };
  });
}

// — fetch images and init Panzoom + gallery
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    const panzoom = Panzoom(panzoomEl, {
      maxScale: 5,
      minScale: 0.1,
      animate: true,
      step: 0.3
    });

    // wheel zoom
    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });
    // drag
    wrapper.addEventListener('pointerdown', panzoom.handlePointerDown);

    // build & center
    buildGallery(images, panzoom);

    // refresh button
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

// — theme toggle
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
