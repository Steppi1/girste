export function showArticleById(id) {
  document.querySelectorAll('.article').forEach(a => a.classList.remove('open'));
  const el = document.querySelector(`.article[data-id="${id}"]`);
  if (el) el.classList.add('open');
}