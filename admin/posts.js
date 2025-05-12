import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts   = document.getElementById('list-posts');
const btnNewPost  = document.getElementById('submit-new-post');
const fbNewPost   = document.getElementById('fb-new-post');
const npTitle     = document.getElementById('np-title');
const npSnippet   = document.getElementById('np-snippet');
const npContent   = document.getElementById('np-content');
const npTag       = document.getElementById('np-tag');
const uploadInput = document.getElementById('newpost-upload');
const uploadLink  = document.getElementById('newpost-upload-link');

btnNewPost.addEventListener('click', async () => {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    snippet: npSnippet.value,
    content: npContent.value,
    tag: npTag.value
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
    uploadLink.value = '';
    fbNewPost.textContent = '✅ Operazione completata';
    await loadPosts();
  } catch (err) {
    console.error('Errore CRUD post:', err);
    fbNewPost.textContent = '❌ ' + err.message;
    fbNewPost.className = 'feedback error';
  }
});

// image upload in new-post
uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fileName = `${Date.now()}_${file.name}`;
  try {
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    const md = `![](${urlData.publicUrl})`;
    uploadLink.value = md;
    // append to content
    npContent.value += `\n${md}\n`;
  } catch (err) {
    console.error('Errore upload image:', err);
    alert('Errore upload: ' + err.message);
  }
});

export async function loadPosts() {
  listPosts.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('date', { ascending:false });
  if (error) {
    listPosts.textContent = error.message;
    return;
  }
  if (!data.length) {
    listPosts.textContent = 'Nessun post.';
    return;
  }
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
        await loadPosts();
      } catch (err) {
        console.error('Errore delete post:', err);
        alert('Errore cancellazione: ' + err.message);
      }
    };
  });
}

window.addEventListener('load', () => loadPosts());
