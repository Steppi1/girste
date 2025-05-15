import panzoom from 'https://cdn.jsdelivr.net/npm/@panzoom/panzoom@9.4.0/dist/panzoom.es.js';

export function initPanzoom() {
  const grid = document.getElementById('image-grid');
  panzoom(grid, {
    bounds: true,
    boundsPadding: 0,
    maxZoom: 5,
    minZoom: 1,
    smoothScroll: false,
    zoomDoubleClickSpeed: 1
  });
}

// inizializzo subito
initPanzoom();
