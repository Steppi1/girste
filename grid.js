// grid.js
/**
 * Costruisce il mosaico quadrato tramite colonne bilanciate.
 * @param {HTMLElement} container - Il container dove appendere le colonne e i tile.
 * @param {string[]} imageUrls - Array di URL delle immagini.
 * @param {number} numColumns - Numero di colonne (di default 5).
 * @returns {Promise<void>} Promise che si risolve quando tutte le immagini sono caricate.
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function buildMosaic(container, imageUrls, numColumns = 5) {
  container.innerHTML = ''; // Pulisce eventuali contenuti precedenti
  const shuffled = shuffle(imageUrls);
  const columns = [];
  // Crea le colonne
  for (let i = 0; i < numColumns; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    container.appendChild(col);
    columns.push(col);
  }
  // Aggiunge le immagini ai tile
  return new Promise(resolve => {
    let loaded = 0;
    shuffled.forEach((url, idx) => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      const img = document.createElement('img');
      img.src = url;
      img.alt = `img-${idx}`;
      img.onload = () => {
        loaded++;
        if (loaded === shuffled.length) resolve();
      };
      tile.appendChild(img);
      // Inserisce il tile nella colonna con altezza minore
      const targetCol = columns.reduce((prev, curr) =>
        prev.scrollHeight <= curr.scrollHeight ? prev : curr
      );
      targetCol.appendChild(tile);
    });
  });
}
