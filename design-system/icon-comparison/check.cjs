async page => {
 await page.setViewportSize({width:1360,height:1120});
 await page.goto('http://127.0.0.1:8765/design-system/icon-comparison/');
 const results=[];
 for(const width of ['375','320','430']) {
  await page.locator('#size').selectOption(width);
  for(const name of ['learn','home','learning-stats']) {
   await page.locator('#page').selectOption(name);
   await page.waitForFunction(name=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete' && f.contentWindow.location.pathname.endsWith('-'+name+'.html')),name);
   const checks=await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({family:f.dataset.family,width:f.contentWindow.innerWidth,overflow:f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth,icons:f.contentDocument.querySelectorAll('svg.candidate-icon').length,brokenImages:[...f.contentDocument.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})));
   results.push({width,name,checks});
   if(width==='375')await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/icon-comparison/'+(name==='learn'?'learning':name)+'-comparison.png',fullPage:true});
  }
 }
 await page.locator('#size').selectOption('375');await page.locator('#page').selectOption('learn');
 await page.evaluate(r=>window.comparisonChecks=r,results);return results;
}