import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const wrapper = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');
const tileWidth = 300; // px
const gutter = 10;     // px

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error) {
    console.error('Supabase error', error);
    return;
  }
  const names = data.map(item => item.name);
  shuffle(names);

  const colsCount = Math.max(1, Math.floor(window.innerWidth / (tileWidth + gutter)));
  panzoomEl.innerHTML = '';
  const cols = [];
  for (let i = 0; i < colsCount; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    panzoomEl.appendChild(col);
    cols.push(col);
  }

  names.forEach((name, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const img = document.createElement('img');
    img.src = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${name}`;
    img.alt = name;
    img.loading = 'lazy';
    tile.appendChild(img);
    cols[i % colsCount].appendChild(tile);
  });
}

function initPanzoom() {
  const pz = panzoom(panzoomEl, {
    maxZoom: 5,
    minZoom: 0.1,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: true,
    beforeWheel: e => panzoomEl.contains(e.target)
  });

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
