import { supabase } from '../supabase.js';

const listPhotos = document.getElementById('list-photos');

export async function loadPhotos() {
  listPhotos.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.storage.from('images').list('', { limit:100 });
  if (error) { listPhotos.textContent = error.message; return; }
  if (!data.length) { listPhotos.textContent = 'Nessuna foto.'; return; }
  listPhotos.innerHTML = data.map(f => {
    const url = supabase.storage.from('images').getPublicUrl(f.name).data.publicUrl;
    return `
      <div data-file="${f.name}" style="margin-bottom:1rem;">
        <img src="${url}" style="max-width:120px">
        <button class="del-photo">🗑️</button>
      </div>
    `;
  }).join('');
  listPhotos.querySelectorAll('.del-photo').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Eliminare?')) return;
      await supabase.storage.from('images').remove([b.parentElement.dataset.file]);
      loadPhotos();
    };
  });
}

// init
window.addEventListener('load', () => loadPhotos());
