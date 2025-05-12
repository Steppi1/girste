import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://mcvvvhpmpouuupwqlbsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdnZ2aHBtcG91dXVwd3FsYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODY5NzEsImV4cCI6MjA2MjU2Mjk3MX0.bEqtAPxy-fB31FrsIh8Mn240udNrKWAsdv4akpjNg8Q'
);

const panzoomEl = document.getElementById("panzoom");
const gridEl = document.getElementById("masonry");

async function loadImages() {
  const { data, error } = await supabase.storage.from("mosaic").list("", { limit: 500 });
  if (error) return console.error("Errore caricamento immagini:", error);

  const shuffled = data.sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    const img = document.createElement("img");
    img.src = `https://mcvvvhpmpouuupwqlbsn.supabase.co/storage/v1/object/public/mosaic/${item.name}`;
    img.className = "tile";
    gridEl.appendChild(img);
  }

  await new Promise(r => setTimeout(r, 1000));

  const msnry = new Masonry(gridEl, {
    itemSelector: "img",
    gutter: 10,
    fitWidth: true
  });

  await new Promise(r => setTimeout(r, 300));

  const instance = window.panzoom(panzoomEl, {
    bounds: true,
    boundsPadding: 1,
    smoothScroll: true,
    zoomDoubleClickSpeed: 1,
    minZoom: 0.05,
    maxZoom: 4
  });

  panzoomEl.style.touchAction = "none";

  const wrapperRect = document.getElementById("wrapper").getBoundingClientRect();
  const contentRect = panzoomEl.getBoundingClientRect();

  const scaleX = wrapperRect.width / contentRect.width;
  const scaleY = wrapperRect.height / contentRect.height;
  const scale = Math.min(scaleX, scaleY) * 0.95;

  instance.zoomAbs(0, 0, scale);

  const panX = (wrapperRect.width - contentRect.width * scale) / 2;
  const panY = (wrapperRect.height - contentRect.height * scale) / 2;

  instance.moveTo(panX, panY);
}

loadImages();