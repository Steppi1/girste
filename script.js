// refs
const wrapper  = document.getElementById('wrapper');
const panzoomEl = document.getElementById('panzoom');
wrapper.style.touchAction   = 'none';
panzoomEl.style.touchAction = 'none';

// stato
let scale = 0.6, lastScale = scale;
let pos = { x: 0, y: 0 };

// helper
function update() {
  panzoomEl.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
}
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// centra dopo il load
function center() {
  const rect = panzoomEl.getBoundingClientRect();
  pos.x = (wrapper.clientWidth  - rect.width ) / 2;
  pos.y = (wrapper.clientHeight - rect.height) / 2;
  update();
}

// costruisci masonry (come prima), poi chiama center()
function buildGallery(images) {
  // shuffle + masonry… (stesso tuo codice)
  // al termine di tutte le onload: center();
}

// fetch immagini e init
fetch('images.json')
  .then(r => r.json())
  .then(images => {
    buildGallery(images);
    // refresh
    document.querySelector('button[title="refresh"]')
      .addEventListener('click', () => {
        panzoomEl.innerHTML = '';
        buildGallery(images);
      });
  })
  .catch(e => console.error(e));

// DRAG con inerzia e limiti ampi
interact(panzoomEl)
  .draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrict({
        restriction: {
          left:   -1000,
          right:  wrapper.clientWidth  + 1000,
          top:    -1000,
          bottom: wrapper.clientHeight + 1000
        },
        endOnly: false
      })
    ],
    listeners: {
      move(e) {
        pos.x += e.dx;
        pos.y += e.dy;
        update();
      }
    }
  })
// PINCH-to-zoom con inerzia
  .gesturable({
    inertia: true,
    listeners: {
      move(e) {
        // nuova scala
        const newScale = clamp(lastScale * e.scale, 0.2, 5);
        // mantieni il punto focale sotto le dita
        const rect = panzoomEl.getBoundingClientRect();
        const cx = e.client.x - rect.left;
        const cy = e.client.y - rect.top;
        pos.x += (cx) * (1 - e.scale);
        pos.y += (cy) * (1 - e.scale);
        scale = newScale;
        update();
      },
      end() {
        lastScale = scale;
      }
    }
  });

// WHEEL zoom “focale”
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = panzoomEl.getBoundingClientRect();
  const delta = -e.deltaY * 0.002;               // sensitività
  const newScale = clamp(scale * (1 + delta), 0.2, 5);
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  pos.x -= mx * (newScale/scale - 1);
  pos.y -= my * (newScale/scale - 1);
  scale = lastScale = newScale;
  update();
}, { passive: false });

// theme toggle invariato
document.getElementById('toggle-theme')
  .addEventListener('click', () =>
    document.body.classList.toggle('light-mode')
  );
