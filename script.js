import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');
const masonryEl = document.getElementById('masonry');

// Configuration
const columnWidth = 200; // matches CSS column-width
const gutter = 8;

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 200, offset: 0, sortBy: { column: 'name', order: 'asc' }
  });
  if (error) {
    console.error('Supabase error', error);
    return;
  }
  // Shuffle images
  const names = data.map(item => item.name).sort(() => 0.5 - Math.random());

  // Determine number of columns based on viewport width
  const colsCount = Math.max(1, Math.floor(window.innerWidth / (columnWidth + gutter)));
  masonryEl.innerHTML = '';
  // Create column wrappers
  const cols = [];
  for (let i = 0; i < colsCount; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    masonryEl.appendChild(col);
    cols.push(col);
  }
  // Distribute images into columns evenly
  names.forEach((name, idx) => {
    const img = document.createElement('img');
    img.src = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${name}`;
    img.alt = name;
    img.loading = 'lazy';
    cols[idx % colsCount].appendChild(img);
  });
}

function initPanzoom() {
  document.body.style.overflow = 'hidden';
  const pz = panzoom(panzoomEl, {
    maxZoom: 5,
    minZoom: 0.1,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: true,
    beforeWheel: () => true
  });
  panzoomEl.addEventListener('wheel', e => e.preventDefault(), { passive: false });

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