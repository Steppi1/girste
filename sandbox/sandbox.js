const pills = document.querySelectorAll('.filter-pill');
const items = document.querySelectorAll('.article');
const contentBox = document.querySelector('.article-content');

// inizializza primo filtro
pills[0].classList.add('active');
filterArticles(pills[0].dataset.filter);

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    pill.classList.add('active');
    filterArticles(pill.dataset.filter);
  });
});

function filterArticles(type) {
  let first = null;
  items.forEach(i => {
    if (i.dataset.type === type) {
      i.style.display = '';
      if (!first) first = i;
    } else {
      i.style.display = 'none';
      i.classList.remove('selected');
    }
  });
  if (first) selectArticle(first);
  else contentBox.innerHTML = '';
}

items.forEach(item => {
  item.addEventListener('click', () => selectArticle(item));
});

function selectArticle(item) {
  items.forEach(x => x.classList.remove('selected'));
  item.classList.add('selected');
  const title   = item.textContent;
  const imgSrc  = item.dataset.image;
  const content = item.dataset.content;
  contentBox.innerHTML = `
    <h2>${title}</h2>
    <hr />
    <img src="${imgSrc}" alt="${title}" />
    <p>${content}</p>
  `;
}
