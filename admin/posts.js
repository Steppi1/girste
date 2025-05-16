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
      fbNewPost = document.getElementById('fb-new-post');

let coverImageUrl = null;

// Helper to upload file and return URL
async function uploadFile(file, prefix = '') {
  const fileName = `${prefix}${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Load posts for edit section
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
    listPosts.append(div);
  });
  // ... attach handlers for checkboxes, edits, deletes, bulk delete (existing code) ...
}

// Handle multiple image uploads
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

// Handle single cover upload
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

// Common submit function
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
    // if editing existing
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
    await loadPosts();
    showSection('edit-post');
  } catch(err) {
    fbNewPost.textContent = '❌ ' + err.message;
  }
}

// Button events
btnSaveDraft.addEventListener('click', () => submitPost('draft'));
btnPublish.addEventListener('click', () => submitPost('published'));

// Initial load of posts
loadPosts();
