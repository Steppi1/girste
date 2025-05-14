// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * @param {HTMLElement} container  il #panzoom
 * @param {number}      startFactor fattore <1 per “meno zoom” iniziale
 */
export function setupPanzoom(container, startFactor = 1) {
  const pz = panzoom(container, {
    maxZoom: 5,
    minZoom: 0.1,
    contain: 'outside'
  });

  // 1) calcola il numero di colonne = ceil(sqrt(nTiles))
  function updateCols() {
    const nTiles = container.querySelectorAll('.tile').length;
    const cols   = Math.max(1, Math.ceil(Math.sqrt(nTiles)));
    container.style.setProperty('--cols', cols);
  }

  // 2) fit full & center content nel quadrato
  function fitAndCenter() {
    const wrapper  = document.getElementById('wrapper');
    const W        = wrapper.clientWidth;
    const H        = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    let scale = Math.min(W / contentW, H / contentH) * startFactor;
    pz.zoomAbs(0, 0, scale);

    // centro il centro del mosaico
    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // 3) all’avvio e resize: aggiorna colonne + fit&center
  function refresh() {
    updateCols();
    fitAndCenter();
  }

  window.addEventListener('load', () => {
    refresh();
    setTimeout(refresh, 100);  // per immagini lente
  });
  window.addEventListener('resize', refresh);

  return pz;
}
