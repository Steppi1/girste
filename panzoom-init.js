import panzoom from 'https://esm.sh/panzoom@9.4.3';

export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });

  function fitAndCenter() {
    const wrapper   = document.getElementById('wrapper');
    const vw        = wrapper.clientWidth;
    const vh        = wrapper.clientHeight;
    const contentW  = container.scrollWidth;
    const contentH  = container.scrollHeight;

    // Zoom per far entrare TUTTO: full-fit su entrambe le dimensioni
    const scale = Math.min(vw / contentW, vh / contentH);

    // 1) zoom dal punto (0,0)
    pz.zoomAbs(0, 0, scale);
    // 2) translate per centrare il bounding-box ridotto
    const dx = (vw - contentW * scale) / 2;
    const dy = (vh - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // Applica all’avvio (dopo che le immagini sono caricate)
  window.addEventListener('load', () => {
    fitAndCenter();
    // un doppio call con timeout aiuta se alcune img impiegano a caricarsi
    setTimeout(fitAndCenter, 100);
  });
  // E dopo ogni resize
  window.addEventListener('resize', fitAndCenter);

  return pz;
}
