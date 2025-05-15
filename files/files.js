import { getPosts, getSplashTxts } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Contrast toggle
  const contrastToggle = document.getElementById('contrast-toggle');
  contrastToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Load splash texts
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

    // Render articles
    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.dataset.id = post.id;
      li.dataset.filter = post.type; // use the 'type' field
      li.addEventListener('click', () => {
        document.querySelectorAll('.article.selected').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      list.appendChild(li);
      if (idx === 0) {
        li.click(); // select latest
      }
    });

    // Setup filter buttons
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.toggle('active', b === btn));
        const filter = btn.dataset.filter;
        document.querySelectorAll('.article').forEach(li => {
          li.style.display = (filter === 'all' || li.dataset.filter === filter) ? '' : 'none';
        });
      });
    });

    // Activate 'all' filter by default
    const allBtn = filters.find(b => b.dataset.filter === 'all');
    if (allBtn) allBtn.click();
  })();
});
