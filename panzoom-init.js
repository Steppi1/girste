// panzoom-init.js
import panzoom from 'https://cdn.jsdelivr.net/npm/panzoom@9.4.0/dist/panzoom.es.js';

/**
 * Inizializza Panzoom sul container specificato e centra/scala il contenuto.
 * @param {HTMLElement} container - L'elemento da pan-zoomare.
 * @returns {Panzoom} L'istanza di Panzoom.
 */
export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });
  requestAnimationFrame(() => {
    const rect = container.getBoundingClientRect();
    const scale = Math.min(
      window.innerWidth / rect.width,
      window.innerHeight / rect.height
    );
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    pz.zoomAbs(centerX, centerY, scale);
    // Calcola offset per centrare il contenuto
    const contentW = container.scrollWidth * scale;
    const contentH = container.scrollHeight * scale;
    const offsetX = (rect.width - contentW) / 2;
    const offsetY = (rect.height - contentH) / 2;
    pz.moveTo(offsetX, offsetY);
  });
  return pz;
}
