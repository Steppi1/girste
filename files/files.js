import { getPosts, getSplashTxts } from '../supabase.js'

const articleList    = document.getElementById('article-list')
const articleContent = document.querySelector('.article-content')
const filterButtons  = document.querySelectorAll('.filter-pill')
const headerPhrase   = document.querySelector('.header-phrase')

let posts = []

// Carica splash e post, inizializza filtri
async function init() {
  try {
    const texts = await getSplashTxts()
    headerPhrase.textContent = texts.length
      ? texts[Math.floor(Math.random() * texts.length)]
      : ''

    posts = await getPosts()
    renderList(posts)
    setupFilters()
  } catch (e) {
    console.error(e)
    headerPhrase.textContent = 'Errore caricamento'
  }
}

// Mostra la lista di link ai post
function renderList(data) {
  articleList.innerHTML = data.map(p => `
    <li data-id="${p.id}" data-tag="${p.tag}">
      <button class="article-link">${p.title}</button>
    </li>
  `).join('')
  articleList.querySelectorAll('.article-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.parentElement.dataset.id
      const post = posts.find(x => x.id == id)
      articleContent.innerHTML = `
        <h1>${post.title}</h1>
        <p>${post.snippet}</p>
        ${post.content}
      `
      history.pushState({ id }, '', `#${id}`)
    })
  })
}

// Imposta i filtri per tag
function setupFilters() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const f = btn.dataset.filter
      const filtered = f === 'all' ? posts : posts.filter(p => p.tag === f)
      renderList(filtered)
      articleContent.innerHTML = ''
    })
  })
}

// Gestione cronologia avanti/indietro
window.addEventListener('popstate', e => {
  if (e.state?.id) {
    const post = posts.find(x => x.id == e.state.id)
    articleContent.innerHTML = `
      <h1>${post.title}</h1>
      <p>${post.snippet}</p>
      ${post.content}
    `
  } else {
    articleContent.innerHTML = ''
  }
})

init()
