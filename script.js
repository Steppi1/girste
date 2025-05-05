const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

wrapper.style.touchAction = 'none';
panzoomEl.style.touchAction = 'none';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function centerGallery(panzoom) {
  requestAnimationFrame(() => {
    panzoom.reset();
    const offsetX = (wrapper.clientWidth - panzoomEl.scrollWidth) / 2;
    const offsetY = (wrapper.clientHeight - panzoomEl.scrollHeight) / 2;
    panzoom.pan(offsetX, offsetY, { animate: true });
  });
}

function buildGallery(images, panzoom) {
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

      if (loaded === images.length) centerGallery(panzoom);
    };
  });
}

fetch('images.json')
  .then(r => r.json())
  .then(images => {
    const panzoom = Panzoom(panzoomEl, {
      maxScale: 5,
      minScale: 0.25,
      contain: 'outside',
      animate: true,
      step: 0.2,
      duration: 200,
      easing: (t) => 1 - Math.pow(1 - t, 3) // ease-out cubic
    });

    const pointerDown = panzoom.handlePointerDown;
    wrapper.addEventListener('pointerdown', e => pointerDown(e));
    wrapper.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });

    // inertia simulation on drag release
    let last = { x: 0, y: 0, t: 0 };
    let vx = 0, vy = 0;

    wrapper.addEventListener('pointermove', e => {
      const now = performance.now();
      vx = (e.clientX - last.x) / (now - last.t);
      vy = (e.clientY - last.y) / (now - last.t);
      last = { x: e.clientX, y: e.clientY, t: now };
    });

    wrapper.addEventListener('pointerup', () => {
      let decay = 0.92;
      function step() {
        if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;
        panzoom.pan(vx * 40, vy * 40, { animate: false });
        vx *= decay;
        vy *= decay;
        requestAnimationFrame(step);
      }
      step();
    });

    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoom.reset();
        panzoomEl.innerHTML = '';
        fetch('images.json')
          .then(r => r.json())
          .then(imgs => buildGallery(imgs, panzoom));
      });

    buildGallery(images, panzoom);
  })
  .catch(e => console.error('Errore:', e));

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
