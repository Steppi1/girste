
window.generateSlug = function(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
};

import { supabase } from '/supabase.js';
import { showSection } from './nav.js';

const listPosts = document.getElementById('list-posts'),
      npTitle = document.getElementById('np-title'),
      npContent = document.getElementById('np-content'),
      npTag = document.getElementById('np-tag'),
      uploadInput = document.getElementById('newpost-upload'),
      uploadedList = document.getElementById('uploaded-images-list'),
      btnSaveDraft = document.getElementById('save-draft'),
      btnPublish = document.getElementById('submit-new-post'),
      fbNewPost = document.getElementById('fb-new-post'),
      bulkDeleteBtn = document.getElementById('bulk-delete-btn');

let coverImageUrl = null;

npContent.addEventListener('input', () => {
  npContent.style.height = 'auto';
  npContent.style.height = npContent.scrollHeight + 'px';
});

async function uploadFile(file, prefix = '') {
  const fileName = `${prefix}${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('images').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  return data.publicUrl;
}

async function loadPosts() {
  listPosts.textContent = '⌛ Caricamento…';
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
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

  document.querySelectorAll('.select-post').forEach(cb => {
    cb.onchange = () => {
      if (cb.checked) selected.add(cb.dataset.id);
      else selected.delete(cb.dataset.id);
      bulkDeleteBtn.disabled = selected.size === 0;
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) return alert('Errore fetch post: ' + error.message);
      npTitle.value = post.title;
      npContent.value = post.content;
      npTag.value = post.tag;
      uploadedList.innerHTML = '';
      btnPublish.dataset.editId = id;
      btnPublish.textContent = 'Salva Modifiche';
      showSection('new-post');
    };
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Eliminare questo post e tutte le sue immagini?')) return;
      const id = btn.dataset.id;
      const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) return alert('Errore fetch post: ' + error.message);
      const urls = [];
      const regex = /<img src="(.*?)"/g;
      let m;
      while ((m = regex.exec(post.content)) !== null) urls.push(m[1]);
      const fileNames = urls.map(u => decodeURIComponent(u.split('/').pop()));
      if (fileNames.length) {
        const { error: delErr } = await supabase.storage.from('images').remove(fileNames);
        if (delErr) console.warn('Errore delete storage:', delErr.message);
      }
      const { error: delPostErr } = await supabase.from('posts').delete().eq('id', id);
      if (delPostErr) return alert('Errore delete post: ' + delPostErr.message);
      loadPosts();
    };
  });

  bulkDeleteBtn.onclick = async () => {
    if (!confirm(`Eliminare ${selected.size} posts?`)) return;
    for (let id of selected) {
      const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
      const urls = [];
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

async function submitPost(status) {
  fbNewPost.textContent = '';
  const slug = generateSlug(npTitle.value);
  const payload = {
    title: npTitle.value,
    content: npContent.value,
    tag: npTag.value,
    status,
    slug
  };
  try {
    if (btnPublish.dataset.editId) {
      await supabase.from('posts').update(payload).eq('id', btnPublish.dataset.editId);
      delete btnPublish.dataset.editId;
      btnPublish.textContent = 'Pubblica Post';
    } else {
      await supabase.from('posts').insert([payload]);
    }
    npTitle.value = '';
    npContent.value = '';
    npTag.value = '';
    uploadedList.innerHTML = '';
    fbNewPost.textContent = '✅ Operazione completata';
    loadPosts();
    showSection('edit-post');
  } catch (err) {
    fbNewPost.textContent = '❌ ' + err.message;
  }
}

uploadInput.addEventListener('change', async e => {
  for (const file of e.target.files) {
    try {
      const url = await uploadFile(file);
      const snippet = `<img src="${url}" />`;
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

btnSaveDraft.addEventListener('click', () => submitPost('draft'));
btnPublish.addEventListener('click', () => submitPost('published'));
loadPosts();
