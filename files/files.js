import { getPosts } from '../supabase.js'

const pills      = Array.from(document.querySelectorAll('.filter-pill'))
const list       = document.getElementById('article-list')
const contentBox = document.querySelector('.article-content')
const phraseEl   = document.querySelector('.header-phrase')
const container  = document.querySelector('.container')
const main       = document.querySelector('.main-content')

let phrases = []
let items = []
let initialOrder = []

// — Carica articoli da Supabase
getPosts().then(posts => {
  posts.forEach(post => {
    const li = document.createElement('li')
    li.className = 'article'
    li.dataset.type = post.tag
    li.dataset.date = post.date.split('T')[0]
    li.innerHTML = `
      ${post.title}
      <template class="article-body">
        ${post.content}
      </template>
    `
    list.appendChild(li)
  })

  items = Array.from(document.querySelectorAll('.article'))
  initialOrder = items.slice()
  activateFilter('all')
})

// — Filtro e ordinamento
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    activateFilter(pill.dataset.filter)
  })
})

function activateFilter(type) {
  pills.forEach(p => p.classList.toggle('active', p.dataset.filter === type))

  if (type === 'all') {
    items.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date))
  } else {
    items = initialOrder.slice()
  }

  const frag = document.createDocumentFragment()
  items.forEach(item => {
    const show = (type === 'all' || item.dataset.type === type)
    item.style.display = show ? '' : 'none'
    item.classList.remove('selected')
    frag.appendChild(item)
  })
  list.innerHTML = ''
  list.appendChild(frag)

  const firstVisible = items.find(i => i.style.display === '')
  if (firstVisible) selectArticle(firstVisible)
  else contentBox.innerHTML = ''
}

list.addEventListener('click', e => {
  if (!e.target.classList.contains('article')) return
  selectArticle(e.target)
})

function selectArticle(item) {
  items.forEach(i => i.classList.remove('selected'))
  item.classList.add('selected')

  const tpl = item.querySelector('template.article-body')
  const bodyHTML = tpl ? tpl.innerHTML : ''
  contentBox.innerHTML = `
    <h2>${item.textContent}</h2>
    <hr />
    ${bodyHTML}
  `
}

// — Frasi casuali da phrases.json
fetch('phrases.json')
  .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
  .then(arr => {
    phrases = Array.isArray(arr) ? arr : []
    changePhrase()
    setInterval(changePhrase, 7000)
  })
  .catch(err => console.error('Errore caricamento frasi:', err))

function changePhrase() {
  if (!phrases.length) return
  const i = Math.floor(Math.random() * phrases.length)
  phraseEl.textContent = phrases[i]
}

// — Swipe sidebar su mobile
let startX, startY, isTicking = false, lastDx = 0

main.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
})

main.addEventListener('touchmove', e => {
  const touch = e.touches[0]
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY

  if (Math.abs(dx) > Math.abs(dy)) {
    e.preventDefault()
    lastDx = dx
    if (!isTicking) {
      isTicking = true
      requestAnimationFrame(() => {
        container.scrollLeft -= lastDx
        startX = touch.clientX
        isTicking = false
      })
    }
  }
})
