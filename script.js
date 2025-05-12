
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Config Supabase
const supabase = createClient('https://mcvvvhpmpouuupwqlbsn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'); // TRONCATO

// Init Panzoom con inerzia
const panzoomInstance = panzoom(document.getElementById('panzoom'), {
  maxZoom: 5,
  minZoom: 0.05,
  bounds: true,
  boundsPadding: 1.5, // consente pan oltre i limiti ma con un margine
  autocenter: false,
  zoomDoubleClickSpeed: 1,
  smoothScroll: true
});

// Inerzia (pan a rilascio morbido)
let isPanning = false;
let velocity = { x: 0, y: 0 };
let last = { x: 0, y: 0 };
let raf;

document.getElementById('wrapper').addEventListener('pointerdown', e => {
  isPanning = true;
  velocity = { x: 0, y: 0 };
  last = { x: e.clientX, y: e.clientY };
  cancelAnimationFrame(raf);
});

document.getElementById('wrapper').addEventListener('pointermove', e => {
  if (!isPanning) return;
  const dx = e.clientX - last.x;
  const dy = e.clientY - last.y;
  velocity = { x: dx, y: dy };
  last = { x: e.clientX, y: e.clientY };
});

document.getElementById('wrapper').addEventListener('pointerup', () => {
  isPanning = false;
  applyInertia();
});

function applyInertia() {
  const friction = 0.9;
  function step() {
    velocity.x *= friction;
    velocity.y *= friction;
    panzoomInstance.moveBy(velocity.x, velocity.y);
    if (Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5) {
      raf = requestAnimationFrame(step);
    }
  }
  raf = requestAnimationFrame(step);
}

// Carica immagini dal bucket Supabase 'mosaic'
async function loadImages() {
  const { data, error } = await supabase.storage.from('mosaic').list('', { limit: 100 });
  if (error) {
    console.error('Errore caricamento immagini:', error);
    return;
  }

  const panzoomEl = document.getElementById('panzoom');
  data.forEach(item => {
    const img = document.createElement('img');
    img.src = `https://mcvvvhpmpouuupwqlbsn.supabase.co/storage/v1/object/public/mosaic/${item.name}`;
    img.className = 'tile';
    panzoomEl.appendChild(img);
  });

  await new Promise(r => setTimeout(r, 500)); // attesa layout immagini
  applyInitialZoomAndCenter();
}

// Zoom iniziale e centraggio
function applyInitialZoomAndCenter() {
  const wrapper = document.getElementById('wrapper');
  const panzoomEl = document.getElementById('panzoom');

  const wrapperRect = wrapper.getBoundingClientRect();
  const contentRect = panzoomEl.getBoundingClientRect();

  const scaleX = wrapperRect.width / contentRect.width;
  const scaleY = wrapperRect.height / contentRect.height;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  panzoomInstance.zoomAbs(0, 0, scale);

  const panX = (wrapperRect.width - contentRect.width * scale) / 2;
  const panY = (wrapperRect.height - contentRect.height * scale) / 2;

  panzoomInstance.moveTo(panX, panY);
}

loadImages();
