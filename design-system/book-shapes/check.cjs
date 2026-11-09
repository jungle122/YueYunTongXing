async page=>{
 await page.setViewportSize({width:1360,height:1130});await page.goto('http://127.0.0.1:8765/design-system/book-shapes/');const results=[];const positions={};
 for(const width of ['320','430','375']){
  await page.locator('#size').selectOption(width);
  for(const state of ['first','recent']){
   await page.locator('#state').selectOption(state);await page.waitForFunction(state=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'&&f.contentWindow.location.pathname.endsWith('-'+state+'.html')),state);
   for(const f of page.frames().filter(f=>f.parentFrame())){await f.evaluate(()=>document.fonts.ready);await f.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));}
   const check=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>{const d=f.contentDocument,w=f.contentWindow;const rect=sel=>{const r=d.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};return {shape:f.dataset.shape,width:w.innerWidth,overflow:d.documentElement.scrollWidth>w.innerWidth,title:d.querySelector('.material-heading').textContent,chapters:d.querySelectorAll('.chapter-link').length,bookRotation:w.getComputedStyle(d.querySelector('.book-frame')).transform,role:rect('.material-art'),heading:rect('.material-heading'),button:rect('.material-action'),book:rect('.new-book'),broken:[...d.images].filter(i=>!i.complete||!i.naturalWidth).length,play:d.querySelector('.material-action .action-icon')?.getAttribute('viewBox')}}));
   for(const row of check){const key=width+row.shape;if(state==='first')positions[key]=row;else for(const sel of ['role','heading','button','book'])for(const dim of ['x','y','width','height'])if(Math.abs(row[sel][dim]-positions[key][sel][dim])>.5)throw Error('State layout moved '+key+' '+sel+' '+dim)}results.push({width,state,check});
   if(width==='375')await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/book-shapes/'+state+'-comparison.png',fullPage:true});
  }
 }
 const f=page.frames().find(f=>f.url().endsWith('a-recent.html'));for(const role of ['learn','games','original','profile']){await f.locator('[data-chapter='+role+']').click();if(!await f.locator('dialog').evaluate(d=>d.open))throw Error('Navigation did not respond');await f.locator('dialog button').click()}
 return {results,geometry:'All four element rectangles identical across states',navigation:'4 chapter buttons verified'};
}