// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Applica a `container` un fit‐&‐center iniziale + pan/zoom
 * @param {HTMLElement} container  l’elemento #panzoom
 * @param {number} startFactor     [0…1] per ridurre lo zoom “full-fit”
 */
export function setupPanzoom(container, startFactor = 1) {
  const pz = panzoom(container, {
    maxZoom: 5,
    minZoom: 0.1,
    contain: 'outside'
  });

  function fitAndCenter() {
    const wrapper  = document.getElementById('wrapper');
    const W        = wrapper.clientWidth;
    const H        = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // full‐fit
    let scale = Math.min(W / contentW, H / contentH);
    // riduco di startFactor per “meno zoom”
    scale *= startFactor;

    // zoom dall’angolo in alto a sinistra
    pz.zoomAbs(0, 0, scale);

    // sposto in modo che il centro del contenuto sia al centro del wrapper
    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // esegui all’avvio e al resize
  window.addEventListener('load',  () => { fitAndCenter(); setTimeout(fitAndCenter, 100); });
  window.addEventListener('resize', fitAndCenter);

  return pz;
}
