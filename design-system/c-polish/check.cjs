async page=>{
 await page.setViewportSize({width:960,height:1120});await page.goto('http://127.0.0.1:8765/design-system/c-polish/');
 const checks=[];
 for(const width of ['320','430','375']){
 await page.locator('#size').selectOption(width);
 for(const state of ['first','recent']){
 await page.locator('#state').selectOption(state);
 await page.waitForFunction(state=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'&&f.contentWindow.location.pathname.endsWith('-'+state+'.html')),state);
 for(const f of page.frames().filter(f=>f.parentFrame())){await f.evaluate(()=>document.fonts.ready);await f.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));}
 checks.push(await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>{const d=f.contentDocument,w=f.contentWindow,cover=d.querySelector('.book-cover'),stack=d.querySelector('.page-stack-left'),button=d.querySelector('.material-action');return {font:f.dataset.font,width:w.innerWidth,overflow:d.documentElement.scrollWidth>w.innerWidth,loadedFonts:[...d.fonts].filter(x=>x.status==='loaded').map(x=>x.family),badge:d.querySelector('.resource-type')?.textContent||null,coverRadii:[w.getComputedStyle(cover).borderTopLeftRadius,w.getComputedStyle(cover).borderBottomLeftRadius],pageRotation:w.getComputedStyle(stack).transform,buttonIcon:button.querySelectorAll('svg').length,broken:[...d.images].filter(i=>!i.complete||!i.naturalWidth).length}})));
 if(width==='375')await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/c-polish/'+state+'-comparison.png',fullPage:true});
 }
 }
 const frame=page.frames().find(f=>f.url().includes('wenkai-recent'));const button=frame.locator('.material-action');const box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();const active=await button.evaluate(el=>({transform:getComputedStyle(el).transform,background:getComputedStyle(el).backgroundColor}));await page.mouse.up();await page.goto('http://127.0.0.1:8765/design-system/c-polish/');
 await page.locator('#transparent').click();const dialog=await page.locator('dialog').evaluate(el=>el.open);await page.locator('dialog button').click();
 return {checks,active,dialog};
}