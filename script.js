
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://mcvvvhpmpouuupwqlbsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
);

const panzoomEl = document.getElementById('panzoom');
const masonryEl = document.getElementById('masonry');

const panzoomInstance = panzoom(panzoomEl, {
  maxZoom: 5,
  minZoom: 0.1,
  bounds: true,
  boundsPadding: 1.5
});

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', { limit: 500 });

  if (error) {
    console.error('❌ Errore caricamento immagini:', error);
    return;
  }

  console.log(`📦 ${data.length} immagini trovate nel bucket.`);

  const shuffled = data.sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    const url = `https://mcvvvhpmpouuupwqlbsn.supabase.co/storage/v1/object/public/mosaic/${item.name}`;
    console.log('🖼️ Carico immagine:', url);

    const img = document.createElement('img');
    img.src = url;
    img.className = 'tile';
    img.loading = 'eager';
    img.decoding = 'async';
    img.onerror = () => console.error('🚫 Errore immagine:', url);
    masonryEl.appendChild(img);
  }

  await new Promise(r => setTimeout(r, 500));
  applyInitialZoomAndCenter();
}

function applyInitialZoomAndCenter() {
  const wrapper = document.getElementById('wrapper');
  const contentRect = masonryEl.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  const scaleX = wrapperRect.width / contentRect.width;
  const scaleY = wrapperRect.height / contentRect.height;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  panzoomInstance.zoomAbs(0, 0, scale);

  const panX = (wrapperRect.width - contentRect.width * scale) / 2;
  const panY = (wrapperRect.height - contentRect.height * scale) / 2;

  panzoomInstance.moveTo(panX, panY);
}

loadImages();
