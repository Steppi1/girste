import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');
const gridEl = document.getElementById('masonry');

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 200, offset: 0, sortBy: { column: 'name', order: 'asc' }
  });
  if (error) {
    console.error('Supabase error', error);
    return;
  }
  gridEl.innerHTML = '';
  data.sort(() => 0.5 - Math.random()).forEach(item => {
    const img = document.createElement('img');
    img.src = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${item.name}`;
    img.alt = item.name;
    img.loading = 'lazy';
    gridEl.appendChild(img);
  });
}

function initPanzoom() {
  // disable page scroll
  document.body.style.overflow = 'hidden';

  const pz = panzoom(panzoomEl, {
    maxZoom: 5,
    minZoom: 0.2,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: true,
    beforeWheel: function(e) {
      e.preventDefault();
      return true;
    }
  });

  // prevent page scroll on wheel inside panzoom
  panzoomEl.addEventListener('wheel', e => e.preventDefault(), { passive: false });

  // initial fit-to-screen
  setTimeout(() => {
    const rect = panzoomEl.getBoundingClientRect();
    const scale = Math.min(wrapper.clientWidth / rect.width, wrapper.clientHeight / rect.height);
    pz.zoomAbs(0, 0, scale);
    const offsetX = (wrapper.clientWidth - rect.width * scale) / 2 - rect.left;
    const offsetY = -rect.top + 20;
    pz.moveBy(offsetX, offsetY);
  }, 300);
}

document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadImages();
  initPanzoom();
});