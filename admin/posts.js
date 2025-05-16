import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts = document.getElementById('list-posts'),
      btnNewPost = document.getElementById('submit-new-post'),
      btnSetCover = document.getElementById('btn-set-cover'),
      fbNewPost = document.getElementById('fb-new-post'),
      npTitle = document.getElementById('np-title'),
      npContent = document.getElementById('np-content'),
      npTag = document.getElementById('np-tag'),
      uploadInput = document.getElementById('newpost-upload'),
      uploadedList = document.getElementById('uploaded-images-list');

let coverImageUrl = null;

// Publish post
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
      if (error) throw error;
      btnNewPost.textContent = 'Pubblica Post';
    } else {
      const { error } = await supabase.from('posts').insert([payload]);
      if (error) throw error;
    }
    // reset form
    npTitle.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadInput.value = '';
    uploadedList.innerHTML = '';
    coverImageUrl = null;
    btnSetCover.disabled = true;
    btnNewPost.textContent = '✅ Operazione completata';} catch (err) {
    fbNewPost.textContent = '❌ ' + err.message;
    fbNewPost.className = 'feedback error';
  }
});

// Handle uploads
uploadInput.addEventListener('change', async e => {
  uploadedList.innerHTML = '';
  coverImageUrl = null;
  btnSetCover.disabled = true;
  for (const file of e.target.files) {
    const fileName = `${Date.now()}_${file.name}`;
    try {
      const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
      const url = urlData.publicUrl;
      const snippet = `<img src=\"${url}\" />`;
      // create container
      const div = document.createElement('div');
      div.className = 'uploaded-image';
      // image preview
      const imgEl = document.createElement('img');
      imgEl.src = url;
      // copy button
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copia';
      copyBtn.onclick = () => navigator.clipboard.writeText(snippet);
      // selection
      div.onclick = () => {
        document.querySelectorAll('.uploaded-image').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        coverImageUrl = url;
        btnSetCover.disabled = false;
      };
      // append
      div.append(imgEl, copyBtn);
      uploadedList.appendChild(div);
    } catch (err) {
      alert('Errore upload: ' + err.message);
    }
  }
});

// Set cover explicit removed


// Cover logic
const coverInput = document.getElementById('cover-input'),
      coverPreview = document.getElementById('cover-preview');

document.getElementById('btn-set-cover').addEventListener('click', () => {
  coverInput.click();
});

coverInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  // clear previous preview
  coverPreview.innerHTML = '';
  try {
    const fileName = `cover_${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);
    if (upErr) throw upErr;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    const url = urlData.publicUrl;
    coverImageUrl = url;
    // show preview
    const img = document.createElement('img');
    img.src = url;
    coverPreview.appendChild(img);
    // disable button to prevent re-click
    const btn = document.getElementById('btn-set-cover');
    btn.textContent = 'Copertina ✓';
    btn.disabled = true;
  } catch (err) {
    alert('Errore upload copertina: ' + err.message);
  }
});
