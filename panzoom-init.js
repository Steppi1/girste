// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * @param {HTMLElement} container  elemento #panzoom
 * @param {number}      startFactor  fattore <1 per “meno zoom” iniziale
 */
export function setupPanzoom(container, startFactor = 1) {
  // 1) crea Panzoom
  const pz = panzoom(container, {
    maxZoom: 5,
    minZoom: 0.1,
    contain: 'outside'
  });

  // 2) calcola quante colonne per avere sqrt(n) ~ quadrato
  function updateCols() {
    const nTiles = container.querySelectorAll('.tile').length;
    // almeno 1 colonna, arrotondamento a intero
    const cols = Math.max(1, Math.round(Math.sqrt(nTiles)));
    container.style.setProperty('--cols', cols);
  }

  // 3) zoom full-fit + centering del centro del mosaico
  function fitAndCenter() {
    const wrapper  = document.getElementById('wrapper');
    const W        = wrapper.clientWidth;
    const H        = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // full-fit scale
    let scale = Math.min(W / contentW, H / contentH);
    // applica fattore “meno zoom”
    scale *= startFactor;

    // zoom da 0,0
    pz.zoomAbs(0, 0, scale);
    // centra il centro del contenuto nella viewport
    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // 4) all’avvio e al resize: aggiorna colonne e fit&center
  window.addEventListener('load', () => {
    updateCols();
    fitAndCenter();
    setTimeout(() => { updateCols(); fitAndCenter(); }, 100);
  });
  window.addEventListener('resize', () => {
    updateCols();
    fitAndCenter();
  });

  return pz;
}
