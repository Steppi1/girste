import { getImageUrls } from './supabase.js';

(async () => {
  const urls = await getImageUrls('mosaic');
  if (!urls.length) return;

  // Fisher–Yates shuffle
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