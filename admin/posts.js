import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts = document.getElementById('list-posts'),
      npTitle = document.getElementById('np-title'),
      npContent = document.getElementById('np-content'),
      npTag = document.getElementById('np-tag'),
      uploadInput = document.getElementById('newpost-upload'),
      coverInput = document.getElementById('cover-input'),
      uploadedList = document.getElementById('uploaded-images-list'),
      coverPreview = document.getElementById('cover-preview'),
      btnNewPost = document.getElementById('submit-new-post'),
      fbNewPost = document.getElementById('fb-new-post');

let coverImageUrl = null;

// Helper to upload file and return public URL
async function uploadFile(file, prefix = '') {
  const fileName = `${prefix}${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Load posts into edit section
async function loadPosts() {
  listPosts.textContent = '⏳ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: false });
  if (error) {
    listPosts.textContent = '❌ ' + error.message;
    return;
  }
  if (!data.length) {
    listPosts.textContent = 'Nessun post trovato.';
    return;
  }
  listPosts.innerHTML = '';
  data.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
      <input type="checkbox" class="select-post" data-id="${post.id}" />
      <button class="delete-btn" data-id="${post.id}">❌</button>
      <button class="edit-btn" data-id="${post.id}">✏️</button>
      <span class="post-tag">${post.tag}</span>
      <span class="post-title">${post.title}</span>
    `;
    listPosts.append(div);
  });
  // Checkbox handlers
  const bulkBtn = document.getElementById('bulk-delete-btn');
  const selected = new Set();
  document.querySelectorAll('.select-post').forEach(cb => {
    cb.onchange = () => {
      if (cb.checked) selected.add(cb.dataset.id);
      else selected.delete(cb.dataset.id);
      bulkBtn.disabled = selected.size === 0;
    };
  });
  // Edit handlers
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { data: post, error: err } = await supabase.from('posts').select('*').eq('id', id).single();
      if (err) return alert('Errore fetch post: ' + err.message);
      npTitle.value = post.title;
      npContent.value = post.content;
      npTag.value = post.tag;
      coverImageUrl = post.image_url;
      coverPreview.innerHTML = post.image_url ? `<img src="${post.image_url}" />` : '';
      uploadedList.innerHTML = '';
      showSection('new-post');
      btnNewPost.dataset.editId = id;
      btnNewPost.textContent = 'Salva Modifiche';
    };
  });
  // Delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Eliminare questo post e tutte le sue immagini?')) return;
      const id = btn.dataset.id;
      // fetch post and delete logic...
      // reuse existing delete code
      const { data: post, error: err2 } = await supabase.from('posts').select('*').eq('id', id).single();
      if (err2) return alert('Errore fetch post: ' + err2.message);
      const urls = [];
      if (post.image_url) urls.push(post.image_url);
      const regex = /<img src="(.*?)"/g;
      let m;
      while ((m = regex.exec(post.content)) !== null) urls.push(m[1]);
      const fileNames = urls.map(u => decodeURIComponent(u.split('/').pop()));
      if (fileNames.length) {
        await supabase.storage.from('images').remove(fileNames);
      }
      const { error: err3 } = await supabase.from('posts').delete().eq('id', id);
      if (err3) return alert('Errore delete post: ' + err3.message);
      loadPosts();
      alert('Post eliminato');
    };
  });
  // Bulk delete
  bulkBtn.onclick = async () => {
    if (!confirm(`Eliminare ${selected.size} posts?`)) return;
    for (let id of selected) {
      const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
      const urls = [];
      if (post.image_url) urls.push(post.image_url);
      const regex = /<img src="(.*?)"/g;
      let m;
      while ((m = regex.exec(post.content)) !== null) urls.push(m[1]);
      const fileNames = urls.map(u => decodeURIComponent(u.split('/').pop()));
      if (fileNames.length) await supabase.storage.from('images').remove(fileNames);
    }
    const { error } = await supabase.from('posts').delete().in('id', Array.from(selected));
    if (error) return alert('Errore bulk delete: ' + error.message);
    loadPosts();
    selected.clear();
    bulkBtn.disabled = true;
    alert('Posts eliminati');
  };
}
// Multiple images for content
uploadInput.addEventListener('change', async e => {
  for (const file of e.target.files) {
    try {
      const url = await uploadFile(file);
      const snippet = `<img src=\"${url}\" />`;
      const div = document.createElement('div');
      div.className = 'uploaded-image';
      const img = document.createElement('img');
      img.src = url;
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copia';
      copyBtn.onclick = () => navigator.clipboard.writeText(snippet);
      div.append(img, copyBtn);
      uploadedList.append(div);
    } catch(err) {
      alert('Errore upload: ' + err.message);
    }
  }
  uploadInput.value = '';
});

// Single cover image
coverInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  coverPreview.innerHTML = '';
  try {
    const url = await uploadFile(file, 'cover_');
    coverImageUrl = url;
    const img = document.createElement('img');
    img.src = url;
    coverPreview.appendChild(img);
  } catch(err) {
    alert('Errore upload copertina: ' + err.message);
  }
  coverInput.value = '';
});

// Publish or update post
btnNewPost.addEventListener('click', async () => {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    content: npContent.value,
    tag: npTag.value,
    image_url: coverImageUrl
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
    // reset form
    npTitle.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadedList.innerHTML = '';
    coverPreview.innerHTML = '';
    coverImageUrl = null;
    fbNewPost.textContent = '✅ Operazione completata';
    await loadPosts();
  } catch(err) {
    fbNewPost.textContent = '❌ ' + err.message;
  }
});

// Initial load
loadPosts();
