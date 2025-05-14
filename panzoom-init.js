// panzoom-init.js
// Prendi Panzoom come vero ES‐module da esm.sh (o Skypack)
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Inizializza Panzoom sul container specificato e centra/scala il contenuto.
 * @param {HTMLElement} container
 * @returns {Panzoom}
 */
export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });
  requestAnimationFrame(() => {
    const r = container.getBoundingClientRect();
    const scale = Math.min(
      window.innerWidth  / r.width,
      window.innerHeight / r.height
    );
    pz.zoomAbs(r.width/2, r.height/2, scale);
    // centriamo
    const w = container.scrollWidth  * scale;
    const h = container.scrollHeight * scale;
    pz.moveTo((r.width - w)/2, (r.height - h)/2);
  });
  return pz;
}
