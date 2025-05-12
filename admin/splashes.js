import { supabase } from '../supabase.js';

const listSplash  = document.getElementById('list-splash');
const btnNewSplash = document.getElementById('submit-new-splash');
const fbNewSplash = document.getElementById('fb-new-splash');

btnNewSplash.addEventListener('click', async () => {
  const phrase = prompt('Inserisci splash-text:');
  if (!phrase) return;
  await supabase.from('splashtxt').insert({ phrase });
  fbNewSplash.textContent = '✅ Aggiunto!';
  loadSplashes();
});

export async function loadSplashes() {
  listSplash.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('splashtxt').select('*');
  if (error) { listSplash.textContent = error.message; return; }
  listSplash.innerHTML = data.map(s => `
    <div data-id="${s.id}">
      "${s.phrase}"
      <button class="del-splash">🗑️</button>
    </div>
  `).join('');
  listSplash.querySelectorAll('.del-splash').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Cancelli questo splash?')) return;
      await supabase.from('splashtxt').delete().eq('id', b.parentElement.dataset.id);
      loadSplashes();
    };
  });
}

// init
window.addEventListener('load', () => loadSplashes());
