import { getPosts as fetchPosts } from '../supabase.js';
import { getQueryParam } from './utils.js';

let _allPosts = [];

export function allPosts() {
  return _allPosts;
}

// Helper per generare slug dal titolo
function slugify(title) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanum with -
    .replace(/(^-+|-+$)/g, '');  // Trim -
}

// Caricamento articoli, show corretto in base a slug/id
export async function loadArticles(renderCallback) {
  const { data } = await fetchPosts(); // fetch ordinato in supabase.js
  if (!data) return;

  _allPosts = data.map(post => ({
    ...post,
    slug: slugify(post.title)
  }));

  renderCallback(_allPosts);

  const id = getQueryParam('id');
  const slug = getQueryParam('slug');
  let article = null;

  if (id) {
    article = _allPosts.find(p => p.id == id);
  } else if (slug) {
    article = _allPosts.find(p => p.slug === slug);
  }

  if (article) {
    const el = document.querySelector(`.article[data-id="${article.id}"]`);
    if (el) el.classList.add('open');
  }
}