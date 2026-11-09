async page=>{
 const base='http://127.0.0.1:8765/design-system/';const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
 for(const width of [320,390,430]){
 await page.setViewportSize({width,height:844});await page.goto(base+'original-preview/index.html');await page.evaluate(()=>document.fonts.ready);
 const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).length,entries:document.querySelectorAll('[data-open]').length,active:document.querySelector('.tab.active').textContent.trim()}));
 if(layout.overflow||layout.broken||layout.entries!==3||layout.active!=='原创')throw Error(JSON.stringify(layout));
 for(const kind of ['video','books']){await page.locator('[data-open='+kind+']').click();if(!await page.locator('dialog').isVisible())throw Error('no dialog');await page.locator('.close').click();}
 await page.locator('[data-open=manual]').click();if(!await page.locator('.spinner').isVisible())throw Error('loading state');await page.waitForFunction(()=>document.querySelector('#dialog-action').textContent==='重试');await page.locator('#dialog-action').click();if(!await page.locator('.spinner').isVisible())throw Error('retry');await page.locator('.close').click();await page.waitForTimeout(950);if(await page.locator('dialog').isVisible())throw Error('stale timer');
 await page.evaluate(()=>scrollTo(0,0));if(width===390)await page.screenshot({path:'design-system/original-preview/preview.png'});results.push(layout);
 }
 await page.locator('[data-target=learn]').click();await page.waitForURL('**/paper-global/learn.html');await page.locator('[data-target=original]').click();await page.waitForURL('**/original-preview/index.html');
 await page.locator('[data-target=home]').click();await page.waitForURL('**/paper-global/home-tea-recent.html');
 if(errors.length)throw Error(errors.join(';'));return results;
}
