// FILTRI
const pills = document.querySelectorAll('.filter-pill');
const items = document.querySelectorAll('.article');
const contentBox = document.querySelector('.article-content');

// Imposta il filtro di default (es. stories)
pills[0].classList.add('active');
filterArticles(pills[0].dataset.filter);

// Click sui filtri
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterArticles(pill.dataset.filter);
    contentBox.textContent = ''; // reset contenuto
  });
});

function filterArticles(type) {
  items.forEach(i => {
    i.style.display = i.dataset.type === type ? '' : 'none';
    i.classList.remove('selected');
  });
}

// Click sugli articoli
items.forEach(item => {
  item.addEventListener('click', () => {
    // evidenzia selezione
    items.forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    // mostra contenuto
    contentBox.textContent = item.dataset.content;
  });
});
