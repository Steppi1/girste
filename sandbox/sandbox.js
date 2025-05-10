const pills   = document.querySelectorAll('.filter-pill');
const items   = document.querySelectorAll('.article');

pills.forEach(p => {
  p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    const type = p.dataset.filter;
    items.forEach(i => {
      i.style.display = i.dataset.type === type ? '' : 'none';
    });
  });
});
