import { getPosts, getSplashTxts } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contrast-toggle')
    .addEventListener('click', () => document.body.classList.toggle('dark'));
  (async () => {
    const txts = await getSplashTxts();
    const splashEl = document.querySelector('.breathing-text');
    if (!splashEl) return;
    function updateSplash() {
      splashEl.textContent = txts[Math.floor(Math.random() * txts.length)] || '';
    }
    updateSplash();
    setInterval(updateSplash, 4000);
  })();
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');
    const filters = Array.from(document.querySelectorAll('.filter-pill'));
    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title; li.className = 'article';
      li.dataset.filter = post.tag;
      li.addEventListener('click', () => {
        document.querySelectorAll('.article.selected').forEach(el=>el.classList.remove('selected'));
        li.classList.add('selected');
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      list.appendChild(li); if(idx===0) li.click();
    });
    filters.forEach(btn => btn.addEventListener('click',() => {
      filters.forEach(b=>b.classList.toggle('active',b===btn));
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.article').forEach(li => {
        li.style.display=(f==='all'||li.dataset.filter===f)?'':'none';
      });
      const first=Array.from(document.querySelectorAll('.article'))
        .find(li=>li.style.display!=='none');
      if(first) first.click();
    }));
    const all = filters.find(b=>b.dataset.filter==='all');
    if(all) all.click();
  })();
});