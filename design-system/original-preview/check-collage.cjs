async page=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
for(const v of ['a','b','c'])for(const width of [320,390,430]){
 await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:8765/design-system/original-preview/collage.html?v='+v);await page.evaluate(()=>document.fonts.ready);
 await page.locator('.film-source').evaluate(i=>i.decode());await page.locator('.manual-art img').evaluate(i=>i.decode());
 const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),entries:document.querySelectorAll('[data-open]').length}));
 if(state.overflow||state.broken.length||state.entries!==3)throw Error(JSON.stringify(state));
 for(const kind of ['video','books','manual']){await page.locator('[data-open='+kind+']').click();if(!await page.locator('dialog').isVisible())throw Error(kind);if(kind==='manual'){await page.waitForFunction(()=>document.querySelector('#dialog-action').textContent==='重试');await page.locator('#dialog-action').click();if(!await page.locator('.spinner').isVisible())throw Error('retry');}await page.locator('.close').click();}
 await page.evaluate(()=>scrollTo(0,0));if(width===390)await page.screenshot({path:'design-system/original-preview/collage-'+v+'.png'});results.push({v,width,...state});
}
await page.setViewportSize({width:1320,height:1120});await page.goto('http://127.0.0.1:8765/design-system/original-preview/preview.html');await page.waitForTimeout(1000);await page.screenshot({path:'design-system/original-preview/collage-comparison.png',fullPage:true});
if(errors.length)throw Error(errors.join(';'));return results;
}
