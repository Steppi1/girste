// grid.js
export function buildGrid(container, photos) {
  const count = photos.length;
  const cols  = Math.ceil(Math.sqrt(count));
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  photos.forEach(src => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const img  = document.createElement('img');
    img.src    = src;
    img.loading = 'lazy';
    tile.appendChild(img);
    container.appendChild(tile);
  });
}