import { getImageUrls } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Dark/Bright toggle
  const toggle = document.getElementById('toggle');
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('dark');
  });

  // Populate gallery
  (async () => {
    const urls = await getImageUrls('mosaic');
    if (!urls.length) return;

    for (let i = urls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [urls[i], urls[j]] = [urls[j], urls[i]];
    }

    const container = document.getElementById('mosaic');
    urls.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      container.appendChild(img);
    });
  })();
});
