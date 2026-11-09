async page=>{
 await page.setViewportSize({width:1710,height:1450});await page.goto('http://127.0.0.1:8765/design-system/binding-study/');const results=[];
 for(const width of ['320','430','375']){
 await page.locator('#size').selectOption(width);
 for(const state of ['first','recent']){
 await page.locator('#state').selectOption(state);await page.waitForFunction(state=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'&&f.contentWindow.location.pathname.endsWith('-'+state+'.html')),state);
 for(const f of page.frames().filter(f=>f.parentFrame())){await f.evaluate(()=>document.fonts.ready);await f.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));}
 const row=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>{const d=f.contentDocument,w=f.contentWindow,r=d.querySelector('.book-frame').getBoundingClientRect();return {kind:f.dataset.pattern,width:w.innerWidth,overflow:d.documentElement.scrollWidth>w.innerWidth,holes:d.querySelectorAll('.stitch-column circle').length,book:{x:r.x,y:r.y,width:r.width,height:r.height},broken:[...d.images].filter(i=>!i.complete||!i.naturalWidth).length}}));
 for(const value of row)for(const dim of ['x','y','width','height'])if(Math.abs(value.book[dim]-row[0].book[dim])>.5)throw Error('Book layout changed');results.push({width,state,row});
 }
 }
 await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/binding-study/comparison.png',fullPage:true});
 await page.locator('#zooms').click();if(!await page.locator('.closeup').first().evaluate(el=>el.hidden))throw Error('Closeup toggle failed');await page.locator('#zooms').click();return results;
}