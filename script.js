const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

let scale = 1, originX = 0, originY = 0;
let isPanning = false, startX = 0, startY = 0;
let lastTouchDist = null, lastTouchCenter = null;
let rafScheduled = false;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateTransform() {
  panzoomEl.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  panzoomEl.style.transformOrigin = "0 0";

  // Ottimizzazione mobile: reset e reimposta will-change
  panzoomEl.style.willChange = 'auto';
  requestAnimationFrame(() => {
    panzoomEl.style.willChange = 'transform';
  });
}

function buildGallery(images) {
  shuffle(images);
  const numColumns = Math.floor(Math.sqrt(images.length));

  const columns = Array.from({ length: numColumns }, () => {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    return col;
  });

  const promises = images.map((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';

    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.appendChild(img);
    columns[i % numColumns].appendChild(tile);

    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  Promise.all(promises).then(() => {
    const tiles = [...panzoomEl.querySelectorAll('.tile')];
    panzoomEl.innerHTML = '';
    const newCols = Array.from({ length: numColumns }, () => {
      const col = document.createElement('div');
      col.className = 'column';
      panzoomEl.appendChild(col);
      return col;
    });

    tiles.forEach(tile => {
      const shortest = newCols.reduce((a, b) =>
        a.offsetHeight < b.offsetHeight ? a : b
      );
      shortest.appendChild(tile);
    });

    scale = window.innerWidth >= 768 ? 1.0 : 0.3;
    originX = (wrapper.clientWidth - panzoomEl.clientWidth * scale) / 2;
    originY = (wrapper.clientHeight - panzoomEl.clientHeight * scale) / 2;
    updateTransform();

    const group = document.querySelector('.icon-group');
    const footerIcon = document.querySelector('.icon-footer img');
    if (group && footerIcon) {
      footerIcon.style.width = `${group.offsetWidth}px`;
    }
  });
}

function fetchImages() {
  panzoomEl.innerHTML = '';
  fetch('images.json')
    .then(res => res.json())
    .then(buildGallery)
    .catch(err => console.error("Errore nel caricamento:", err));
}

fetchImages();

// Zoom con rotella
wrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 5);
  originX -= (x - originX) * (newScale / scale - 1);
  originY -= (y - originY) * (newScale / scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

// Drag
wrapper.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' && !e.isPrimary) return;
  isPanning = true;
  startX = e.clientX - originX;
  startY = e.clientY - originY;
  wrapper.setPointerCapture(e.pointerId);
  wrapper.style.cursor = 'grabbing';
});

wrapper.addEventListener('pointermove', (e) => {
  if (!isPanning || rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => {
    originX = e.clientX - startX;
    originY = e.clientY - startY;
    updateTransform();
    rafScheduled = false;
  });
});

wrapper.addEventListener('pointerup', () => {
  isPanning = false;
  wrapper.style.cursor = 'grab';
});

// Pinch zoom su mobile
wrapper.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const rect = wrapper.getBoundingClientRect();
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const dist = Math.hypot(dx, dy);
    const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
    const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;

    if (lastTouchDist !== null && lastTouchCenter !== null) {
      const scaleFactor = dist / lastTouchDist;
      const newScale = Math.min(Math.max(0.1, scale * scaleFactor), 5);
      originX += centerX - lastTouchCenter.x;
      originY += centerY - lastTouchCenter.y;
      originX -= (centerX - originX) * (newScale / scale - 1);
      originY -= (centerY - originY) * (newScale / scale - 1);
      scale = newScale;
      updateTransform();
    }

    lastTouchDist = dist;
    lastTouchCenter = { x: centerX, y: centerY };
  }
}, { passive: false });

wrapper.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    lastTouchDist = null;
    lastTouchCenter = null;
  }
});

// Tema chiaro/scuro
const toggleThemeBtn = document.getElementById("toggle-theme");
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}

// Refresh
const refreshBtn = document.querySelector('button[title="refresh"]');
if (refreshBtn) {
  refreshBtn.removeAttribute('onclick');
  refreshBtn.addEventListener('click', fetchImages);
}
