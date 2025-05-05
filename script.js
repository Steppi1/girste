const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function centerGallery(panzoom) {
  panzoom.reset();
  const offsetX = (wrapper.clientWidth  - panzoomEl.scrollWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.scrollHeight) / 2;
  panzoom.pan(offsetX, offsetY, { animate: true });
}

function buildGallery(images, panzoom) {
  shuffle(images);
  const n = Math.floor(Math.sqrt(images.length));
  const columns = [];
  panzoomEl.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    col.style.display = 'inline-block';
    col.style.verticalAlign = 'top';
    col.style.margin = '0 4px';
    panzoomEl.appendChild(col);
    columns.push(col);
  }

  let loaded = 0;
  images.forEach(src => {
    const img = new Image(); // crea oggetto immagine nativo
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.display = 'block'; // evita spazi vuoti inline
    img.style.maxWidth = 'none'; // <=== QUI IL PUNTO CHIAVE
    img.style.height = 'auto';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === images.length) centerGallery(panzoom);
    };
  });
}

fetch('images.json')
  .then(r => r.json())
  .then(images => {
    const panzoom = Panzoom(panzoomEl, {
      maxScale: 5,
      minScale: 0.1,
      animate: true,
      step: 0.3,
      contain: 'outside'
    });

    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });
    wrapper.addEventListener('pointerdown', panzoom.handlePointerDown);

    buildGallery(images, panzoom);

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

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
