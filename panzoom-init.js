import panzoom from 'https://esm.sh/panzoom@9.4.3';

export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });

  function updateZoom() {
    const wrapper = document.getElementById('wrapper');
    const vw = wrapper.clientWidth;
    const vh = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // calcola lo scale per far star tutto dentro
    const s = Math.min(vw / contentW, vh / contentH);

    // inietta in CSS
    container.style.setProperty('--zoom', s);
  }

  // aspetta il load completo delle immagini
  window.addEventListener('load', () => {
    updateZoom();
    // in certi casi togliendo un timeout non vede ancora tutte le dimensioni
    setTimeout(updateZoom, 100);
  });
  window.addEventListener('resize', updateZoom);

  return pz;
}
