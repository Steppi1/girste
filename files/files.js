import { getPosts, getSplashTxts } from '../supabase.js';

const articleList    = document.getElementById('article-list');
const articleContent = document.querySelector('.article-content');
const filterButtons  = document.querySelectorAll('.filter-pill');
const headerPhrase   = document.querySelector('.header-phrase');

let posts = [];

async function init() {
  const texts = await getSplashTxts();
  headerPhrase.textContent = texts.length
    ? texts[Math.floor(Math.random() * texts.length)]
    : '';
  posts = await getPosts();
  setupFilters();
  applyFilter('all');
}

function renderList(data) {
  articleList.innerHTML = data.map(p => `
    <li class="article" data-id="${p.id}" data-tag="${p.tag}">
      <span class="title">${p.title}</span>
    </li>
  `).join('');
  document.querySelectorAll('.article').forEach(li => {
    li.addEventListener('click', () => selectArticle(li.dataset.id));
  });
}

function selectArticle(id) {
  document.querySelectorAll('.article').forEach(li => {
    li.classList.toggle('selected', li.dataset.id === id);
  });
  const post = posts.find(p => p.id == id);
  articleContent.innerHTML = post
    ? `<h2>${post.title}</h2><p>${post.snippet}</p>${post.content}`
    : '';
}

function setupFilters() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });
}

function applyFilter(filter) {
  filterButtons.forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter)
  );
  const filtered = filter === 'all'
    ? posts
    : posts.filter(p => p.tag === filter);
  renderList(filtered);
  if (filtered.length) selectArticle(filtered[0].id);
}

window.addEventListener('load', init);
