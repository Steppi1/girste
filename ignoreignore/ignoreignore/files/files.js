
import { supabase, getSplashTxts } from '/supabase.js';

const list = document.getElementById('article-list');
const content = document.querySelector('.article-content');
const filters = document.querySelectorAll('.filter-pill');
const splashEl = document.querySelector('.breathing-text');

let posts = [];

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

function createListItem(post) {
  const li = document.createElement('li');
  li.className = 'article';
  li.dataset.tag = post.tag;
  li.dataset.id = post.id;

  const slug = generateSlug(post.title);
  const a = document.createElement('a');
  a.href = '?slug=' + slug;
  a.textContent = post.title;
  a.style.color = 'inherit';
  a.style.textDecoration = 'none';
  li.appendChild(a);

  li.addEventListener('click', async (e) => {
    e.preventDefault();
    history.pushState({}, '', '?slug=' + slug);
    showArticleBySlug(slug);
    highlightActive(slug);
  });

  return li;
}

function renderList(filter = 'all') {
  list.innerHTML = '';
  posts
    .filter(post => filter === 'all' || post.tag === filter)
    .forEach(post => {
      list.appendChild(createListItem(post));
    });
}

function showArticleBySlug(slug) {
  const post = posts.find(p => generateSlug(p.title) === slug);
  if (!post) return;
  content.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content.replace(/\n/g, '<br>')}</p>
  `;
  highlightActive(slug);
}

function highlightActive(slug) {
  document.querySelectorAll('#article-list a').forEach(a => {
    const hrefSlug = new URL(a.href, window.location.origin).searchParams.get('slug');
    a.style.textDecoration = (hrefSlug === slug) ? 'underline' : 'none';
  });
}

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

filters.forEach(f => {
  f.addEventListener('click', e => {
    filters.forEach(f => f.classList.remove('active'));
    e.target.classList.add('active');

    const filter = e.target.dataset.filter;
    renderList(filter);

    const slug = getQueryParam('slug');
    if (!slug) showArticleBySlug(generateSlug(posts[0].title));
    else highlightActive(slug);
  });
});

window.addEventListener('popstate', () => {
  const slug = getQueryParam('slug');
  if (slug) {
    showArticleBySlug(slug);
  } else {
    showArticleBySlug(generateSlug(posts[0].title));
  }
});

async function init() {
  try {
    const splashTexts = await getSplashTxts();
    splashEl.textContent = splashTexts[Math.floor(Math.random() * splashTexts.length)];
    setInterval(() => {
      splashEl.textContent = splashTexts[Math.floor(Math.random() * splashTexts.length)];
    }, 4000);
  } catch (err) {
    console.error('Errore splash:', err);
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Errore post:', error);
    return;
  }

  posts = data;
  renderList('all');

  const slug = getQueryParam('slug');
  if (slug) {
    showArticleBySlug(slug);
  } else if (posts.length > 0) {
    showArticleBySlug(generateSlug(posts[0].title));
  }
}

init();
