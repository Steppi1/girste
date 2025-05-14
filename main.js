// main.js
import { getPhotoList }   from './photos.js';
import { buildGrid }      from './grid.js';
import { initPanzoom }    from './panzoom-init.js';
import { initThemeToggle }from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('panzoom');
  const photos    = getPhotoList();
  buildGrid(container, photos);
  initPanzoom(container);
  initThemeToggle();
});