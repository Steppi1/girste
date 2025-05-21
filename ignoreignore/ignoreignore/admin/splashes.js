import { supabase } from '../supabase.js';

export async function loadSplashes() {
  const listSplashes = document.getElementById('list-splash');
  if (!listSplashes) return;

  listSplashes.innerHTML = `
    <div class="splash-item new-splash">
      <button id="submit-new-splash" title="Aggiungi">➕</button>
      <input type="text" id="new-splash-input" placeholder="Scrivi un nuovo splash…" />
      <div class="feedback" id="fb-new-splash"></div>
    </div>
  `;

  const addBtn = listSplashes.querySelector('#submit-new-splash');
  const addInput = listSplashes.querySelector('#new-splash-input');
  const fb = listSplashes.querySelector('#fb-new-splash');

  addBtn.onclick = async () => {
    const phrase = addInput.value.trim();
    if (!phrase) return;
    try {
      const { error } = await supabase.from('splashtxt').insert({ phrase });
      if (error) throw error;
      addInput.value = '';
      fb.textContent = '✅ Aggiunto!';
      await loadSplashes();
    } catch (err) {
      fb.textContent = '❌ ' + err.message;
    }
  };

  const { data, error } = await supabase.from('splashtxt').select('*');
  if (error) {
    listSplashes.innerHTML += '<div>❌ ' + error.message + '</div>';
    return;
  }
  if (!data.length) {
    listSplashes.innerHTML += '<div>Nessuno splash.</div>';
    return;
  }

  data.forEach(s => {
    const div = document.createElement('div');
    div.className = 'splash-item';
    div.innerHTML = `
      <button class="save-btn" title="Salva">💾</button>
      <button class="del-btn" title="Elimina">🗑️</button>
      <input type="text" value="${s.phrase}" data-id="${s.id}" />
    `;
    listSplashes.appendChild(div);
  });

  listSplashes.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = async () => {
      const inp = btn.nextElementSibling.nextElementSibling;
      const phrase = inp.value.trim();
      const id = inp.dataset.id;
      try {
        const { error } = await supabase.from('splashtxt').update({ phrase }).eq('id', id);
        if (error) throw error;
        await loadSplashes();
      } catch (err) {
        alert('Errore update: ' + err.message);
      }
    };
  });

  listSplashes.querySelectorAll('.del-btn').forEach(btn => {
    btn.onclick = async () => {
      const inp = btn.nextElementSibling;
      const id = inp.dataset.id;
      try {
        const { error } = await supabase.from('splashtxt').delete().eq('id', id);
        if (error) throw error;
        await loadSplashes();
      } catch (err) {
        alert('Errore delete: ' + err.message);
      }
    };
  });
}
