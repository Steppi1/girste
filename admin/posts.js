import { supabase } from '../supabase.js';
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
  if (btnNewPost.dataset.editId) {
    await supabase.from('posts').update(payload).eq('id', btnNewPost.dataset.editId);
    delete btnNewPost.dataset.editId;
    btnNewPost.textContent = 'Pubblica Post';
  } else {
    await supabase.from('posts').insert([payload]);
  }
  npTitle.value = npSnippet.value = npContent.value = '';
  npTag.value = 'tools';
  fbNewPost.textContent = '✅ Operazione completata';
  loadPosts();
});

export async function loadPosts() {
  listPosts.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('date', { ascending:false });
  if (error) { listPosts.textContent = error.message; return; }
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
      document.getElementById('np-title').value = p.title;
      document.getElementById('np-snippet').value = p.snippet;
      document.getElementById('np-content').value = p.content;
      document.getElementById('np-tag').value = p.tag;
      showSection('new-post');
      b.parentElement.parentElement.querySelector('#submit-new-post').dataset.editId = p.id;
    };
  });
  listPosts.querySelectorAll('.del-post').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Confermi cancellazione?')) return;
      await supabase.from('posts').delete().eq('id', b.parentElement.dataset.id);
      loadPosts();
    };
  });
}

// inizializzazione
window.addEventListener('load', () => loadPosts());
