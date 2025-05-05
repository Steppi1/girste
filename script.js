// script.js

// — DOM refs
const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — helper: shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — center gallery after all images loaded
function centerGallery(panzoomInstance) {
  panzoomInstance.reset();
  // calcolo centro
  const offsetX = (wrapper.clientWidth  - panzoomEl.clientWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.clientHeight) / 2;
  panzoomInstance.pan(offsetX, offsetY, { animate: true });
}

// — build Masonry-style gallery from un array di URL
function buildGallery(images, panzoomInstance) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';

  // crea colonne
  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  // carica immagini
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

// — fetch + init panzoom + gallery
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    // inizializza Panzoom
    const panzoom = Panzoom(panzoomEl, {
      maxScale: 5,
      minScale: 0.1,
      contain: 'outside',
      animate: true,
      step: 0.3
    });
    // collega zoom con rotellina sul wrapper
    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });

    // build e center
    buildGallery(images, panzoom);

    // refresh gallery
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
