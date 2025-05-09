// sandbox.js
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('data-panel');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
    document.getElementById(id).classList.add('open');
  });
});
document.querySelectorAll('.panel .close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.remove('open');
  });
});

