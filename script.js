
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://mcvvvhpmpouuupwqlbsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
);

const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');
const masonryEl = document.getElementById('masonry');

function waitForAllImagesToLoad() {
  const images = masonryEl.querySelectorAll('img');
  return Promise.all(
    Array.from(images).map(img =>
      img.decode().catch(() => {
        console.warn('⚠️ errore decoding img', img.src);
      })
    )
  );
}

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', { limit: 500 });

  if (error) {
    console.error('❌ Errore caricamento immagini:', error);
    return;
  }

  const shuffled = data.sort(() => Math.random() - 0.5);
  masonryEl.innerHTML = ''; // pulizia

  for (const item of shuffled) {
    const url = `https://mcvvvhpmpouuupwqlbsn.supabase.co/storage/v1/object/public/mosaic/${item.name}`;
    const img = document.createElement('img');
    img.src = url;
    img.className = 'tile';
    img.loading = 'eager';
    masonryEl.appendChild(img);
  }

  await waitForAllImagesToLoad();
  setupPanzoom();
}

function setupPanzoom() {
  const instance = window.panzoom(panzoomEl, {
    maxZoom: 5,
    minZoom: 0.1,
    bounds: true,
    boundsPadding: 2,
    smoothScroll: true
  });

  panzoomEl.style.touchAction = 'none';

  // zoom e centraggio
  const wrapperRect = wrapper.getBoundingClientRect();
  const contentRect = masonryEl.getBoundingClientRect();

  const scaleX = wrapperRect.width / contentRect.width;
  const scaleY = wrapperRect.height / contentRect.height;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  instance.zoomAbs(0, 0, scale);

  const panX = (wrapperRect.width - contentRect.width * scale) / 2;
  const panY = (wrapperRect.height - contentRect.height * scale) / 2;

  instance.moveTo(panX, panY);
}

loadImages();
