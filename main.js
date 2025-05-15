import { supabase } from './supabase.js';

async function loadImages() {
  const { data: files, error } = await supabase
    .storage
    .from('images')
    .list('', { limit: 100 });
  if (error) {
    console.error('Errore Supabase:', error);
    return;
  }

  const grid = document.getElementById('image-grid');
  grid.innerHTML = '';

  const urls = files.map(f => supabase
    .storage
    .from('images')
    .getPublicUrl(f.name).publicURL
  );

  await Promise.all(urls.map(url => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = resolve;
      grid.appendChild(img);
    });
  }));
}

window.addEventListener('load', () => {
  const viewport = document.getElementById('viewport');
  viewport.style.width = window.innerWidth + 'px';
  viewport.style.height = window.innerHeight + 'px';
  loadImages();
});