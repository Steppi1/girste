const pills      = Array.from(document.querySelectorAll('.filter-pill'));
const list       = document.querySelector('.articles');
let items        = Array.from(document.querySelectorAll('.article'));
const contentBox = document.querySelector('.article-content');

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
  // aggiorna pill attivo
  pills.forEach(p => p.classList.toggle('active', p.dataset.filter === type));

  // ordina/ripristina lista
  if (type === 'all') {
    // sort by date descending
    items.sort((a,b) => new Date(b.dataset.date) - new Date(a.dataset.date));
  } else {
    // ripristina ordine iniziale
    items = initialOrder.slice();
  }

  // rigenera lista visibile
  list.innerHTML = '';
  items.forEach(item => {
    list.appendChild(item);
    item.style.display = (type === 'all' || item.dataset.type === type)
      ? '' : 'none';
    item.classList.remove('selected');
  });

  // seleziona il primo visibile
  const firstVisible = items.find(i => i.style.display === '');
  if (firstVisible) selectArticle(firstVisible);
  else contentBox.innerHTML = '';
}

// click su ogni articolo
list.addEventListener('click', e => {
  if (!e.target.classList.contains('article')) return;
  selectArticle(e.target);
});

function selectArticle(item) {
  items.forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');
  contentBox.innerHTML = `
    <h2>${item.textContent}</h2>
    <hr />
    <img src="${item.dataset.image}" alt="" />
    <p>${item.dataset.content}</p>
  `;
}

/* breathing effect sulla header-phrase */
.header-phrase {
  /* applica l’animazione */
  animation: breathe 3s ease-in-out infinite alternate;
  /* per evitare che la trasformazione scali il layout */
  display: inline-block;
}

@keyframes breathe {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}


fetch('/files/phrases.json')
  .then(res => res.json())
  .then(arr => {
    phrases = arr;
    changePhrase();
    setInterval(changePhrase, 7000);
  });

