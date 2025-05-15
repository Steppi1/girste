import { getPosts } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // Contrast toggle
  const contrastToggle = document.getElementById('contrast-toggle');
  contrastToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Load posts
  (async () => {
    const posts = await getPosts();
    const list = document.getElementById('article-list');
    const content = document.querySelector('.article-content');

    let selectedId = null;

    posts.forEach(post => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.className = 'article';
      li.addEventListener('click', () => {
        // Deselect previous
        if (selectedId) {
          document.querySelector(`.article[data-id="${selectedId}"]`).classList.remove('selected');
        }
        // Select new
        li.classList.add('selected');
        selectedId = post.id;
        // Render content
        content.innerHTML = `<h2>${post.title}</h2>${post.content}`;
      });
      li.setAttribute('data-id', post.id);
      list.appendChild(li);
    });

    // Automatically select first
    if (posts.length) {
      list.querySelector('.article').click();
    }
  })();
});