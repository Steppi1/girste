import { supabase } from '/supabase.js';

const listMosaic = document.getElementById('list-mosaic');
const bulkDeleteMosaic = document.getElementById('bulk-delete-mosaic');
const mosaicUpload = document.getElementById('mosaic-upload');
let selected = new Set();

// Helper to upload file
async function uploadMosaic(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('mosaic').upload(fileName, file);
  if (error) throw error;
}

// Load all mosaic images from 'mosaic' bucket
export async function loadMosaic() {
  listMosaic.textContent = '⏳ Caricamento…';
  const { data: files, error } = await supabase.storage.from('mosaic').list('');
  if (error) {
    listMosaic.textContent = '❌ ' + error.message;
    return;
  }
  listMosaic.innerHTML = '';
  selected.clear();
  bulkDeleteMosaic.disabled = true;

  files.forEach(file => {
    const { data: urlData } = supabase.storage.from('mosaic').getPublicUrl(file.name);
    const url = urlData.publicUrl;
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

// Handle mosaic upload input
mosaicUpload.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await uploadMosaic(file);
    await loadMosaic();
  } catch (err) {
    alert('Errore upload mosaic: ' + err.message);
  }
  mosaicUpload.value = '';
});

// Bulk delete selected mosaic images
bulkDeleteMosaic.addEventListener('click', async () => {
  if (!confirm(`Eliminare ${selected.size} immagini?`)) return;
  const names = Array.from(selected);
  const { error } = await supabase.storage.from('mosaic').remove(names);
  if (error) {
    alert('Errore eliminazione: ' + error.message);
    return;
  }
  await loadMosaic();
});

// Initialize on section show
import { showSection } from './nav.js';
export function initMosaic() {
  loadMosaic();
}

// Ensure nav triggers load
// in nav.js, call initMosaic() when section is manage-mosaic
