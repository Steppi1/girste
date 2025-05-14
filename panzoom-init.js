// panzoom-init.js
import panzoom from 'https://cdn.jsdelivr.net/npm/panzoom@9.4.0/dist/panzoom.es.js';

export function initPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });
  requestAnimationFrame(() => {
    const { width: cw, height: ch } = container.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = Math.min(vw / cw, vh / ch);
    pz.zoomAbs(0, 0, scale);
  });
  return pz;
}