import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mcvvvhpmpouuupwqlbsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', {
    limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' }
  });
  if (error) {
    console.error('Supabase error', error);
    return;
  }
  const grid = document.getElementById('masonry');
  grid.innerHTML = '';
  data.sort(() => 0.5 - Math.random()).forEach(item => {
    const img = document.createElement('img');
    img.src = `${SUPABASE_URL}/storage/v1/object/public/mosaic/${item.name}`;
    img.alt = item.name;
    img.loading = 'lazy';
    grid.appendChild(img);
  });
}

function initInteraction() {
  const container = document.getElementById('panzoom');
  let scale = 1, lastScale = 1;
  let posX = 0, posY = 0, lastX = 0, lastY = 0;
  let initialScale = 1;

  // disable page scroll
  document.body.style.overflow = 'hidden';

  const mc = new Hammer.Manager(container);
  mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
  mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith('pan');

  mc.on('panmove', ev => {
    posX = lastX + ev.deltaX;
    posY = lastY + ev.deltaY;
    update();
  });
  mc.on('panend', () => {
    lastX = posX;
    lastY = posY;
  });

  mc.on('pinchmove', ev => {
    scale = Math.max(initialScale, Math.min(lastScale * ev.scale, 4));
    update();
  });
  mc.on('pinchend', () => {
    lastScale = scale;
  });

  // wheel zoom on desktop
  container.addEventListener('wheel', ev => {
    if (!container.contains(ev.target)) return;
    ev.preventDefault();
    const delta = ev.deltaY < 0 ? 1.1 : 0.9;
    const rect = container.getBoundingClientRect();
    const x = (ev.clientX - rect.left - lastX) / scale;
    const y = (ev.clientY - rect.top - lastY) / scale;
    scale = Math.max(initialScale, Math.min(scale * delta, 4));
    lastScale = scale;
    posX = ev.clientX - rect.left - x * scale;
    posY = ev.clientY - rect.top - y * scale;
    lastX = posX;
    lastY = posY;
    update();
  }, { passive: false });

  // initial fit-to-screen
  setTimeout(() => {
    const grid = document.getElementById('masonry');
    const gb = grid.getBoundingClientRect();
    const pb = container.parentElement.getBoundingClientRect();
    initialScale = Math.min(pb.width / gb.width, pb.height / gb.height);
    scale = lastScale = initialScale;
    posX = (pb.width - gb.width * scale) / 2;
    posY = 20;
    lastX = posX;
    lastY = posY;
    update();
  }, 300);

  function update() {
    container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }
}

function initThemeToggle() {
  document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadImages();
  initInteraction();
  initThemeToggle();
});
