import { supabase } from '/supabase.js';

const listPhotos = document.getElementById('list-photos');

export async function loadPhotos() {
  listPhotos.innerHTML = '⏳ Caricamento…';
  try {
    const { data, error } = await supabase.storage.from('images').list('', { limit:100 });
    if (error) throw error;
    if (!data.length) { listPhotos.innerHTML = 'Nessuna foto.'; return; }
    listPhotos.innerHTML = data.map(f => {
      const url = supabase.storage.from('images').getPublicUrl(f.name).data.publicUrl;
      return `
        <div data-file="${f.name}">
          <img src="${url}">
          <button class="del-photo">🗑️</button>
        </div>
      `;
    }).join('');
    listPhotos.querySelectorAll('.del-photo').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Eliminare questa foto?')) return;
        const file = b.parentElement.dataset.file;
        try {
          const { error } = await supabase.storage.from('images').remove([file]);
          if (error) throw error;
          loadPhotos();
        } catch (err) {
          console.error('Errore delete photo:', err);
          alert('Errore cancellazione: ' + err.message);
        }
      };
    });
  } catch (err) {
    console.error('Errore load photos:', err);
    listPhotos.innerHTML = 'Errore caricamento: ' + err.message;
  }
}

// Inizializzazione
window.addEventListener('load', () => loadPhotos());
