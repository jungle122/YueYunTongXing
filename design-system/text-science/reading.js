const list=document.querySelector('#articles'),catalog=document.querySelector('#catalog'),dialog=document.querySelector('dialog');
const state=new URLSearchParams(location.search).get('state');
const progress=state==='first'?[0,0,0,0]:state==='complete'?[100,100,100,100]:[100,35,0,0];
const stars=new Set(JSON.parse(sessionStorage.getItem('article-stars')||'[]'));
const svg=path=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
const marks=['','<path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor"/>','<path d="m8 12 2.7 3 5.7-6"/>'];
function render(articles){
 const loading=!articles;
 if(articles){
  const saved=JSON.parse(sessionStorage.getItem('article-progress-'+(state||'partial'))||'{}');
  articles.forEach((a,i)=>progress[i]=Math.max(progress[i],saved[a.id]||0));
 }
 catalog.classList.toggle('loading',loading);
 catalog.setAttribute('aria-busy',String(loading));
 list.replaceChildren();
 for(let i=0;i<4;i++){
  const a=articles?.[i];
  const row=document.createElement('div');row.className='directory-row';
  row.innerHTML='<button class="song"><span class="lesson-number"></span><span class="song-content"><strong><span></span></strong><span class="minutes"><span></span></span></span><span class="status"></span><span class="arrow">'+svg('<path d="m9 5 7 7-7 7"/>')+'</span></button><button class="save"><img alt=""></button>';
  row.querySelector('.lesson-number').textContent='第'+'一二三四'[i]+'篇';
  row.querySelector('strong span').textContent=a?.title||'文'.repeat(9);
  row.querySelector('.minutes span').textContent=(a?.readTime||3)+' 分钟';
  const k=progress[i]===100?2:progress[i]>0?1:0;
  const status=['未读','阅读中','已读完'][k];
  row.querySelector('.status').innerHTML=svg('<circle cx="12" cy="12" r="8"/>'+marks[k]);
  const open=row.querySelector('.song'),fav=row.querySelector('.save');
  list.append(row);
  if(loading){row.setAttribute('aria-hidden','true');open.disabled=fav.disabled=true;continue;}
  open.setAttribute('aria-label','阅读《'+a.title+'》，'+status+'，'+a.readTime+'分钟');
  open.onclick=()=>{location.href='../article-reader/index.html?id='+encodeURIComponent(a.id)+'&state='+encodeURIComponent(state||'partial');};
  fav.setAttribute('aria-label','收藏《'+a.title+'》');
  function paint(){const saved=stars.has(a.id);fav.setAttribute('aria-pressed',saved);fav.firstChild.src='../audio-player-preview/assets/'+(saved?'star-orange.svg':'regular/star.svg');}
  fav.onclick=()=>{if(stars.has(a.id))stars.delete(a.id);else stars.add(a.id);sessionStorage.setItem('article-stars',JSON.stringify([...stars]));paint();};paint();
 }
 document.querySelector('output').textContent=progress.filter(n=>n===100).length+' / 4';
}
function failure(failed){catalog.hidden=failed;document.querySelector('#failure').hidden=!failed;document.querySelector('main').classList.toggle('plain',failed);}
async function load(){
 failure(false);render(null);
 try{const res=await fetch('articles.json');if(!res.ok)throw Error();render(await res.json());}
 catch{failure(true);}
}
document.querySelector('.retry').onclick=load;
if(state==='error')failure(true);else if(state==='loading')render(null);else load();

addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
