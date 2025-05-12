import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts   = document.getElementById('list-posts');
const btnNewPost  = document.getElementById('submit-new-post');
const fbNewPost   = document.getElementById('fb-new-post');
const npTitle     = document.getElementById('np-title');
const npSnippet   = document.getElementById('np-snippet');
const npContent   = document.getElementById('np-content');
const npTag       = document.getElementById('np-tag');

btnNewPost.addEventListener('click', async () => {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    snippet: npSnippet.value,
    content: npContent.value,
    tag: npTag.value,
    user_id: (await supabase.auth.getSession()).data.session.user.id
  };
  try {
    if (btnNewPost.dataset.editId) {
      const { error } = await supabase.from('posts').update(payload).eq('id', btnNewPost.dataset.editId);
      delete btnNewPost.dataset.editId;
      btnNewPost.textContent = 'Pubblica Post';
      if (error) throw error;
    } else {
      const { error } = await supabase.from('posts').insert([payload]);
      if (error) throw error;
    }
    npTitle.value = npSnippet.value = npContent.value = '';
    npTag.value = 'tools';
    fbNewPost.textContent = '✅ Operazione completata';
    loadPosts();
  } catch (err) {
    console.error('Errore CRUD post:', err);
    fbNewPost.textContent = '❌ ' + err.message;
    fbNewPost.className = 'feedback error';
  }
});

export async function loadPosts() {
  listPosts.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('date', { ascending:false });
  if (error) { listPosts.textContent = error.message; return; }
  if (!data.length) { listPosts.textContent = 'Nessun post.'; return; }
  listPosts.innerHTML = data.map(p => `
    <div data-id="${p.id}">
      <strong>${p.title}</strong>
      <button class="edit-post">✏️</button>
      <button class="del-post">🗑️</button>
    </div>
  `).join('');
  listPosts.querySelectorAll('.edit-post').forEach(b => {
    b.onclick = () => {
      const p = data.find(x => x.id == b.parentElement.dataset.id);
      npTitle.value = p.title;
      npSnippet.value = p.snippet;
      npContent.value = p.content;
      npTag.value = p.tag;
      showSection('new-post');
      btnNewPost.dataset.editId = p.id;
      btnNewPost.textContent = 'Aggiorna Post';
    };
  });
  listPosts.querySelectorAll('.del-post').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Confermi cancellazione?')) return;
      const id = b.parentElement.dataset.id;
      try {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
        loadPosts();
      } catch (err) {
        console.error('Errore delete post:', err);
        alert('Errore cancellazione: ' + err.message);
      }
    };
  });
}

// Inizializzazione
window.addEventListener('load', () => loadPosts());
