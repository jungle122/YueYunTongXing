async page=>{
 await page.setViewportSize({width:1360,height:1120});await page.goto('http://127.0.0.1:8765/design-system/header-comparison/');
 const results=[];
 for(const size of ['320','430','375']){
  await page.locator('#size').selectOption(size);
  for(const name of ['learn','learning-stats','home']){
   await page.locator('#page').selectOption(name);
   for(const state of (name==='home'?['first','recent']:['first'])){
    if(name==='home')await page.locator('#state').selectOption(state);
    await page.waitForFunction(({name,state})=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'&&f.contentWindow.location.pathname.endsWith('-'+name+'-'+(name==='home'?state:document.querySelector('#state').value)+'.html')),{name,state});
    const row=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({variant:f.dataset.variant,width:f.contentWindow.innerWidth,overflow:f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth,heading:f.contentDocument.querySelectorAll('.title-area,.resume-entry').length,tabWidth:f.contentWindow.getComputedStyle(f.contentDocument.querySelector('.preview-tabbar svg')).width,broken:[...f.contentDocument.images].filter(i=>!i.complete||!i.naturalWidth).length})));
    results.push({size,name,state,row});
    if(size==='375')await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/header-comparison/'+name+'-'+state+'.png',fullPage:true});
   }
  }
 }
 await page.locator('#page').selectOption('learn');await page.evaluate(r=>window.headerChecks=r,results);return results;
}