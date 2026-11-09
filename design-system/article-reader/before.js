const el=id=>document.getElementById(id);
const query=new URLSearchParams(location.search);
const state=query.get('state')||'partial';
const progressKey='reader-before-progress-'+state;
const saved=JSON.parse(sessionStorage.getItem(progressKey)||'{}');
const stars=new Set(JSON.parse(sessionStorage.getItem('article-stars')||'[]'));
function append(parent,tag,text){const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;}
async function load(){
 try{
 const res=await fetch('articles.json');if(!res.ok)throw Error();
 const articles=await res.json();
 const index=articles.findIndex(a=>a.id===(query.get('id')||articles[0].id));
 const a=articles[index];if(!a)throw Error();
 document.title=a.title;document.querySelector('h1').textContent=a.title;
 el('back').href='../text-science/index.html?state='+encodeURIComponent(state);
 el('folio').textContent=(index+1)+' / '+articles.length;
 el('number').textContent='第'+'一二三四'[index]+'篇';el('section').textContent=a.sectionName;el('subtitle').textContent=a.subtitle;el('duration').textContent='约 '+a.readTime+' 分钟';
 const body=document.querySelector('article');
 function note(title,text){if(!text)return;const aside=document.createElement('aside');append(aside,'h2',title);append(aside,'p',text);body.append(aside);}
 for(const line of a.paragraphs)append(body,'p',line);
 note(a.tipsTitle,a.tips);
 for(const line of a.continuedParagraphs)append(body,'p',line);
 note(a.featuresTitle,a.features);if(a.conclusion)append(body,'p',a.conclusion);
 el('explain').textContent=['读《月光光》时，找一找插秧、放牛这些生活场景。','读到节日名字时，想想家里会唱哪一首童谣。','把歌词念出声，听听哪两个句尾听起来相似。','想一想，你最近是从谁那里、或在哪个屏幕上学到童谣的。'][index];
 const fav=document.querySelector('#dock button');
 function paint(){fav.setAttribute('aria-pressed',stars.has(a.id));fav.firstChild.src='../audio-player-preview/assets/'+(stars.has(a.id)?'star-orange.svg':'regular/star.svg');}
 fav.onclick=()=>{if(stars.has(a.id))stars.delete(a.id);else stars.add(a.id);sessionStorage.setItem('article-stars',JSON.stringify([...stars]));paint();};paint();
 el('notice').hidden=true;document.querySelector('main').hidden=false;el('dock').hidden=false;
 let highest=Math.max(saved[a.id]||0,state==='complete'?100:state==='first'?0:[100,35,0,0][index],10);
 function track(){
 const distance=document.documentElement.scrollHeight-innerHeight;
 highest=Math.max(highest,distance<=1?100:Math.min(100,Math.round(100*scrollY/distance)));
 document.querySelector('progress').value=highest;document.querySelector('output').textContent=highest+'%';
 saved[a.id]=highest;sessionStorage.setItem(progressKey,JSON.stringify(saved));
 }
 await document.fonts.ready;track();addEventListener('scroll',track,{passive:true});addEventListener('resize',track);
 }catch{el('notice').innerHTML='文章加载失败 <button>返回目录</button>';el('notice').querySelector('button').onclick=()=>location.assign(el('back').href);}
}
load();
