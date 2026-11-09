async page=>{
const base='http://127.0.0.1:8765/design-system/';const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
for(const width of [320,390,430])for(const path of ['material-study/index.html','original-preview/index.html']){
 await page.setViewportSize({width,height:844});await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(a=>Promise.all(a.map(i=>i.decode())));
 const s=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).length}));if(s.overflow||s.broken)throw Error(JSON.stringify(s));
 if(path.startsWith('material')){if(await page.locator('.marks').count())throw Error('old progress remains');if(await page.locator('#total').textContent()!=='3 / 10')throw Error('counts');for(const t of ['audio-learning','text-science']){await page.locator('[data-target='+t+']').click();await page.goBack();}}
 else{if(await page.locator('.photo-stack').count())throw Error('photo remains');for(const t of ['video','books','manual']){await page.locator('[data-open='+t+']').click();await page.locator('dialog').waitFor({state:'visible'});await page.locator('.close').click();}}
 if(width===390)await page.screenshot({path:'design-system/material-study/'+(path.startsWith('material')?'refined-learn':'refined-original')+'.png'});results.push({width,path,...s});
}
for(const [state,total]of [['first','0 / 10'],['complete','10 / 10']]){await page.goto(base+'material-study/index.html?state='+state);if(await page.locator('#total').textContent()!==total)throw Error('state');}
await page.setViewportSize({width:1000,height:1100});await page.goto(base+'material-study/preview.html');await page.waitForTimeout(600);await page.screenshot({path:'design-system/material-study/refined-comparison.png',fullPage:true});if(errors.length)throw Error(errors.join(';'));return results;
}
