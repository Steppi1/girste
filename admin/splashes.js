import { supabase } from '/supabase.js';
const listSplash=document.getElementById('list-splash'),
  btnNewSplash=document.getElementById('submit-new-splash'),
  fbNewSplash=document.getElementById('fb-new-splash'),
  inputSplash=document.getElementById('new-splash-input');
btnNewSplash.addEventListener('click',async()=>{
  const phrase=inputSplash.value.trim(); if(!phrase)return;
  try{const{error}=await supabase.from('splashtxt').insert({phrase}); if(error)throw error;
    inputSplash.value=''; fbNewSplash.textContent='✅ Aggiunto!'; await loadSplashes();
  }catch(err){fbNewSplash.textContent='❌ '+err.message;}
});
export async function loadSplashes(){
  listSplash.textContent='⏳ Caricamento…';
  const{data,error}=await supabase.from('splashtxt').select('*');
  if(error){listSplash.textContent=error.message;return;}
  if(!data.length){listSplash.textContent='Nessuno splash.';return;}
  listSplash.innerHTML=data.map(s=>`<div data-id="${s.id}" style="margin-bottom:0.5rem;">
    <input type="text" value="${s.phrase}" data-id="${s.id}" style="width:70%;"/>
    <button class="save-splash">Save</button>
    <button class="del-splash">Del</button>
  </div>`).join('');
  document.querySelectorAll('.save-splash').forEach(btn=>{
    btn.onclick=async()=>{
      const inp=btn.previousElementSibling; const id=inp.dataset.id; const np=inp.value.trim();
      const{error}=await supabase.from('splashtxt').update({phrase:np}).eq('id',id);
      if(error)alert('Errore update: '+error.message); await loadSplashes();
    };
  });
  document.querySelectorAll('.del-splash').forEach(btn=>{
    btn.onclick=async()=>{
      const id=btn.previousElementSibling.previousElementSibling.dataset.id;
      await supabase.from('splashtxt').delete().eq('id',id); await loadSplashes();
    };
  });
}
window.addEventListener('load',()=>loadSplashes());
