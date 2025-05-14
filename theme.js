// theme.js
export function initThemeToggle(buttonId = 'toggle-theme') {
  const btn = document.getElementById(buttonId);
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
  });
}