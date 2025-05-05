const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// — misc: evita comportamenti nativi su mobile
wrapper.style.touchAction = 'none';
panzoomEl.style.touchAction = 'none';

// — Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// — centra la gallery dopo il load
function centerGallery(panzoom) {
  panzoom.reset();
  const offsetX = (wrapper.clientWidth  - panzoomEl.scrollWidth ) / 2;
  const offsetY = (wrapper.clientHeight - panzoomEl.scrollHeight) / 2;
  panzoom.pan(offsetX, offsetY, { animate: true });
}

// — costruisce la gallery
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

// — fetch immagini e init panzoom
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

    // zoom con rotellina
    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });

    // inertia vars
    let isDragging = false;
    let lastPos = null;
    let velocity = { x: 0, y: 0 };
    let lastTime = null;

    // pointerdown
    wrapper.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastPos = { x: e.clientX, y: e.clientY };
      lastTime = performance.now();
      velocity = { x: 0, y: 0 };
      panzoom.handlePointerDown(e);
    });

    // pointermove (calcolo velocità)
    wrapper.addEventListener('pointermove', (e) => {
      if (!isDragging || !lastPos) return;
      const now = performance.now();
      const dt = now - lastTime;
      velocity.x = (e.clientX - lastPos.x) / dt;
      velocity.y = (e.clientY - lastPos.y) / dt;
      lastPos = { x: e.clientX, y: e.clientY };
      lastTime = now;
    });

    // pointerup (inerzia)
    wrapper.addEventListener('pointerup', () => {
      isDragging = false;
      applyInertia();
    });

    // — inertia dopo il rilascio
    function applyInertia() {
      let decay = 0.95;
      function step() {
        if (Math.abs(velocity.x) < 0.01 && Math.abs(velocity.y) < 0.01) return;
        panzoom.pan(velocity.x * 20, velocity.y * 20, { animate: false });
        velocity.x *= decay;
        velocity.y *= decay;
        requestAnimationFrame(step);
      }
      step();
    }

    // refresh
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoom.reset();
        panzoomEl.innerHTML = '';
        fetch('images.json')
          .then(r => r.json())
          .then(imgs => buildGallery(imgs, panzoom));
      });

    // costruisce la galleria iniziale
    buildGallery(images, panzoom);
  })
  .catch(e => console.error('Errore:', e));

// toggle light/dark
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
