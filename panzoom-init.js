// main.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

const wrapper   = document.getElementById('wrapper');
const container = document.getElementById('panzoom');

// ——————————————————————
// 1) ELENCO DELLE IMMAGINI
// ——————————————————————
// Qui ci metti i tuoi src (relativi o assoluti)
const imageUrls = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  // …eccetera…
];

// ——————————————————————
// 2) POPOLA IL CONTENITORE
// ——————————————————————
imageUrls.forEach(src => {
  const tile = document.createElement('div');
  tile.className = 'tile';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  tile.appendChild(img);
  container.appendChild(tile);
});

// ——————————————————————
// 3) INIZIALIZZA PANZOOM
// ——————————————————————
const pz = panzoom(container, {
  maxZoom: 5,
  minZoom: 0.1,
  contain: 'outside'
});

// ——————————————————————
// 4) FUNZIONE DI FIT & CENTER
// ——————————————————————
function fitAndCenter() {
  const W         = wrapper.clientWidth;    // larghezza quadrato (100vmin)
  const H         = wrapper.clientHeight;   // altezza quadrato (100vmin)
  const contentW  = container.scrollWidth;  // larghezza reale del mosaico
  const contentH  = container.scrollHeight; // altezza reale del mosaico

  // zoom “full-fit” ridotto dal fattore 0.8 (modificalo se vuoi)
  let scale = Math.min(W / contentW, H / contentH) * 0.8;

  // applica lo zoom dall’angolo in alto a sinistra
  pz.zoomAbs(0, 0, scale);

  // calcola gli offset per portare il CENTRO del mosaico al CENTRO del quadrato
  const dx = (W - contentW * scale) / 2;
  const dy = (H - contentH * scale) / 2;
  pz.moveTo(dx, dy);
}

// ——————————————————————
// 5) ESEGUI AL LOAD E AL RESIZE
// ——————————————————————
window.addEventListener('load', () => {
  fitAndCenter();
  // un ritardo aiuta se qualche immagine è lenta a caricarsi
  setTimeout(fitAndCenter, 100);
});
window.addEventListener('resize', fitAndCenter);
