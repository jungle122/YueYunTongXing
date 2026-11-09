const byId=id=>document.getElementById(id);
let songs=[],index=0,position=0,playing=false,recordSeconds=0,recording=false,replay=0;
const takes=new Map();
const stars=new Set(JSON.parse(sessionStorage.getItem('audio-directory-stars')||'["song18"]'));
function paint(){
 byId('play').textContent=playing?'暂停':'播放';
 byId('time').textContent=position===60?'1:00':'0:'+String(position).padStart(2,'0');
 byId('seek').value=position;
 const saved=stars.has(songs[index].id);
 byId('fav').textContent=saved?'★':'☆';byId('fav').setAttribute('aria-pressed',saved);
 byId('record').textContent=recording?'停止并保存':'跟唱录音';
 byId('listen').disabled=recording||!takes.has(index);
 byId('listen').textContent=replay?'停止回听':'回听';
}
function openSong(i){
 index=(i+songs.length)%songs.length;position=0;playing=false;recording=false;replay=0;
 const song=songs[index];history.replaceState(null,'','?id='+song.id);
 byId('lesson').textContent=song.lesson;byId('folio').textContent='0'+(index+1)+' / 06';
 byId('title').textContent=song.title;byId('tips').textContent=song.tips.join('。')+'。';
 const verse=document.querySelector('.verse');
 verse.replaceChildren(...song.lyrics.map(line=>{const p=document.createElement('p');p.textContent=line||'　';return p;}));verse.scrollTop=0;
 byId('recordState').textContent='';paint();
}
byId('prev').onclick=()=>openSong(index-1);byId('next').onclick=()=>openSong(index+1);
byId('play').onclick=()=>{if(recording)return;replay=0;if(position===60)position=0;playing=!playing;paint();};
byId('seek').oninput=e=>{position=Number(e.target.value);paint();};
byId('fav').onclick=()=>{const id=songs[index].id;if(stars.has(id))stars.delete(id);else stars.add(id);sessionStorage.setItem('audio-directory-stars',JSON.stringify([...stars]));paint();};
function finishTake(){recording=false;takes.set(index,Math.max(1,recordSeconds));byId('recordState').textContent='本次跟唱 '+takes.get(index)+' 秒（演示）';paint();}
byId('record').onclick=()=>{if(recording)return finishTake();playing=false;replay=0;recording=true;recordSeconds=0;byId('recordState').textContent='模拟录音 0 / 60 秒';paint();};
byId('listen').onclick=()=>{playing=false;replay=replay?0:takes.get(index);byId('recordState').textContent=replay?'模拟回听中':'';paint();};
setInterval(()=>{
 if(recording){recordSeconds++;byId('recordState').textContent='模拟录音 '+recordSeconds+' / 60 秒';if(recordSeconds>=60)finishTake();}
 if(replay&&!--replay){byId('recordState').textContent='回听结束';paint();}
 if(!playing)return;
 if(++position>=60){const mode=byId('mode').selectedIndex;openSong(index+(mode===1?0:mode===2?1+Math.floor(Math.random()*5):1));playing=true;}paint();
},1000);
async function load(){
 try{const res=await fetch('songs.json');if(!res.ok)throw Error();songs=await res.json();openSong(Math.max(0,songs.findIndex(s=>s.id===new URLSearchParams(location.search).get('id'))));byId('sheet').hidden=false;byId('notice').hidden=true;}
 catch{byId('notice').innerHTML='童谣加载失败 <button>重试</button>';byId('notice').querySelector('button').onclick=load;}
}
load();
