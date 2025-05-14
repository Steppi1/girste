// main.js
import { getImageUrls } from './supabase.js';
import { buildMosaic }   from './grid.js';
import { setupPanzoom }  from './panzoom-init.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('panzoom');
  const urls      = await getImageUrls('mosaic');
  await buildMosaic(container, urls);
  setupPanzoom(container, 0.8);
});
