import { supabase } from '/supabase.js';
import { showSection } from './nav.js';
const listPosts=document.getElementById('list-posts'),
  btnNewPost=document.getElementById('submit-new-post'),
  fbNewPost=document.getElementById('fb-new-post'),
  npTitle=document.getElementById('np-title'),
  npSnippet=document.getElementById('np-snippet'),
  npContent=document.getElementById('np-content'),
  npTag=document.getElementById('np-tag'),
  uploadInput=document.getElementById('newpost-upload'),
  uploadedList=document.getElementById('uploaded-images-list');
btnNewPost.addEventListener('click',async()=>{
  fbNewPost.textContent='';
  const payload={title:npTitle.value,snippet:npSnippet.value,content:npContent.value,tag:npTag.value};
  try{
    if(btnNewPost.dataset.editId){
      const{error}=await supabase.from('posts').update(payload).eq('id',btnNewPost.dataset.editId);
      delete btnNewPost.dataset.editId; if(error)throw error; btnNewPost.textContent='Pubblica Post';
    } else { const{error}=await supabase.from('posts').insert([payload]); if(error)throw error; }
    npTitle.value=npSnippet.value=npContent.value=''; npTag.value='tools'; uploadedList.innerHTML=''; fbNewPost.textContent='✅ Operazione completata'; await loadPosts();
  }catch(err){fbNewPost.textContent='❌ '+err.message; fbNewPost.className='feedback error';}
});
uploadInput.addEventListener('change',async e=>{
  for(const file of e.target.files){
    const fileName=`${Date.now()}_${file.name}`;
    try{
      const{error:upErr}=await supabase.storage.from('images').upload(fileName,file);
      if(upErr)throw upErr;
      const{data:urlData}=supabase.storage.from('images').getPublicUrl(fileName);
      const url=urlData.publicUrl;
      const snippet=`<img src="${url}" />`;
      const div=document.createElement('div');
      div.className='uploaded-image';
      div.innerHTML=`<img src="${url}"><code>${snippet}</code><button>Copy</button>`;
      div.querySelector('button').onclick=()=>navigator.clipboard.writeText(snippet);
      uploadedList.appendChild(div);
      npContent.value+=`\n${snippet}\n`;
    }catch(err){alert('Errore upload: '+err.message);}
  }
});
export async function loadPosts(){
  listPosts.textContent='⏳ Caricamento…';
  const{data,error}=await supabase.from('posts').select('*').order('date',{ascending:false});
  if(error){listPosts.textContent=error.message;return;}
  if(!data.length){listPosts.textContent='Nessun post.';return;}
  listPosts.innerHTML=data.map(p=>`<div data-id="${p.id}"><strong>${p.title}</strong><button class="edit-post">✏️</button><button class="del-post">🗑️</button></div>`).join('');
  document.querySelectorAll('.edit-post').forEach(b=>{
    b.onclick=()=>{
      const p=data.find(x=>x.id==b.parentElement.dataset.id);
      npTitle.value=p.title; npSnippet.value=p.snippet; npContent.value=p.content; npTag.value=p.tag;
      showSection('new-post'); btnNewPost.dataset.editId=p.id; btnNewPost.textContent='Aggiorna Post';
    };
  });
  document.querySelectorAll('.del-post').forEach(b=>{
    b.onclick=async()=>{
      if(!confirm('Confermi cancellazione?'))return;
      const id=b.parentElement.dataset.id;
      const{error}=await supabase.from('posts').delete().eq('id',id);
      if(error)alert('Errore: '+error.message);
      await loadPosts();
    };
  });
}
window.addEventListener('load',()=>loadPosts());

