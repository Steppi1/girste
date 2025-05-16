import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts = document.getElementById('list-posts'),
      btnNewPost = document.getElementById('submit-new-post'),
      fbNewPost = document.getElementById('fb-new-post'),
      npTitle = document.getElementById('np-title'),
      npSnippet = document.getElementById('np-snippet'),
      npContent = document.getElementById('np-content'),
      npTag = document.getElementById('np-tag'),
      uploadInput = document.getElementById('newpost-upload'),
      uploadedList = document.getElementById('uploaded-images-list');

let coverImageUrl = null;

btnNewPost.addEventListener('click', async () => {
  fbNewPost.textContent = '';
  const payload = {
    title: npTitle.value,
    snippet: npSnippet.value,
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
    npSnippet.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadInput.value = '';
    uploadedList.innerHTML = '';
    coverImageUrl = null;
    btnNewPost.textContent = '✅ Operazione completata';
    await loadPosts();
  } catch (err) {
    fbNewPost.textContent = '❌ ' + err.message;
    fbNewPost.className = 'feedback error';
  }
});

uploadInput.addEventListener('change', async e => {
  for (const file of e.target.files) {
    const fileName = `${Date.now()}_${file.name}`;
    try {
      const { error: upErr } = await supabase.storage.from('images').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
      const url = urlData.publicUrl;
      const snippet = `<img src="${url}" />`;
      const div = document.createElement('div');
      div.className = 'uploaded-image';
      div.innerHTML = `
        <img src="${url}">
        <code>${snippet}</code>
        <button class="copy-btn">Copia</button>
        <button class="cover-btn">Copertina</button>
      `;
      // copy-to-clipboard
      div.querySelector('.copy-btn').onclick = () => navigator.clipboard.writeText(snippet);
      // set cover image
      div.querySelector('.cover-btn').onclick = () => {
        coverImageUrl = url;
        // reset other cover buttons
        document.querySelectorAll('.cover-btn').forEach(btn => btn.textContent = 'Copertina');
        div.querySelector('.cover-btn').textContent = 'Copertina ✓';
      };
      uploadedList.appendChild(div);
    } catch (err) {
      alert('Errore upload: ' + err.message);
    }
  }
});
