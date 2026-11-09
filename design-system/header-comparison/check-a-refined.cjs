async page=>{
 await page.setViewportSize({width:1360,height:1100});await page.goto('http://127.0.0.1:8765/design-system/header-comparison/a-refined.html');
 const checks=[];
 for(const size of ['320','430','375']){
 await page.locator('#size').selectOption(size);await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.readyState==='complete'));
 checks.push(await page.evaluate(()=>[...document.querySelectorAll('iframe')].map(f=>({width:f.contentWindow.innerWidth,title:f.title,overflow:f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth,entry:f.contentDocument.querySelector('.resume-entry')?.textContent.trim(),entryHeight:f.contentDocument.querySelector('.resume-entry')?.getBoundingClientRect().height,bookTitle:!!f.contentDocument.querySelector('.storybook-heading')}))));
 }
 await page.screenshot({path:'D:/07_codeProjects/YueYunTongXing/design-system/header-comparison/a-refined-preview.png',fullPage:true});
 const first=page.frames().find(f=>f.url().endsWith('a-home-first.html'));await first.locator('.resume-entry').click();await first.waitForURL('**/a-learn-first.html');
 await page.reload();return checks;
}