async page => {
 await page.setViewportSize({width:1360,height:1100});
 await page.goto('http://127.0.0.1:8765/design-system/icon-comparison/c-refined.html');
 const results=[];
 for(const width of ['320','430','375']){
  await page.locator('#size').selectOption(width);
  await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'));
  results.push(await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({page:f.dataset.page,width:f.contentWindow.innerWidth,overflow:f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth,broken:[...f.contentDocument.images].filter(i=>!i.complete||!i.naturalWidth).length,tabIcon:f.contentWindow.getComputedStyle(f.contentDocument.querySelector('.preview-tabbar svg')).width,iconBackground:f.contentDocument.querySelector('.candidate-symbol,.category-icon')?f.contentWindow.getComputedStyle(f.contentDocument.querySelector('.candidate-symbol,.category-icon')).backgroundColor:'not-applicable'}))));
 }
 await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/icon-comparison/c-refined-preview.png',fullPage:true});
 await page.locator('#before').click();await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentWindow.location.pathname.includes('phosphor-')));
 await page.locator('#before').click();await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentWindow.location.pathname.includes('c-refined-')));
 return results;
}