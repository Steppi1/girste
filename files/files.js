import { getPosts, getSplashTxts } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Contrast toggle
  document.getElementById('contrast-toggle')
    .addEventListener('click', () => document.body.classList.toggle('dark'));

  // Splash text
  (async () => {
    const txts = await getSplashTxts();
    document.querySelector('.breathing-text').textContent = txts[Math.floor(Math.random() * txts.length)] || '';
  })();

  // Load posts and setup filtering
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');
    const filters = Array.from(document.querySelectorAll('.filter-pill'));

    // Render articles with tag dataset
    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.dataset.id = post.id;
      li.dataset.filter = post.tag; // tag: stories, tools, blog
      li.addEventListener('click', () => {
        document.querySelectorAll('.article.selected').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      list.appendChild(li);
      if (idx === 0) li.click(); // select latest
    });

    // Setup filter logic
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.toggle('active', b === btn));
        const f = btn.getAttribute('data-filter');
        document.querySelectorAll('.article').forEach(li => {
          li.style.display = (f === 'all' || li.dataset.filter === f) ? '' : 'none';
        });
        // open first visible
        const first = Array.from(document.querySelectorAll('.article'))
          .find(li => li.style.display !== 'none');
        if (first) first.click();
      });
    });

    // Activate 'all' by default
    const allBtn = filters.find(b => b.getAttribute('data-filter') === 'all');
    if (allBtn) allBtn.click();
  })();
});