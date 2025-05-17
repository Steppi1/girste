import { supabase } from '/supabase.js';

const listPhotos = document.getElementById('list-photos');
const bulkDeleteBtn = document.getElementById('bulk-delete-photos-btn');

let selected = new Set();

// Fetch all used image filenames from posts
async function fetchUsedUrls() {
  const { data: posts, error } = await supabase.from('posts').select('image_url, content');
  if (error) {
    console.error('Error fetching posts:', error);
    return new Set();
  }
  const used = new Set();
  posts.forEach(post => {
    if (post.image_url) {
      const name = post.image_url.split('/').pop();
      used.add(name);
    }
    const regex = /<img src=\"(.*?)\"/g;
    let m;
    while ((m = regex.exec(post.content)) !== null) {
      const name = m[1].split('/').pop();
      used.add(name);
    }
  });
  return used;
}

// Load photos and mark used ones
export async function loadPhotos() {
  listPhotos.textContent = '⏳ Caricamento…';
  const usedUrls = await fetchUsedUrls();
  const { data: files, error } = await supabase.storage.from('images').list('');
  if (error) {
    listPhotos.textContent = '❌ ' + error.message;
    return;
  }
  listPhotos.innerHTML = '';
  selected.clear();
  bulkDeleteBtn.disabled = true;

  files.forEach(file => {
    const publicUrl = supabase.storage.from('images').getPublicUrl(file.name).data.publicUrl;
    const isUsed = usedUrls.has(file.name);

    const div = document.createElement('div');
    div.className = 'photo-item';
    div.innerHTML = `
      <img src="${publicUrl}" alt="${file.name}" />
      <div style="position: absolute; bottom: 0.5rem; left: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
        <input type="checkbox" class="select-photo" data-name="${file.name}" />
        <button class="copy-link" title="Copia HTML" style="font-size:1.2rem; background:transparent; border:none; cursor:pointer;">📋</button>
        ${isUsed ? '<span class="tick" style="margin-left: 0.3rem; font-size: 1.2rem; color: #2ecc71;">✅</span>' : ''}
      </div>
    `;
    listPhotos.appendChild(div);
  });

  // Checkbox handlers
  document.querySelectorAll('.select-photo').forEach(cb => {
    cb.onchange = () => {
      const name = cb.dataset.name;
      if (cb.checked) selected.add(name);
      else selected.delete(name);
      bulkDeleteBtn.disabled = selected.size === 0;
    };
  });

  // Copy HTML buttons
  document.querySelectorAll('.copy-link').forEach(btn => {
    btn.onclick = () => {
      const img = btn.closest('.photo-item').querySelector('img');
      const html = `<img src=\"${img.src}\" alt=\"${img.alt}\" />`;
      navigator.clipboard.writeText(html).then(() => {
        btn.style.opacity = '0.5';
        setTimeout(() => (btn.style.opacity = '1'), 800);
      });
    };
  });
}

// Bulk delete selected photos
bulkDeleteBtn.onclick = async () => {
  if (!confirm(`Eliminare ${selected.size} foto selezionate?`)) return;
  const names = Array.from(selected);
  const { error } = await supabase.storage.from('images').remove(names);
  if (error) {
    alert('Errore eliminazione: ' + error.message);
    return;
  }
  await loadPhotos();
};

// Initialize on load
window.addEventListener('load', () => {
  loadPhotos();
});
