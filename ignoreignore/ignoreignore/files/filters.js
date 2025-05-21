export function setupFilters(renderArticles, allPosts, showArticleById) {
  document.querySelectorAll('.filter-pill').forEach(f => {
    f.addEventListener('click', function () {
      document.querySelectorAll('.filter-pill').forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const filter = f.getAttribute('data-filter');
      const posts = filter === 'all' ? allPosts() : allPosts().filter(p => p.tag === filter);

      renderArticles(posts);

      // Trova l'articolo attualmente aperto
      const open = document.querySelector('.article.open');
      const openId = open ? open.getAttribute('data-id') : null;

      if (openId && posts.find(p => p.id == openId)) {
        showArticleById(openId); // Tiene aperto l'articolo se è ancora presente
      } else if (posts.length > 0) {
        showArticleById(posts[0].id); // Altrimenti apre il più recente
      }
    });
  });
}