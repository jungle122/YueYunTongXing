const query=new URLSearchParams(location.search);
const rule=['short','crease','space'].includes(query.get('rule'))?query.get('rule'):'crease';
document.body.dataset.rule=rule;
const byId=id=>document.getElementById(id);
let songs=[],index=0,position=0,playing=false,recordSeconds=0,recording=false,replay=0;
const demo=new URLSearchParams(location.search).has('demo');
const takes=new Map();
let selected=null, listening=false, busy=false, recorder=null, captureStart=0, playback=null, playbackUrl='';
const currentTakes=()=>takes.get(songs[index].id)||[];
const selectedTake=()=>currentTakes().find(t=>t.id===selected);
const message=text=>byId('message').textContent=text;
const clock=secs=>Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');
const stars=new Set(JSON.parse(sessionStorage.getItem('audio-directory-stars')||'["song18"]'));
const modes=[['顺序播放','list-numbers'],['单曲循环','repeat-once'],['随机播放','shuffle']];
let modeIndex=0, hintTimer;
byId('mode').onclick=()=>{
 modeIndex=(modeIndex+1)%modes.length;
 const [label,asset]=modes[modeIndex];
 byId('mode').querySelector('img').src='assets/regular/'+asset+'.svg';
 byId('mode').setAttribute('aria-label',label+'，切换模式');
 byId('mode-note').textContent=label;
 clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>byId('mode-note').textContent='',1500);
};
function paint(){
 byId('play').setAttribute('aria-label',playing?'暂停':'播放');
 byId('play').querySelector('img').setAttribute('src',playing?'assets/regular/pause.svg':'assets/regular/play.svg');
 byId('time').textContent=position===60?'1:00':'0:'+String(position).padStart(2,'0');
 byId('seek').value=position;
 const saved=stars.has(songs[index].id);
 byId('fav').setAttribute('aria-pressed',saved);
 byId('fav').querySelector('img').src=saved?'assets/star-orange.svg':'assets/regular/star.svg';
 for(const id of ['prev','next','play','seek']) byId(id).disabled=recording||busy;
 const length=selectedTake()?.seconds||0;
 function tool(id,active,asset,label,time){
   const button=byId(id);
   button.setAttribute('aria-label',label);
   button.dataset.active=String(active);
   button.querySelector('img').src='assets/regular/'+asset+'.svg';
   button.querySelector('.timer').textContent=time;
   button.querySelector('.tool-label').textContent=id==='record'?(recording?'停止':'录音'):(listening?'暂停':'回听');
 }
 tool('record',recording,recording?'stop':'microphone',recording?'停止并保存录音':'开始跟唱录音',recording?clock(recordSeconds):'');
 byId('record').disabled=busy;
 byId('listen').disabled=busy||recording||!length;
 tool('listen',listening,listening?'pause':'headphones',listening?'暂停回听':'回听录音',length&&!recording?clock(replay?length-replay:length):'');
}
function setTipsExpanded(expanded){
 byId('tips').hidden=!expanded;
 byId('tips-toggle').setAttribute('aria-expanded',String(expanded));
}
byId('tips-toggle').onclick=()=>setTipsExpanded(byId('tips-toggle').getAttribute('aria-expanded')!=='true');
function openSong(i){
 stopPlayback();message('');
 index=(i+songs.length)%songs.length;position=0;playing=false;recording=false;replay=0;listening=false;
 const song=songs[index];history.replaceState(null,'','?id='+song.id+(demo?'&demo=full':'')+'&rule='+rule);
 selected=currentTakes()[0]?.id;renderList();
 byId('lesson').textContent=song.lesson;byId('folio').textContent='0'+(index+1)+' / 06';
 byId('title').textContent=song.title;byId('tips').replaceChildren(...song.tips.map(text=>{
  const item=document.createElement('li');item.textContent=text;return item;
 }));
 setTipsExpanded(false);
 const verse=document.querySelector('.verse');
 verse.replaceChildren(...song.lyrics.map(line=>{const p=document.createElement('p');p.textContent=line||'　';return p;}));verse.scrollTop=0;
 paint();
}
byId('prev').onclick=()=>openSong(index-1);byId('next').onclick=()=>openSong(index+1);
byId('play').onclick=()=>{if(recording||busy)return;stopPlayback();renderList();if(position===60)position=0;playing=!playing;paint();};
byId('seek').oninput=e=>{position=Number(e.target.value);paint();};
byId('fav').onclick=()=>{const id=songs[index].id;if(stars.has(id))stars.delete(id);else stars.add(id);sessionStorage.setItem('audio-directory-stars',JSON.stringify([...stars]));paint();};
function stopPlayback(){
 if(playback){playback.pause();playback=null;}
 if(playbackUrl){URL.revokeObjectURL(playbackUrl);playbackUrl='';}
 listening=false;replay=0;
}
function renderList(){
 const list=byId('takes');
 list.replaceChildren();
 for(const take of currentTakes()){
  const row=document.createElement('li');
  row.classList.toggle('selected',take.id===selected);
  const play=document.createElement('button');
  const active=take.id===selected&&listening;
  play.disabled=recording||busy;
  play.innerHTML='<img alt="" src="assets/regular/'+(active?'pause':'play')+'.svg"><span>录音 '+take.number+'</span><time>'+clock(take.seconds)+'</time>';
  play.setAttribute('aria-label',(active?'暂停':'回听')+'录音 '+take.number);
  play.onclick=()=>hear(take);
  const remove=document.createElement('button');
  remove.innerHTML='<img alt="" src="assets/regular/trash.svg">';
  remove.disabled=recording||busy;
  remove.setAttribute('aria-label','删除录音 '+take.number);
  remove.onclick=async()=>{
   try{
    if(!demo)await writeTake('delete',take.id);
    takes.set(songs[index].id,currentTakes().filter(t=>t.id!==take.id));
    if(take.id===selected){stopPlayback();selected=currentTakes()[0]?.id;}
    message('');renderList();paint();
   }catch{message('删除失败，请重试');}
  };
  row.append(play,remove);list.append(row);
 }
}
async function hear(take){
 if(!take||busy||recording)return;
 playing=false;
 if(selected!==take.id){stopPlayback();selected=take.id;}
 if(listening){playback?.pause();listening=false;}
 else {
  if(take.blob&&!playback){
   playbackUrl=URL.createObjectURL(take.blob);
   playback=new Audio(playbackUrl);
   playback.onended=()=>{stopPlayback();renderList();paint();};
  }
  try{if(playback)await playback.play();listening=true;if(!replay)replay=take.seconds;}
  catch{stopPlayback();message('回听失败，请重试');}
 }
 renderList();paint();
}
let db;
async function readTakes(){
 if(demo){
  const id=new URLSearchParams(location.search).get('id')||'song18';
  takes.set(id,Array.from({length:5},(_,i)=>({id:'example'+i,number:5-i,seconds:8+i})));
  byId('record').closest('main').querySelector('header small').textContent='示例录音';
  return;
 }
 db=await new Promise((resolve,reject)=>{
  const req=indexedDB.open('rhyme-player-recordings',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('takes',{keyPath:'id'});
  req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result);
 });
 const all=await new Promise((resolve,reject)=>{
  const req=db.transaction('takes').objectStore('takes').getAll();
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
 for(const t of all.sort((a,b)=>b.created-a.created)){
  const list=takes.get(t.songId)||[];list.push(t);takes.set(t.songId,list);
 }
}
function writeTake(action,value){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('takes','readwrite');
  const store=tx.objectStore('takes');
  if(action==='put'){
   const existing=store.getAll();
   existing.onsuccess=()=>{if(existing.result.filter(t=>t.songId===value.songId).length>=5)tx.abort();else store.put(value);};
  }else store.delete(value);
  tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);
 });
}
async function finishTake(blob){
 const list=currentTakes();
 const take={id:crypto.randomUUID(),songId:songs[index].id,created:Date.now(),number:Math.max(0,...list.map(t=>t.number))+1,seconds:Math.max(1,recordSeconds),blob};
 try{
  if(!demo)await writeTake('put',take);
  takes.set(take.songId,[take,...list]);selected=take.id;
  message(list.length===4?'最多保存 5 条录音':'');
 }catch{message('保存失败，请检查存储空间或录音数量');}
 recording=false;busy=false;recorder=null;renderList();paint();
}
function stopCapture(){
 if(!recording||busy)return;
 busy=true;
 if(recorder)recorder.stop();else finishTake(null);
}
byId('record').onclick=async()=>{
 if(recording)return stopCapture();
 if(busy)return;
 if(currentTakes().length>=5){message('最多保存 5 条录音');return;}
 message('');playing=false;stopPlayback();busy=true;renderList();paint();
 let stream;
 try{
  if(!demo){
   stream=await navigator.mediaDevices.getUserMedia({audio:true});
   recorder=new MediaRecorder(stream);
   const chunks=[];
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());finishTake(new Blob(chunks,{type:recorder.mimeType}));};
   recorder.start();
  }
  captureStart=Date.now();recordSeconds=0;recording=true;
 }catch{stream?.getTracks().forEach(t=>t.stop());recorder=null;message('无法录音，请允许浏览器使用麦克风后重试');}
 busy=false;renderList();paint();
};
byId('listen').onclick=()=>hear(selectedTake());
setInterval(()=>{
 if(recording){
  recordSeconds=Math.min(60,Math.floor((Date.now()-captureStart)/1000));
  if(recordSeconds>=60)stopCapture();else paint();
 }
 if(listening){
  if(playback)replay=Math.max(0,selectedTake().seconds-Math.floor(playback.currentTime));
  else if(--replay<=0)stopPlayback();
  renderList();paint();
 }
 if(!playing)return;
 if(++position>=60){const mode=modeIndex;openSong(index+(mode===1?0:mode===2?1+Math.floor(Math.random()*5):1));playing=true;}paint();
},1000);
async function load(){
 try{const res=await fetch('songs.json');if(!res.ok)throw Error();songs=await res.json();await readTakes();openSong(Math.max(0,songs.findIndex(s=>s.id===new URLSearchParams(location.search).get('id'))));byId('sheet').hidden=false;byId('notice').hidden=true;}
 catch{byId('notice').innerHTML='童谣加载失败 <button>重试</button>';byId('notice').querySelector('button').onclick=load;}
}
load();
