import { supabase } from '../supabase.js';

export async function loadSplashes() {
  const listSplashes = document.getElementById('list-splash');
  if (!listSplashes) return;

  listSplashes.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('splashtxt').select('*');
  if (error) {
    listSplashes.textContent = '❌ ' + error.message;
    return;
  }
  if (!data.length) {
    listSplashes.textContent = 'Nessuno splash.';
    return;
  }
  listSplashes.innerHTML = '';
  data.forEach(s => {
    const div = document.createElement('div');
    div.className = 'splash-item';
    div.innerHTML = `
      <button class="save-btn">Save</button>
      <button class="del-btn">Del</button>
      <input type="text" value="${s.phrase}" data-id="${s.id}" />
    `;
    listSplashes.appendChild(div);
  });

  // Attach handlers
  document.querySelectorAll('.save-btn').forEach(btn => {
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

  document.querySelectorAll('.del-btn').forEach(btn => {
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

// Optional: Safe splash create button (if exists)
window.addEventListener('load', () => {
  const btnSaveSplash = document.getElementById('save-splash');
  const inputSplash = document.getElementById('splash-input');
  const fbSplash = document.getElementById('fb-splash');

  if (btnSaveSplash && inputSplash && fbSplash) {
    btnSaveSplash.addEventListener('click', async () => {
      const phrase = inputSplash.value.trim();
      if (!phrase) return;
      try {
        const { error } = await supabase.from('splashtxt').insert({ phrase });
        if (error) throw error;
        inputSplash.value = '';
        fbSplash.textContent = '✅ Aggiunto!';
        await loadSplashes();
      } catch (err) {
        fbSplash.textContent = '❌ ' + err.message;
      }
    });
  }
});
