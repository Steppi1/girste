import panzoom from 'panzoom';

export function initPanzoom() {
  const grid = document.getElementById('image-grid');
  panzoom(grid, {
    bounds: true,              // vincolo ai limiti del genitore
    boundsPadding: 0,
    maxZoom: 5,
    minZoom: 1,
    smoothScroll: false,
    zoomDoubleClickSpeed: 1
  });
}

// inizializzo subito
initPanzoom();