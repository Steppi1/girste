import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Inizializza Panzoom e imposta uno zoom di partenza meno “full‐fit”,
 * centrato sul cuore del mosaico.
 */
export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });
  
  function initPosition() {
    const wrapper  = document.getElementById('wrapper');
    const vw       = wrapper.clientWidth;
    const vh       = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;
    
    // zoom per far star tutto dentro... ridotto da un fattore <1 per “meno zoom”
    const fullFit = Math.min(vw / contentW, vh / contentH);
    const factor  = 0.8; // ad esempio 80% dello zoom che serve per far star tutto
    const scale   = fullFit * factor;
    
    // applica lo zoom dal punto 0,0
    pz.zoomAbs(0, 0, scale);
    
    // calcola lo spostamento che centra il rettangolo scalato
    const dx = (vw - contentW * scale) / 2;
    const dy = (vh - contentH * scale) / 2;
    pz.moveTo(dx, dy);
  }

  // attendi che immagini e layout siano renderizzati
  window.addEventListener('load', () => {
    initPosition();
    // un piccolo ritardo aiuta se alcune immagini sono lente a caricarsi
    setTimeout(initPosition, 100);
  });
  window.addEventListener('resize', initPosition);

  return pz;
}
