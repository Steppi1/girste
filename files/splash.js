
import { getSplashTxts } from '../supabase.js';

let splashTexts = [];
let lastSplashIndex = null;
let splashInterval = null;

function getNextRandomIndex(max, last) {
  if (max < 2) return 0;
  let idx;
  do {
    idx = Math.floor(Math.random() * max);
  } while (idx === last);
  return idx;
}

export async function setupSplash() {
  try {
    const txts = await getSplashTxts();
    splashTexts = (txts && txts.length) ? txts : [
      "Aggiungi frasi su Supabase!",
      "Questa è una frase di esempio.",
      "Puoi cambiare queste frasi dall'admin."
    ];
    lastSplashIndex = null;
    updateSplash();
    if (splashInterval) clearInterval(splashInterval);
    splashInterval = setInterval(updateSplash, 4000);
  } catch (err) {
    splashTexts = [
      "Errore nel caricare le splash texts.",
      "Controlla la connessione Supabase."
    ];
    lastSplashIndex = null;
    updateSplash();
  }
}

function updateSplash() {
  const splashEl = document.querySelector('.breathing-text');
  if (!splashEl || !splashTexts.length) return;
  let nextIndex = getNextRandomIndex(splashTexts.length, lastSplashIndex);
  splashEl.textContent = splashTexts[nextIndex];
  lastSplashIndex = nextIndex;
}
