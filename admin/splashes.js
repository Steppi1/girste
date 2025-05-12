import { supabase } from '/supabase.js';

const listSplash   = document.getElementById('list-splash');
const btnNewSplash = document.getElementById('submit-new-splash');
const fbNewSplash  = document.getElementById('fb-new-splash');

btnNewSplash.addEventListener('click', async () => {
  const phrase = prompt('Inserisci splash-text:');
  if (!phrase) return;
  try {
    const { error } = await supabase.from('splashtxt').insert({ phrase });
    if (error) throw error;
    fbNewSplash.textContent = '✅ Aggiunto!';
    loadSplashes();
  } catch (err) {
    console.error('Errore add splash:', err);
    fbNewSplash.textContent = '❌ ' + err.message;
    fbNewSplash.className = 'feedback error';
  }
});

export async function loadSplashes() {
  listSplash.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('splashtxt').select('*');
  if (error) { listSplash.textContent = error.message; return; }
  if (!data.length) { listSplash.textContent = 'Nessuno splash.'; return; }
  listSplash.innerHTML = data.map(s => `
    <div data-id="${s.id}">
      "${s.phrase}"
      <button class="del-splash">🗑️</button>
    </div>
  `).join('');
  listSplash.querySelectorAll('.del-splash').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Cancelli questo splash?')) return;
      const id = b.parentElement.dataset.id;
      try {
        const { error } = await supabase.from('splashtxt').delete().eq('id', id);
        if (error) throw error;
        loadSplashes();
      } catch (err) {
        console.error('Errore delete splash:', err);
        alert('Errore cancellazione: ' + err.message);
      }
    };
  });
}

// Inizializzazione
window.addEventListener('load', () => loadSplashes());
