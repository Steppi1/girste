// gestione apertura pannelli
document.querySelectorAll('nav a[data-panel]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.panel;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// gestione filtri articoli
const filterBtns = document.querySelectorAll('.filter-btn');
const articles   = document.querySelectorAll('.articles .article');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // marca pulsante attivo
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // mostra/nasconde in base a data-type
    const type = btn.dataset.filter;
    articles.forEach(a => {
      a.style.display = (a.dataset.type === type) ? '' : 'none';
    });
  });
});
