import { supabase } from '/supabase.js';
const listSplashes = document.getElementById('list-splashes'),
  inputSplash = document.getElementById('splash-input'),
  btnSaveSplash = document.getElementById('save-splash'),
  fbSplash = document.getElementById('fb-splash');

// Save new splash
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

// Load and manage splashes
export async function loadSplashes() {
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

// Initialize on load
window.addEventListener('load', () => loadSplashes());
