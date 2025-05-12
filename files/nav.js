import { toggleAuth } from './auth.js';

const navButtons  = document.querySelectorAll('.nav-btn');
const sections    = document.querySelectorAll('.section');

export function showSection(id) {
  sections.forEach(s => s.id===id
    ? s.classList.add('active')
    : s.classList.remove('active'));
  navButtons.forEach(b => b.dataset.section===id
    ? b.classList.add('active')
    : b.classList.remove('active'));
}

navButtons.forEach(btn => btn.addEventListener('click', () => {
  showSection(btn.dataset.section);
}));
