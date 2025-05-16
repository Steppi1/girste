import { supabase } from '/supabase.js';

const listMosaic = document.getElementById('list-mosaic');
const bulkDeleteMosaic = document.getElementById('bulk-delete-mosaic');
let selected = new Set();

// Load all mosaic images
export async function loadMosaic() {
  listMosaic.textContent = '⏳ Caricamento…';
  const { data: files, error } = await supabase.storage.from('images').list('');
  if (error) {
    listMosaic.textContent = '❌ ' + error.message;
    return;
  }
  listMosaic.innerHTML = '';
  selected.clear();
  bulkDeleteMosaic.disabled = true;

  files.forEach(file => {
    const url = supabase.storage.from('images').getPublicUrl(file.name).data.publicUrl;
    const div = document.createElement('div');
    div.className = 'mosaic-item';
    div.innerHTML = `
      <img src="${url}" alt="${file.name}" />
      <input type="checkbox" class="select-mosaic" data-name="${file.name}" />
    `;
    listMosaic.appendChild(div);
  });

  document.querySelectorAll('.select-mosaic').forEach(cb => {
    cb.onchange = () => {
      const name = cb.dataset.name;
      if (cb.checked) selected.add(name);
      else selected.delete(name);
      bulkDeleteMosaic.disabled = selected.size === 0;
    };
  });
}

// Bulk delete selected
bulkDeleteMosaic.addEventListener('click', async () => {
  if (!confirm(`Eliminare ${selected.size} immagini?`)) return;
  const names = Array.from(selected);
  const { error } = await supabase.storage.from('images').remove(names);
  if (error) {
    alert('Errore eliminazione: ' + error.message);
    return;
  }
  await loadMosaic();
});

// Initialize on load
window.addEventListener('DOMContentLoaded', loadMosaic);
