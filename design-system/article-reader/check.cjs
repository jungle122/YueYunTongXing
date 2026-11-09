async page=>{
 const base='http://127.0.0.1:8765/design-system/article-reader/';
 const ids=['cantonese-history','festival-rhymes','language-features','modern-development'];const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});for(const id of ids){
 await page.goto(base+'index.html?id='+id+'&state=first');await page.waitForFunction(()=>document.querySelector('output').textContent.includes('%'));
 const result=await page.evaluate(async()=>{const a=(await (await fetch('articles.json')).json()).find(a=>a.id===new URLSearchParams(location.search).get('id'));const text=document.querySelector('article').textContent;const original=[...a.paragraphs,...a.continuedParagraphs,a.tips,a.features,a.conclusion].filter(Boolean);return {width:innerWidth,id:a.id,overflow:document.documentElement.scrollWidth>innerWidth,originalIntact:original.every(t=>text.includes(t)),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length};});
 if(result.overflow||!result.originalIntact||result.broken)throw Error(JSON.stringify(result));
 const toggle=page.locator('#explain-toggle');await toggle.click();if(await toggle.getAttribute('aria-expanded')!=='true'||!await page.locator('#explain').isVisible())throw Error('open');await toggle.click();if(await toggle.getAttribute('aria-expanded')!=='false')throw Error('close');
 const favorite=page.locator('#dock button'),old=await favorite.getAttribute('aria-pressed');await favorite.click();if(await favorite.getAttribute('aria-pressed')===old)throw Error('favorite');await favorite.click();
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await page.waitForFunction(()=>document.querySelector('output').textContent==='100%');
 result.alignment=await page.evaluate(()=>{const cy=s=>{let r=document.querySelector(s).getBoundingClientRect();return r.y+r.height/2};return {star:cy('#dock button img')-cy('#dock button'),arrow:cy('.listen-link img')-cy('.listen-link span')};});results.push(result);
 if(width===390){await toggle.click();await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await page.screenshot({path:'design-system/article-reader/'+id+'-bottom.png'});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'design-system/article-reader/'+id+'-top.png'});}
 }}
 await page.setViewportSize({width:900,height:1130});await page.goto(base+'compare.html');await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument.querySelector('output')?.textContent.includes('%')));await page.screenshot({path:'design-system/article-reader/comparison-top.png'});
 await page.selectOption('#position','bottom');await page.waitForTimeout(150);await page.screenshot({path:'design-system/article-reader/comparison-bottom.png'});
 if(errors.length)throw Error(errors.join(';'));return results;
}