import panzoom from 'https://esm.sh/panzoom@9.4.3';

export function setupPanzoom(container) {
  // 1) inizializza
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });

  function initView() {
    const wrapper   = document.getElementById('wrapper');
    const W         = wrapper.clientWidth;   // = 100vmin in px
    const H         = wrapper.clientHeight;  // = 100vmin in px
    const contentW  = container.scrollWidth; // larghezza intero mosaico
    const contentH  = container.scrollHeight;// altezza intero mosaico

    // 2) calcola zoom per far star tutto dentro il quadrato
    let scale = Math.min(W / contentW, H / contentH);
    // se vuoi partire meno zoommato, moltiplica per un fattore < 1:
    // scale *= 0.8;

    // 3) applica lo zoom dal punto (0,0) in alto a sinistra
    pz.zoomAbs(0, 0, scale);

    // 4) calcola gli offset per centrare il centro del mosaico
    //    vogliamo: (contentW·scale)/2 + dx = W/2  ⇒ dx = W/2 – (contentW·scale)/2
    const dx = (W - contentW * scale) / 2;
    const dy = (H - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // 5) attendi che tutto sia caricato e poi inizializza, anche dopo resize
  window.addEventListener('load', () => {
    initView();
    setTimeout(initView, 100);
  });
  window.addEventListener('resize', initView);

  return pz;
}
