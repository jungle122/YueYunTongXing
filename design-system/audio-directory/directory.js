const content = document.querySelector('main');
const back = document.querySelector('#back');
const previewState = new URLSearchParams(location.search).get('state');
const normalBack = back.href;
const statusNames = ['已听完','学习中','未开始','已听完','未开始','未开始'];
const star = '<path d="m12 2.6 2.85 5.9 6.5.94-4.7 4.58 1.1 6.47L12 17.43l-5.75 3.06 1.1-6.47-4.7-4.58 6.5-.94Z"/>';
const icon = (shape, fill='none') => '<svg aria-hidden="true" class="action" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="'+fill+'">'+shape+'</svg>';
const statusMarks = {'已听完':'<path d="m8 12 2.7 3 5.7-6"/>','学习中':'<path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor"/>','未开始':''};
let songs = [];
let favourites = new Set(['song18']);
try { const saved=sessionStorage.getItem('audio-directory-stars'); if(saved) favourites = new Set(JSON.parse(saved)); } catch {}
function render() {
  const selected=songs.find(s=>location.hash==='#'+s.id);
  back.href=selected ? location.pathname+location.search : normalBack;
  content.className='';
  content.removeAttribute('aria-busy');
  if(selected) {
    content.innerHTML='<header class="title"><h1 tabindex="-1"></h1></header><p></p>';
    content.querySelector('h1').textContent=selected.title;
    content.querySelector('h1').classList.add('song-wenkai');
    content.querySelector('p').textContent=selected.line;
    content.querySelector('h1').focus();
    return;
  }
  content.innerHTML='<header class="title"><h1>童谣目录</h1><span class="collection-total">六首童谣</span></header><section class="songs" aria-label="选择童谣"></section><footer class="summary"><span class="trail"><img alt="" src="../audio-edges/footprints.svg">学习足迹</span><span>'+statusNames.filter(s=>s==='已听完').length+' / '+songs.length+'</span></footer>';
  songs.forEach((song,i)=>{
    const row=document.createElement('div');
    row.className='directory-row';
    const label=statusNames[i];
    row.innerHTML='<a class="song" href="../audio-player-preview/index.html?id='+song.id+'"><span class="lesson-number">'+song.lesson+'</span><span class="song-content"><strong>'+song.title+'</strong></span><span class="status" title="'+label+'">'+icon('<circle cx="12" cy="12" r="8"/>'+statusMarks[label])+'</span><span class="arrow">'+icon('<path d="m9 5 7 7-7 7"/>')+'</span></a><button class="save" type="button"></button>';
    row.querySelector('a').setAttribute('aria-label','学习'+song.title+'，'+label);
    const save=row.querySelector('button');
    save.setAttribute('aria-label','收藏《'+song.title+'》');
    function paint(){save.setAttribute('aria-pressed',favourites.has(song.id)); save.innerHTML=icon(star,favourites.has(song.id)?'currentColor':'none');}
    save.onclick=()=>{
      if(favourites.has(song.id)) favourites.delete(song.id); else favourites.add(song.id);
      try {sessionStorage.setItem('audio-directory-stars',JSON.stringify([...favourites]));} catch {}
      paint();
    };
    paint();
    content.querySelector('.songs').append(row);
  });
}
function skeleton(){
  content.className='';
  content.setAttribute('aria-busy','true');
  const rows = Array.from({length:6}, () =>
    '<div class="directory-row"><div class="song"><span></span><span class="song-content"><i class="placeholder name-placeholder"></i></span></div></div>'
  ).join('');
  content.innerHTML='<section aria-label="正在加载童谣"><header class="title"><h1 class="pending-heading"><span>童谣目录</span></h1></header><div class="songs">'+rows+'</div><footer class="summary"></footer></section>';
}
function failure(){
  content.removeAttribute('aria-busy');
  content.className='plain';
  content.innerHTML='<section class="failure"><h1 role="alert">童谣加载失败</h1><button class="retry">重试</button></section>';
  content.querySelector('button').onclick=()=>load();
}
async function load(){
  skeleton();
  try {
    const res=await fetch('../audio-options/songs.json');
    if(!res.ok) throw Error();
    songs=await res.json();
    render();
  } catch {failure();}
}
window.addEventListener('hashchange',()=>{if(songs.length) render();});
if(previewState==='loading') skeleton(); else if(previewState==='error') failure(); else load();
