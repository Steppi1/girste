import panzoom from 'https://esm.sh/panzoom@9.4.3';

export function setupPanzoom(container) {
  const pz = panzoom(container, { maxZoom: 5, minZoom: 0.1 });

  function updateZoom() {
    const wrapper  = document.getElementById('wrapper');
    const vw       = wrapper.clientWidth;
    const vh       = wrapper.clientHeight;
    const contentW = container.scrollWidth;
    const contentH = container.scrollHeight;

    // 1) scale “full-fit” per far entrare TUTTO, poi ridotto da un factor (<1)
    let scale = Math.min(vw / contentW, vh / contentH);
    scale *= 0.8; // ===> prova a variare 0.7–0.9 fino al livello di zoom che ti piace

    // 2) inietta in CSS
    container.style.setProperty('--zoom', scale);
  }

  // attendi load e resize
  window.addEventListener('load', () => {
    updateZoom();
    setTimeout(updateZoom, 100);
  });
  window.addEventListener('resize', updateZoom);

  return pz;
}
