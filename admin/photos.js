import { supabase } from '/supabase.js';

const listPhotos = document.getElementById('list-photos');
const bulkDeleteBtn = document.getElementById('bulk-delete-photos-btn');

let selected = new Set();

// Prendi solo i nomi file usati nei post
async function fetchUsedFilenames() {
  const { data: posts, error } = await supabase.from('posts').select('image_url, content');
  if (error) {
    console.error('Errore fetch post:', error);
    return new Set();
  }

  const used = new Set();
  posts.forEach(post => {
    if (post.image_url) {
      used.add(post.image_url.split('/').pop());
    }
    const matches = [...post.content.matchAll(/<img src=\"(.*?)\"/g)];
    matches.forEach(match => used.add(match[1].split('/').pop()));
  });
  return used;
}

export async function loadPhotos() {
  listPhotos.textContent = '⏳ Caricamento…';
  const usedFilenames = await fetchUsedFilenames();
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
    const isUsed = usedFilenames.has(file.name);

    const div = document.createElement('div');
    div.className = 'photo-item';

    const controls = document.createElement('div');
    controls.className = 'photo-item-controls';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'select-photo';
    checkbox.dataset.name = file.name;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-link';
    copyBtn.title = 'Copia HTML';
    copyBtn.textContent = '📋';

    const tick = document.createElement('span');
    tick.className = 'tick';
    tick.textContent = '✅';
    tick.style.display = isUsed ? 'inline' : 'none';

    controls.appendChild(checkbox);
    controls.appendChild(copyBtn);
    controls.appendChild(tick);

    div.innerHTML = `<img src="${publicUrl}" alt="${file.name}" />`;
    div.appendChild(controls);
    listPhotos.appendChild(div);
  });

  // Selezione immagini
  document.querySelectorAll('.select-photo').forEach(cb => {
    cb.onchange = () => {
      const name = cb.dataset.name;
      cb.checked ? selected.add(name) : selected.delete(name);
      bulkDeleteBtn.disabled = selected.size === 0;
    };
  });

  // Copia HTML
  document.querySelectorAll('.copy-link').forEach(btn => {
    btn.onclick = () => {
      const img = btn.closest('.photo-item').querySelector('img');
      const html = `<img src=\"${img.src}\" alt=\"${img.alt}\" />`;
      navigator.clipboard.writeText(html).then(() => {
        btn.style.opacity = '0.4';
        setTimeout(() => (btn.style.opacity = '1'), 800);
      });
    };
  });
}

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

window.addEventListener('load', () => {
  loadPhotos();
});
