// files.js

const pills      = Array.from(document.querySelectorAll('.filter-pill'));
const list       = document.querySelector('.articles');
let items        = Array.from(document.querySelectorAll('.article'));
const contentBox = document.querySelector('.article-content');

// ——— setup rotazione header-phrase ———
const phraseEl = document.querySelector('.header-phrase');
let phrases = [];

function changePhrase() {
  if (!phrases.length) return;
  const i = Math.floor(Math.random() * phrases.length);
  phraseEl.textContent = phrases[i];
}

// conserva ordine iniziale
const initialOrder = items.slice();

// default: mostra “all”
activateFilter('all');

// click sui filtri
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    activateFilter(pill.dataset.filter);
  });
});

function activateFilter(type) {
  pills.forEach(p => p.classList.toggle('active', p.dataset.filter === type));
  if (type === 'all') {
    items.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));
  } else {
    items = initialOrder.slice();
  }

  // batch DOM update via DocumentFragment
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    item.style.display = (type === 'all' || item.dataset.type === type) ? '' : 'none';
    item.classList.remove('selected');
    fragment.appendChild(item);
  });
  list.innerHTML = '';
  list.appendChild(fragment);

  const firstVisible = items.find(i => i.style.display === '');
  if (firstVisible) selectArticle(firstVisible);
  else contentBox.innerHTML = '';
}

list.addEventListener('click', e => {
  if (!e.target.classList.contains('article')) return;
  selectArticle(e.target);
});

function selectArticle(item) {
  items.forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');

  const tpl = item.querySelector('template.article-body');
  const bodyHTML = tpl ? tpl.innerHTML : '';

  contentBox.innerHTML = `
    <h2>${item.textContent}</h2>
    <hr />
    ${bodyHTML}
  `;
}

// ——— carica e ruota le frasi dal file phrases.json ———
fetch('phrases.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(arr => {
    phrases = Array.isArray(arr) ? arr : [];
    changePhrase();
    setInterval(changePhrase, 7000);
  })
  .catch(err => console.error('Errore caricamento frasi:', err));
