// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Inizializza Panzoom e imposta subito il layout “quasi-quadrato”
 * + fit&center iniziale, poi refresh su load/resize.
 *
 * @param {HTMLElement} container   il #panzoom
 * @param {number}      startFactor fattore (0…1) per ridurre lo zoom full-fit
 * @param {number}      minColWidth px minimi desiderati per colonna
 * @returns {Panzoom} l’istanza Panzoom
 */
export function setupPanzoom(container, startFactor = 1, minColWidth = 200) {
  // 1) crea l’istanza Panzoom
  const pz = panzoom(container, {
    maxZoom: 5,
    minZoom: 0.1,
    contain: 'outside'
  });

  // 2) funzione per calcolare quante colonne servono
  function updateCols() {
    const nTiles = container.querySelectorAll('.tile').length;
    const cols   = Math.max(1, Math.ceil(Math.sqrt(nTiles)));
    container.style.setProperty('--cols', cols);
  }

  // 3) funzione per fare full-fit + centering del centro del mosaico
  function fitAndCenter() {
    const wrapper  = document.getElementById('wrapper');
    const W        = wrapper.clientWidth;
    const H        = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    let scale = Math.min(W / contentW, H / contentH) * startFactor;
    pz.zoomAbs(0, 0, scale);

    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // 4) refresh completo
  function refresh() {
    updateCols();
    fitAndCenter();
  }

  // 5) esegui IMMEDIATAMENTE, così non vedi “una sola colonna”
  refresh();

  // 6) e di nuovo su load/resize
  window.addEventListener('load',   () => { refresh(); setTimeout(refresh, 100); });
  window.addEventListener('resize', refresh);

  return pz;
}



