import { supabase } from './supabase.js';
// Reverted to original working CDN path
import panzoom from 'https://cdn.jsdelivr.net/npm/@panzoom/panzoom@9.4.0/dist/panzoom.es.js';

const viewport = document.getElementById('viewport');
const imageGrid = document.getElementById('image-grid');

async function init() {
  // Fetch list of image files from Supabase
  const { data: files, error } = await supabase.storage.from('images').list('', { limit: 1000 });
  if (error) {
    console.error('Errore nel recupero delle immagini:', error);
    return;
  }
  const count = files.length;
  if (count === 0) return;

  // Determine grid dimensions for a roughly square mosaic
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const cellSize = 200; // px
  const gap = 12; // match CSS

  // Configure grid layout
  imageGrid.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
  imageGrid.style.gridAutoRows = `${cellSize}px`;
  imageGrid.style.gap = `${gap}px`;

  // Calculate full grid size
  const gridWidth = columns * cellSize + (columns - 1) * gap;
  const gridHeight = rows * cellSize + (rows - 1) * gap;
  imageGrid.style.width = `${gridWidth}px`;
  imageGrid.style.height = `${gridHeight}px`;

  // Populate grid with images
  files.forEach(file => {
    const { data } = supabase.storage.from('images').getPublicUrl(file.name);
    const url = data.publicUrl;
    const img = document.createElement('img');
    img.src = url;
    imageGrid.appendChild(img);
  });

  // Initialize panzoom for panning and pinch-zoom
  const panzoomInstance = panzoom(imageGrid, {
    contain: 'outside',
    maxZoom: 4,
    minZoom: 0.1,
    panOnlyWhenZoomed: false,
    smoothScroll: false,
    beforeWheel: () => false,  // disable wheel zoom/scroll
    beforeMouseDown: () => true // allow dragging with mouse
  });

  // Fit the entire grid within the viewport on load
  const vpRect = viewport.getBoundingClientRect();
  const scale = Math.min(vpRect.width / gridWidth, vpRect.height / gridHeight);
  panzoomInstance.zoomAbs(0, 0, scale);

  // Center the grid
  const offsetX = (vpRect.width - gridWidth * scale) / 2;
  const offsetY = (vpRect.height - gridHeight * scale) / 2;
  panzoomInstance.moveTo(offsetX, offsetY);
}

window.addEventListener('DOMContentLoaded', init);
