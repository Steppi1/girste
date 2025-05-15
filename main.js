import { supabase } from './supabase.js';
import { zoom, select, zoomIdentity } from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function init() {
  const { data: files, error } = await supabase
    .storage.from('mosaic').list('', { limit: 1000 });
  if (error) { console.error(error); return; }
  const count = files.length;
  if (!count) return;

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cell = 200; // px
  const gap = 12;

  const width  = cols * cell + (cols + 1) * gap;
  const height = rows * cell + (rows + 1) * gap;

  const svg = select('#svg-canvas');
  svg.attr('viewBox', [0, 0, width, height]);

  const container = svg.append('g');

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

  const zoomBehavior = zoom()
    .scaleExtent([0.1, 4])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    });

  svg.call(zoomBehavior)
     .call(zoomBehavior.transform, zoomIdentity.translate((svg.node().clientWidth - width) / 2,
                                                        (svg.node().clientHeight - height) / 2)
                                              .scale(Math.min(svg.node().clientWidth / width,
                                                              svg.node().clientHeight / height)));

  // Ensure pan on mouse drag works without prior zoom
  svg.on("dblclick.zoom", null); // disable dblclick zoom if undesired
}

window.addEventListener('DOMContentLoaded', init);
