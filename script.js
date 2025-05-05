const wrapper   = document.getElementById('wrapper');
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
    const offsetX = (wrapper.clientWidth  - panzoomEl.scrollWidth ) / 2;
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
      minScale: 0.3,
      step: 0.3,
      animate: true,
      contain: 'outside', // consente di spostare oltre i bordi
      startScale: 1.0,
      smoothScroll: true, // attiva scroll morbido
      setTransform: (el, transform) => {
        el.style.transform = transform;
        el.style.transition = 'transform 0.1s ease-out';
      }
    });

    const controller = panzoom;

    // abilita zoom con gesture touch (pinch)
    wrapper.addEventListener('wheel', controller.zoomWithWheel, { passive: false });
    wrapper.addEventListener('pointerdown', controller.handlePointerDown);

    buildGallery(images, controller);

    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        controller.reset();
        panzoomEl.innerHTML = '';
        fetch('images.json')
          .then(r => r.json())
          .then(imgs => buildGallery(imgs, controller));
      });
  })
  .catch(e => console.error('Errore:', e));

document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
