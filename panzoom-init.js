// panzoom-init.js
// Import ES-module build da jsDelivr
import panzoom from 'https://cdn.jsdelivr.net/npm/panzoom@9.4.3/dist/panzoom.js';


/**
 * Inizializza Panzoom sul container specificato e centra/scala il contenuto.
 * @param {HTMLElement} container - L'elemento da pan-zoomare.
 * @returns {Panzoom} L'istanza di Panzoom.
 */
export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });
  requestAnimationFrame(() => {
    const r = container.getBoundingClientRect();
    const scale = Math.min(window.innerWidth / r.width,
                           window.innerHeight / r.height);
    pz.zoomAbs(r.width/2, r.height/2, scale);
    // centra
    const w = container.scrollWidth * scale;
    const h = container.scrollHeight * scale;
    pz.moveTo((r.width - w)/2, (r.height - h)/2);
  });
  return pz;
}
