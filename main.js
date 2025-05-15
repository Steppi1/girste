import { supabase } from './supabase.js';
import { zoom, select } from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function init() {
  // 1. Recupera lista immagini
  const { data: files, error } = await supabase
    .storage.from('images').list('', { limit: 1000 });
  if (error) { console.error(error); return; }
  const count = files.length;
  if (!count) return;

  // 2. Calcola dimensioni griglia
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cell = 200; // px
  const gap = 12;

  const width  = cols * cell + (cols - 1) * gap;
  const height = rows * cell + (rows - 1) * gap;

  // 3. Crea SVG e <g> per zoom/pan
  const svg = select('#svg-canvas')
    .attr('viewBox', [0, 0, width, height]);
  const container = svg.append('g');

  // 4. Inserisci immagini
  files.forEach((file, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = col * (cell + gap);
    const y = row * (cell + gap);
    const url = supabase
      .storage.from('images').getPublicUrl(file.name).data.publicUrl;
    container.append('image')
      .attr('x', x).attr('y', y)
      .attr('width', cell).attr('height', cell)
      .attr('href', url);
  });

  // 5. Configura zoom con bound ampio
  svg.call(zoom()
    .scaleExtent([0.1, 4])
    .translateExtent([[-width, -height], [2*width, 2*height]])
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    })
  );

  // 6. De-zoom iniziale per fit-to-screen
  const vp = document.getElementById('viewport').getBoundingClientRect();
  const initScale = Math.min(vp.width/width, vp.height/height);
  container.attr('transform', `translate(${(vp.width-width*initScale)/2},${(vp.height-height*initScale)/2}) scale(${initScale})`);
}

window.addEventListener('DOMContentLoaded', init);
