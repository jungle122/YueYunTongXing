async page=>{
 const base='http://127.0.0.1:8765/design-system/';const errors=[];const results=[];page.on('pageerror',e=>errors.push(e.message));
 for(const v of ['a','b','c'])for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});await page.goto(base+'material-study/learn.html?v='+v);await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(items=>Promise.all(items.map(i=>i.decode())));
  const s=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,counts:[...document.querySelectorAll('.count')].map(e=>e.textContent),total:document.querySelector('#total').textContent,broken:[...document.images].some(i=>!i.naturalWidth)}));if(s.overflow||s.broken||s.total!=='3 / 10')throw Error(JSON.stringify(s));
  if(width===390)await page.screenshot({path:'design-system/material-study/learn-'+v+'.png'});
  for(const [target,url] of [['audio-learning','audio-directory/list.html'],['text-science','text-science/index.html']]){await page.locator('[data-target='+target+']').click();if(!page.url().includes(url))throw Error('navigation');await page.goBack();}
  results.push({v,width,...s});
 }
 for(const state of ['first','complete']){await page.goto(base+'material-study/learn.html?v=a&state='+state);const count=await page.locator('#total').textContent();if(count!==(state==='first'?'0 / 10':'10 / 10'))throw Error(count);}
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await page.goto(base+'original-preview/index.html');await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(items=>Promise.all(items.map(i=>i.decode())));if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('original overflow');if(width===390)await page.screenshot({path:'design-system/material-study/original.png'});for(const kind of ['video','books','manual']){await page.locator('[data-open='+kind+']').click();await page.locator('dialog').waitFor({state:'visible'});await page.locator('.close').click();}}
 await page.setViewportSize({width:1320,height:1150});await page.goto(base+'material-study/preview.html');await page.waitForTimeout(1000);await page.screenshot({path:'design-system/material-study/comparison.png',fullPage:true});if(errors.length)throw Error(errors.join(';'));return results;
}
