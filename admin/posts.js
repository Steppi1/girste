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
      btnSaveDraft = document.getElementById('save-draft'),
      btnPublish = document.getElementById('submit-new-post'),
      fbNewPost = document.getElementById('fb-new-post'),
      bulkDeleteBtn = document.getElementById('bulk-delete-btn');

let coverImageUrl = null;

// Upload helper
async function uploadFile(file, prefix = '') {
  const fileName = `${prefix}${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('images').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Load posts
async function loadPosts() {
  listPosts.textContent = '⌛ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: false });
  if (error) {
    listPosts.textContent = '❌ ' + error.message;
    return;
  }
  listPosts.innerHTML = '';
  if (data.length === 0) {
    listPosts.textContent = 'Nessun post trovato.';
    return;
  }

  const selected = new Set();
  bulkDeleteBtn.disabled = true;

  data.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
      <input type="checkbox" class="select-post" data-id="${post.id}" />
      <button class="delete-btn" data-id="${post.id}">❌</button>
      <button class="edit-btn" data-id="${post.id}">✏️</button>
      ${post.status === 'draft' ? '<span class="badge draft">Bozza</span>' : ''}
      <span class="post-tag">${post.tag}</span>
      <span class="post-title">${post.title}</span>
    `;
    listPosts.appendChild(div);
  });

  // Checkbox change
  document.querySelectorAll('.select-post').forEach(cb => {
    cb.onchange = () => {
      if (cb.checked) selected.add(cb.dataset.id);
      else selected.delete(cb.dataset.id);
      bulkDeleteBtn.disabled = selected.size === 0;
    };
  });

  // Edit handler
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) return alert('Errore fetch post: ' + error.message);
      npTitle.value = post.title;
      npContent.value = post.content;
      npTag.value = post.tag;
      coverImageUrl = post.image_url;
      coverPreview.innerHTML = post.image_url ? `<img src="${post.image_url}" />` : '';
      uploadedList.innerHTML = '';
      showSection('new-post');
      btnPublish.dataset.editId = id;
      btnPublish.textContent = 'Salva Modifiche';
    };
  });

  // Delete handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Eliminare questo post e tutte le sue immagini?')) return;
      const id = btn.dataset.id;
      // fetch post
      const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) return alert('Errore fetch post: ' + error.message);
      // gather files
      const urls = [];
      if (post.image_url) urls.push(post.image_url);
      const regex = /<img src="(.*?)"/g;
      let m;
      while ((m = regex.exec(post.content)) !== null) urls.push(m[1]);
      const fileNames = urls.map(u => decodeURIComponent(u.split('/').pop()));
      if (fileNames.length) {
        const { error: delErr } = await supabase.storage.from('images').remove(fileNames);
        if (delErr) console.warn('Errore delete storage:', delErr.message);
      }
      // delete post
      const { error: delPostErr } = await supabase.from('posts').delete().eq('id', id);
      if (delPostErr) return alert('Errore delete post: ' + delPostErr.message);
      loadPosts();
    };
  });

  // Bulk delete
  bulkDeleteBtn.onclick = async () => {
    if (!confirm(`Eliminare ${selected.size} posts?`)) return;
    // delete each
    for (let id of selected) {
      const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
      const urls = [];
      if (post.image_url) urls.push(post.image_url);
      const regex = /<img src="(.*?)"/g;
      let m;
      while ((m = regex.exec(post.content)) !== null) urls.push(m[1]);
      const fileNames = urls.map(u => decodeURIComponent(u.split('/').pop()));
      if (fileNames.length) {
        await supabase.storage.from('images').remove(fileNames);
      }
    }
    const { error: bulkErr } = await supabase.from('posts').delete().in('id', Array.from(selected));
    if (bulkErr) return alert('Errore bulk delete: ' + bulkErr.message);
    selected.clear();
    bulkDeleteBtn.disabled = true;
    loadPosts();
  };
}

// Submit draft or publish
async function submitPost(status) {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    content: npContent.value,
    tag: npTag.value,
    image_url: coverImageUrl,
    status
  };
  try {
    if (btnPublish.dataset.editId) {
      await supabase.from('posts').update(payload).eq('id', btnPublish.dataset.editId);
      delete btnPublish.dataset.editId;
      btnPublish.textContent = 'Pubblica Post';
    } else {
      await supabase.from('posts').insert([payload]);
    }
    // reset form
    npTitle.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadedList.innerHTML = '';
    coverPreview.innerHTML = '';
    coverImageUrl = null;
    fbNewPost.textContent = '✅ Operazione completata';
    loadPosts();
    showSection('edit-post');
  } catch (err) {
    fbNewPost.textContent = '❌ ' + err.message;
  }
}

// Image upload for content
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
      uploadedList.appendChild(div);
    } catch (error) {
      alert('Errore upload: ' + error.message);
    }
  }
  uploadInput.value = '';
});

// Cover upload
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
  } catch (error) {
    alert('Errore upload copertina: ' + error.message);
  }
  coverInput.value = '';
});

// Button events
btnSaveDraft.addEventListener('click', () => submitPost('draft'));
btnPublish.addEventListener('click', () => submitPost('published'));

// Initial
loadPosts();