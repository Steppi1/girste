// main.js
import { getImageUrls } from './supabase.js';
import { buildMosaic } from './grid.js';
import { setupPanzoom } from './panzoom-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('panzoom');
  // Recupera gli URL dal bucket 'mosaic'
  const urls = await getImageUrls('mosaic');
  // Costruisce il mosaico e poi abilita pan/zoom
  await buildMosaic(container, urls);
  setupPanzoom(container);
});
