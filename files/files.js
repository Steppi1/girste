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
    const idx = Math.floor(Math.random() * txts.length);
    document.querySelector('.breathing-text').textContent = txts[idx] || '';
  })();

  // Load posts, start in 'all' and select latest
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');
    // Filter functionality
    const filters = document.querySelectorAll('.filter-pill');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.article').forEach(li => {
          li.style.display = filter === 'all' ? '' : (li.getAttribute('data-filter') === filter ? '' : 'none');
        });
      });
    });

    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.dataset.id = post.id;
      li.dataset.filter = post.type || post.category || 'all';
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