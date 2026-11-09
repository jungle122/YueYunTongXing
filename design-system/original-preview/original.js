const dialog=document.querySelector('dialog');const heading=document.querySelector('#dialog-title');const body=document.querySelector('#dialog-body');const action=document.querySelector('#dialog-action');let timer;
function open(kind){clearTimeout(timer);action.disabled=false;action.textContent='返回原创页';action.onclick=()=>dialog.close();
 if(kind==='video'){heading.textContent='原创视频';body.innerHTML='<p>视频列表将在下一页设计。本页先预览入口交互。</p>';}
 else if(kind==='books'){heading.textContent='绘本故事';body.innerHTML='<p>绘本列表尚未改版，本页保留阅读入口。</p><ul><li>氹氹转</li><li>月光光</li><li>齐齐望过去</li></ul>';}
 else if(kind==='manual'){heading.textContent='童谣课程手册';body.innerHTML='<p class="loading" role="status"><span class="spinner" aria-hidden="true"></span>手册加载中…</p>';action.disabled=true;timer=setTimeout(()=>{body.innerHTML='<p role="status">原型未连接云端手册，暂不能打开文件。</p>';action.disabled=false;action.textContent='重试';action.onclick=()=>open('manual');},900);}
 else{heading.textContent=kind==='games'?'游戏乐园':'我的成长';body.innerHTML='<p>此页尚未设计。</p>';}
 if(!dialog.open)dialog.showModal();
}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>open(b.dataset.open));
document.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const t=b.dataset.target;if(t==='original')return;if(t==='home')location.href='../paper-global/home-tea-recent.html';else if(t==='learn')location.href='../paper-global/learn.html';else open(t);});
dialog.addEventListener('close',()=>clearTimeout(timer));
