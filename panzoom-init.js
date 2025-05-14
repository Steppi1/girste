// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Inizializza Panzoom sul container “masonry” e
 * applica inizialmente fit-&-center + calcola dinamicamente il numero di colonne.
 *
 * @param {HTMLElement} container  l’elemento #panzoom
 * @param {number}      startFactor  [0…1] moltiplicatore per “meno zoom” iniziale (default 1 = full-fit)
 * @param {number}      minColWidth  larghezza minima desiderata per ogni colonna in px (default 200)
 * @returns {Panzoom}  l’istanza Panzoom
 */
export function setupPanzoom(container, startFactor = 1, minColWidth = 200) {
  // 1) crea l’istanza Panzoom
  const pz = panzoom(container, {
    maxZoom: 5,
    minZoom: 0.1,
    contain: 'outside'
  });

  // 2) aggiorna il numero di colonne via CSS var(--cols)
  function updateCols() {
    const wrapper = document.getElementById('wrapper');
    const W       = wrapper.clientWidth;          // larghezza del quadrato (100vmin)
    const cols    = Math.max(1, Math.floor(W / minColWidth));
    container.style.setProperty('--cols', cols);
  }

  // 3) calcola fit & center
  function fitAndCenter() {
    const wrapper  = document.getElementById('wrapper');
    const W        = wrapper.clientWidth;
    const H        = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // full-fit scale
    let scale = Math.min(W / contentW, H / contentH);
    // applica il fattore di “meno zoom”
    scale *= startFactor;

    // esegui zoom dal top-left
    pz.zoomAbs(0, 0, scale);

    // calcola offset per centrare il centro del contenuto sul wrapper
    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // 4) on load: aggiorna colonne + fit&center (e di nuovo dopo 100ms per immagini lente)
  window.addEventListener('load', () => {
    updateCols();
    fitAndCenter();
    setTimeout(() => {
      updateCols();
      fitAndCenter();
    }, 100);
  });

  // 5) on resize: aggiorna colonne + fit&center
  window.addEventListener('resize', () => {
    updateCols();
    fitAndCenter();
  });

  return pz;
}
