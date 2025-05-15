import { supabase } from './supabase.js';
import { zoom, select } from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function init() {
  // 1. Recupera lista immagini dal bucket 'mosaic'
  const { data: files, error } = await supabase
    .storage.from('mosaic').list('', { limit: 1000 });
  if (error) { console.error('Errore nel recupero delle immagini:', error); return; }
  const count = files.length;
  if (!count) return;

  // 2. Calcola dimensioni griglia con padding uniforme (gap su tutti i lati)
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cell = 200; // px
  const gap = 12;

  const width  = cols * cell + (cols + 1) * gap;
  const height = rows * cell + (rows + 1) * gap;

  // 3. Crea SVG e <g> per zoom/pan
  const svg = select('#svg-canvas')
    .attr('viewBox', [0, 0, width, height]);
  const container = svg.append('g');

  // 4. Inserisci immagini con gap uniforme
  files.forEach((file, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gap + col * (cell + gap);
    const y = gap + row * (cell + gap);
    const url = supabase
      .storage.from('mosaic').getPublicUrl(file.name).data.publicUrl;
    container.append('image')
      .attr('x', x).attr('y', y)
      .attr('width', cell).attr('height', cell)
      .attr('href', url);
  });

  // 5. Configura zoom (drag, pinch, dblclick) con bound ampio
  svg.call(zoom()
    .scaleExtent([0.1, 4])
    .translateExtent([[-width, -height], [2 * width, 2 * height]])
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    })
  );

  // 6. De-zoom iniziale al centro del viewport
  const vp = document.getElementById('viewport').getBoundingClientRect();
  const initScale = Math.min(vp.width / width, vp.height / height);
  const offsetX = vp.width / 2 - (width * initScale) / 2;
  const offsetY = vp.height / 2 - (height * initScale) / 2;
  container.attr('transform', `translate(${offsetX},${offsetY}) scale(${initScale})`);
}

window.addEventListener('DOMContentLoaded', init);
