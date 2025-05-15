// panzoom-init.js
import panzoom from 'https://esm.sh/panzoom@9.4.3';

/**
 * Inizializza Panzoom senza calcoli di layout JS (layout gestito in CSS).
 *
 * @param {HTMLElement} container   il #panzoom
 * @returns {Panzoom} l’istanza Panzoom
 */
export function setupPanzoom(container) {
  // Crea l’istanza Panzoom con contenimento del panning all’interno del wrapper
  return panzoom(container, {
    maxZoom: 5,
    contain: 'outside'
  });
}
