import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const npTitle = document.getElementById('np-title'),
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

// Multiple images
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

// Single cover
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

// Save draft
btnSaveDraft.addEventListener('click', async () => {
  await submitPost('draft');
});

// Publish post
btnPublish.addEventListener('click', async () => {
  await submitPost('published');
});

// Common submit function
async function submitPost(status) {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    content: npContent.value,
    tag: npTag.value,
    image_url: coverImageUrl,
    status: status
  };
  try {
    const { error } = await supabase.from('posts').insert([payload]);
    if (error) throw error;
    npTitle.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadedList.innerHTML = '';
    coverPreview.innerHTML = '';
    coverImageUrl = null;
    fbNewPost.textContent = '✅ Operazione completata';
  } catch(err) {
    fbNewPost.textContent = '❌ ' + err.message;
  }
}

// Initialize edit-post list if needed
// (existing loadPosts remains unchanged)
