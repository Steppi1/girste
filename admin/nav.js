import { loadMosaic } from './mosaic.js';
import { loadSplashes } from './splashes.js';

export function showSection(id) {
  if (id === 'manage-mosaic') loadMosaic();
  if (id === 'manage-splash') {
    console.log('[nav] splash loading');
    loadSplashes();
  }
  

  document.querySelectorAll('.section').forEach(s =>
    s.id === id ? s.classList.add('active') : s.classList.remove('active')
  );
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.dataset.section === id ? b.classList.add('active') : b.classList.remove('active')
  );
}

document.querySelectorAll('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => showSection(btn.dataset.section))
);
