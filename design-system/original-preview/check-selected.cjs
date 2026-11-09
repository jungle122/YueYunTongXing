async page=>{
const base='http://127.0.0.1:8765/design-system/';const results=[];
for(const width of [320,390,430]){
 await page.setViewportSize({width,height:844});
 const read=()=>page.evaluate(()=>{const h=document.querySelector('h1'),c=document.querySelector('.chapter-label,.chapter');const css=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,fontSize:s.fontSize,lineHeight:s.lineHeight,fontWeight:s.fontWeight,color:s.color,padding:s.padding,borderTop:s.borderTop,borderBottom:s.borderBottom}};return {h:css(h),c:css(c)}});
 await page.goto(base+'paper-global/learn.html');await page.evaluate(()=>document.fonts.ready);const expected=await read();
 await page.goto(base+'original-preview/index.html');await page.evaluate(()=>document.fonts.ready);const actual=await read();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error(JSON.stringify({width,expected,actual}));
 const broken=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||[...document.images].some(i=>!i.complete||!i.naturalWidth));if(broken)throw Error('layout/assets');
 await page.locator('[data-open=video]').click();await page.locator('dialog').waitFor({state:'visible'});await page.locator('.close').click();
 if(width===390)await page.screenshot({path:'design-system/original-preview/selected-a.png'});results.push({width,headingMatches:true});
}
await page.setViewportSize({width:1000,height:1100});await page.goto(base+'original-preview/preview.html');await page.waitForTimeout(700);await page.screenshot({path:'design-system/original-preview/selected-comparison.png',fullPage:true});return results;
}
