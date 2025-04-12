const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');

// 🔥 NUMERO TOTALE DI IMMAGINI NELLA CARTELLA "imgs/"
// ⚠️ ASSICURATI CHE IL NUMERO QUI CORRISPONDA A QUANTE .webp HAI
const totalImages = 75;

// 🔁 CREA ARRAY DEI NOMI IMG: img-1.webp, img-2.webp, ...
const images = [
  "imgs/img-1.webp",
  "imgs/img-2.webp",
  "imgs/img-3.webp",
  "imgs/img-4.webp",
  "imgs/img-5.webp",
  "imgs/img-6.webp",
  "imgs/img-7.webp",
  "imgs/img-8.webp",
  "imgs/img-9.webp",
  "imgs/img-10.webp",
  "imgs/img-11.webp",
  "imgs/img-12.webp",
  "imgs/img-13.webp",
  "imgs/img-14.webp",
  "imgs/img-15.webp",
  // "imgs/img-16.webp", // 🔥 eliminata
  "imgs/img-17.webp",
  "imgs/img-18.webp",
  "imgs/img-19.webp",
  "imgs/img-20.webp",
  "imgs/img-21.webp",
  "imgs/img-22.webp",
  "imgs/img-23.webp",
  "imgs/img-24.webp",
  "imgs/img-25.webp",
  "imgs/img-26.webp",
  // "imgs/img-27.webp", // 🔥 eliminata
  "imgs/img-28.webp",
  "imgs/img-29.webp",
  "imgs/img-30.webp",
  "imgs/img-31.webp",
  "imgs/img-32.webp",
  "imgs/img-33.webp",
  "imgs/img-34.webp",
  "imgs/img-35.webp",
  "imgs/img-36.webp",
  "imgs/img-37.webp",
  "imgs/img-38.webp",
  "imgs/img-39.webp",
  "imgs/img-40.webp",
  "imgs/img-41.webp",
  "imgs/img-42.webp",
  "imgs/img-43.webp",
  "imgs/img-44.webp",
  "imgs/img-45.webp",
  "imgs/img-46.webp",
  "imgs/img-47.webp",
  "imgs/img-48.webp",
  "imgs/img-49.webp",
  "imgs/img-50.webp",
  "imgs/img-51.webp",
  "imgs/img-52.webp",
  "imgs/img-53.webp",
  "imgs/img-54.webp",
  "imgs/img-55.webp",
  "imgs/img-56.webp",
  "imgs/img-57.webp",
  "imgs/img-58.webp",
  "imgs/img-59.webp",
  "imgs/img-60.webp",
  "imgs/img-61.webp",
  "imgs/img-62.webp",
  "imgs/img-63.webp",
  "imgs/img-64.webp",
  "imgs/img-65.webp",
  "imgs/img-66.webp",
  "imgs/img-67.webp",
  "imgs/img-68.webp",
  "imgs/img-69.webp",
  "imgs/img-70.webp",
  "imgs/img-71.webp",
  "imgs/img-72.webp",
  "imgs/img-73.webp",
  "imgs/img-74.webp",
  "imgs/img-75.webp",
  "imgs/img-76.webp",
  "imgs/img-77.webp"
];

// 🔀 MESCOLA L’ORDINE DELLE IMMAGINI
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(images);

// 📐 NUMERO DI COLONNE IN BASE ALLE IMMAGINI TOTALI
const numColumns = Math.floor(Math.sqrt(totalImages));

// 🧱 CREA COLONNE
const columns = Array.from({ length: numColumns }, () => {
  const col = document.createElement('div');
  col.className = 'column';
  panzoomEl.appendChild(col);
  return col;
});

// 📦 INSERISCI IMMAGINI DISTRIBUITE NELLA COLONNA PIÙ BASSA
for (let i = 0; i < totalImages; i++) {
  const imgEl = document.createElement('img');
  imgEl.src = images[i];

  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.appendChild(imgEl);

  let shortestCol = columns.reduce((prev, curr) =>
    prev.offsetHeight < curr.offsetHeight ? prev : curr
  );
  shortestCol.appendChild(tile);
}

// 🖱️ ZOOM E PAN
let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

function updateTransform() {
  panzoomEl.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  panzoomEl.style.transformOrigin = "0 0";
}

// 🔍 ZOOM INIZIALE
window.addEventListener('load', () => {
  const isDesktop = window.innerWidth >= 768;
  scale = isDesktop ? 2 : 0.5;
  originX = (wrapper.clientWidth / 2) - (panzoomEl.clientWidth * scale / 2);
  originY = (wrapper.clientHeight / 2) - (panzoomEl.clientHeight * scale / 2);
  updateTransform();
});

// 🧭 GESTIONE ZOOM CON SCROLL
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

// 🖱️ GESTIONE PAN
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

// 🤏 PINCH TO ZOOM MOBILE
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

updateTransform();
