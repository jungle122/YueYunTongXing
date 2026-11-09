const names={"audio-learning":"音频学习","text-science":"文字科普",games:"小游戏乐园",original:"原创剧场",profile:"我的成长"};
const recent=new URLSearchParams(location.search).get('state')==='recent';
const values=recent?[31,100]:[0,0];
document.querySelectorAll('.entry').forEach((entry,i)=>{entry.querySelector('.value').textContent=values[i]+'%';entry.querySelector('.fill').style.width=values[i]+'%';entry.querySelector('[role=progressbar]').setAttribute('aria-valuenow',values[i])});
document.querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',()=>{const target=button.dataset.target;if(target==='learn')return;if(target==='home'){location.href='../binding-study/four-'+(recent?'recent':'first')+'.html';return}document.querySelector('#dialog-title').textContent=names[target];document.querySelector('dialog').showModal()}));
