import { loadMosaic } from './mosaic.js';
export function showSection(id) {
  if (id === 'manage-mosaic') loadMosaic();
  document.querySelectorAll('.section').forEach(s=>s.id===id?s.classList.add('active'):s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.dataset.section===id?b.classList.add('active'):b.classList.remove('active'));
}
document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>showSection(btn.dataset.section)));