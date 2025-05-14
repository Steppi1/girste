import panzoom from 'https://esm.sh/panzoom@9.4.3';

export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });

  function initView() {
    const wrapper  = document.getElementById('wrapper');
    const vw       = wrapper.clientWidth;
    const vh       = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // 1) zoom per far entrare tutto (full‐fit)
    let scale = Math.min(vw/contentW, vh/contentH);
    // 2) riducilo se vuoi partire meno zoommati
    scale *= 0.8;

    // 3) applica lo zoom dall’origine (0,0)
    pz.zoomAbs(0, 0, scale);

    // 4) calcola lo spostamento per centrare il centro
    //    offsetX = (viewportW − contenutoW*scale)/2, idem Y
    const offsetX = (vw - contentW * scale) / 2;
    const offsetY = (vh - contentH * scale) / 2;
    pz.moveTo(offsetX, offsetY);
  }

  window.addEventListener('load', () => {
    initView();
    // piccolo ritardo per essere sicuri che tutte le immagini abbiano dimensioni
    setTimeout(initView, 100);
  });
  window.addEventListener('resize', initView);

  return pz;
}
