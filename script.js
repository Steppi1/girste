// script.js

const wrapper   = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

let scale = 0.6;            // partenza dezoomata al 60%
let pos   = { x: 0, y: 0 }; 

// applica translate+scale
function update() {
  panzoomEl.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
}

// clamp tra min e max
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// centra e dezooma
function center() {
  const rect = panzoomEl.getBoundingClientRect();
  pos.x = (wrapper.clientWidth  - rect.width ) / 2;
  pos.y = (wrapper.clientHeight - rect.height) / 2;
  update();
}

// costruisci masonry (come avevi tu)
function buildGallery(images, onComplete) {
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
    img.src      = src;
    img.loading  = 'lazy';
    img.decoding = 'async';
    img.style.display  = 'block';
    img.style.maxWidth = 'none';
    img.style.height   = 'auto';

    img.onload = () => {
      loaded++;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.appendChild(img);

      const shortest = columns.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);

      if (loaded === images.length && onComplete) onComplete();
    };
  });
}

// inizializza galleria e pan-zoom
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    buildGallery(images, () => {
      center();

      // attiva pan & zoom
      panzoom(panzoomEl, e => {
        // pan
        pos.x += e.dx;
        pos.y += e.dy;

        // zoom
        if (e.dz) {
          const old = scale;
          scale = clamp(old * (1 + e.dz), 0.2, 5);
          const rect = panzoomEl.getBoundingClientRect();
          const cx = e.x - rect.left;
          const cy = e.y - rect.top;
          pos.x -= cx * (scale/old - 1);
          pos.y -= cy * (scale/old - 1);
        }

        // limiti ampi fuori dal canvas (±wrapper size)
        const bx = wrapper.clientWidth;
        const by = wrapper.clientHeight;
        pos.x = clamp(pos.x, -bx, bx);
        pos.y = clamp(pos.y, -by, by);

        update();
      });
    });

    // refresh gallery
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoomEl.innerHTML = '';
        scale = 0.6; pos = { x: 0, y: 0 };
        buildGallery(images, center);
      });
  })
  .catch(console.error);

// toggle tema
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
