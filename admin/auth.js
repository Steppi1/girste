import { supabase } from '/supabase.js';
import { showSection } from './nav.js';
const authPanel=document.getElementById('auth-panel'),
      adminPanel=document.getElementById('admin-panel'),
      btnLogin=document.getElementById('btn-login'),
      btnLogout=document.getElementById('btn-logout'),
      authFb=document.getElementById('auth-feedback'),
      emailInput=document.getElementById('email'),
      passInput=document.getElementById('password');
window.addEventListener('load',async()=>{
  const{data:{session}}=await supabase.auth.getSession();
  if(session)toggleAuth(true);
});
btnLogin.addEventListener('click',async()=>{
  const{error}=await supabase.auth.signInWithPassword({email:emailInput.value,password:passInput.value});
  if(error){authFb.textContent=error.message;return;}
  toggleAuth(true);
});
btnLogout.addEventListener('click',async()=>{await supabase.auth.signOut();toggleAuth(false);});
export function toggleAuth(ok){
  authPanel.style.display=ok?'none':'block';
  adminPanel.style.display=ok?'block':'none';
  if(ok)showSection('new-post');
}