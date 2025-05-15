import { getPosts, getSplashTxts } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Contrast toggle
  document.getElementById('contrast-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Load splash texts
  (async () => {
    const txts = await getSplashTxts();
    document.querySelector('.breathing-text').textContent = txts[Math.floor(Math.random() * txts.length)] || '';
  })();

  // Load posts, start in 'all' and select latest
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');
    const filters = document.querySelectorAll('.filter-pill');

    // Setup filter buttons from initial working file
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.article').forEach(li => {
          li.style.display = (filter === 'all' || li.dataset.filter === filter) ? '' : 'none';
        });
      });
    });

    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.dataset.id = post.id;
      li.dataset.filter = post.category || 'all';
      li.addEventListener('click', () => {
        document.querySelectorAll('.article.selected').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      list.appendChild(li);
      if (idx === 0) li.click();
    });
  })();
});