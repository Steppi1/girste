import { supabase } from '/supabase.js';
const listPhotos=document.getElementById('list-photos');
export async function loadPhotos(){
  listPhotos.innerHTML='⏳ Caricamento…';
  const{data,error}=await supabase.storage.from('images').list('',{limit:100});
  if(error){listPhotos.innerHTML='Errore: '+error.message;return;}
  if(!data.length){listPhotos.innerHTML='Nessuna foto.';return;}
  listPhotos.innerHTML=data.map(f=>`<div data-file="${f.name}">
    <img src="${supabase.storage.from('images').getPublicUrl(f.name).data.publicUrl}"/>
    <button class="del-photo">x</button>
  </div>`).join('');
  document.querySelectorAll('.del-photo').forEach(btn=>{
    btn.onclick=async()=>{
      if(!confirm('Eliminare?'))return;
      await supabase.storage.from('images').remove([btn.parentElement.dataset.file]);
      loadPhotos();
    };
  });
}
window.addEventListener('load',()=>loadPhotos());
