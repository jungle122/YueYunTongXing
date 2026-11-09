async page=>{
 await page.setViewportSize({width:1360,height:1180});await page.goto('http://127.0.0.1:8765/design-system/material-preview/');
 const results=[];
 for(const width of ['320','430','375']){
 await page.locator('#size').selectOption(width);
 for(const name of ['home','learn']){
 await page.locator('#page').selectOption(name);
 for(const state of (name==='home'?['first','recent']:['first'])){
 await page.locator('#state').selectOption(state);
 await page.waitForFunction(({name,state})=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'&&f.contentWindow.location.pathname.endsWith('-'+name+'-'+state+'.html')),{name,state});
 for(const f of page.frames().filter(f=>f.parentFrame())){await f.evaluate(()=>document.fonts.ready);await f.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));}
 results.push(await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({plan:f.dataset.plan,width:f.contentWindow.innerWidth,overflow:f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth,broken:[...f.contentDocument.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),fonts:[...f.contentDocument.fonts].filter(x=>x.status==='loaded').map(x=>x.family),headingFont:f.contentWindow.getComputedStyle(f.contentDocument.querySelector('.material-heading')).fontFamily,tab:f.contentWindow.getComputedStyle(f.contentDocument.querySelector('.preview-tabbar svg')).width}))));
 if(width==='375')await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/material-preview/'+name+'-'+state+'.png',fullPage:true});
 }
 }
 }
 await page.locator('#page').selectOption('home');await page.locator('#state').selectOption('first');await page.evaluate(r=>window.materialChecks=r,results);return results;
}