const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function buildGallery(images) {
  shuffle(images);

  const totalImages = images.length;
  const numColumns = Math.floor(Math.sqrt(totalImages));
  const columns = Array.from({ length: numColumns }, () => {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    return col;
  });

  for (let i = 0; i < totalImages; i++) {
    const imgEl = document.createElement('img');
    imgEl.src = images[i];
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.appendChild(imgEl);
    const shortestCol = columns.reduce((prev, curr) =>
      prev.offsetHeight < curr.offsetHeight ? prev : curr
    );
    shortestCol.appendChild(tile);
  }

  // Pan e zoom iniziali
  const isDesktop = window.innerWidth >= 768;
  scale = isDesktop ? 1.8 : 1.1;
  originX = (wrapper.clientWidth / 2) - (panzoomEl.clientWidth * scale / 2);
  originY = (wrapper.clientHeight / 2) - (panzoomEl.clientHeight * scale / 2);
  updateTransform();

  // Larghezza dinamica del text-icon
  const group = document.querySelector('.icon-group');
  const footerIcon = document.querySelector('.icon-footer img');
  if (group && footerIcon) {
    const groupWidth = group.offsetWidth;
    footerIcon.style.width = `${groupWidth}px`;
  }
}

// Fetch immagini da images.json
fetch('images.json')
  .then(res => res.json())
  .then(images => buildGallery(images))
  .catch(err => console.error("Errore nel caricamento delle immagini:", err));

let scale = 1, originX = 0, originY = 0, isPanning = false;
let startX = 0, startY = 0;

function updateTransform() {
  panzoomEl.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  panzoomEl.style.transformOrigin = "0 0";
}

wrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale * (1 + delta)), 5);
  originX -= (mouseX - originX) * (newScale / scale - 1);
  originY -= (mouseY - originY) * (newScale / scale - 1);
  scale = newScale;
  updateTransform();
}, { passive: false });

wrapper.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' && !e.isPrimary) return;
  isPanning = true;
  startX = e.clientX - originX;
  startY = e.clientY - originY;
  wrapper.style.cursor = 'grabbing';
  wrapper.setPointerCapture(e.pointerId);
});

wrapper.addEventListener('pointermove', (e) => {
  if (!isPanning) return;
  originX = e.clientX - startX;
  originY = e.clientY - startY;
  updateTransform();
});

wrapper.addEventListener('pointerup', () => {
  isPanning = false;
  wrapper.style.cursor = 'grab';
});

let lastTouchDist = null;
let lastTouchCenter = null;

wrapper.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    isPanning = false;
    const rect = wrapper.getBoundingClientRect();
    const [t1, t2] = e.touches;
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const dist = Math.hypot(dx, dy);
    const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
    const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;

    if (lastTouchDist !== null && lastTouchCenter) {
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

const toggleThemeBtn = document.getElementById("toggle-theme");
toggleThemeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});
