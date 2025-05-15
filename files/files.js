import { getPosts } from '../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Contrast toggle
  document.getElementById('contrast-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Load posts, start in 'all' and select latest
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');
    // sort by date descending already done by supabase
    posts.forEach((post, idx) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.dataset.id = post.id;
      li.addEventListener('click', () => {
        document.querySelectorAll('.article.selected').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      list.appendChild(li);
      // auto-select first (latest)
      if (idx === 0) li.click();
    });
  })();
});