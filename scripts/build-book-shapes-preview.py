"""固定首页状态布局，并比较三种无透视书本结构；仅生成预览。"""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'design-system/book-shapes'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'design-system/c-polish'
PLAY=(OUT/'assets/play.svg').read_text(encoding='utf-8')
PLAY=re.sub(r'<svg\b','<svg class="action-icon" aria-hidden="true"',PLAY,count=1)

CHAPTERS=[('第一章','学习天地','童谣跟读、文化科普','learn'),('第二章','游戏乐园','趣味闯关、快乐练习','games'),('第三章','原创剧场','原创视频、趣味绘本','original'),('第四章','我的成长','收藏记录、学习足迹','profile')]
PLANS={'a':('平展精装书','无边框小字'), 'b':('线装册','印章标识'), 'c':('环装学习册','页签标识')}

def chapter(index):
    no,name,description,role=CHAPTERS[index]
    svg=(ROOT/f'design-system/icon-comparison/assets/phosphor/{role}.svg').read_text(encoding='utf-8')
    svg=re.sub(r'<svg\b','<svg class="chapter-mark" aria-hidden="true"',svg,count=1)
    return f'<button class="chapter-link" data-chapter="{role}"><span class="chapter-no">{no}</span><span class="chapter-name">{name}</span><span class="chapter-summary">{description}</span>{svg}</button>'

def book(plan):
    if plan=='c':
        inside='<div class="two-leaves"><div class="book-leaf">'+chapter(0)+chapter(2)+'</div><div class="book-leaf">'+chapter(1)+chapter(3)+'</div></div><div class="binder-rings" aria-hidden="true"><i></i><i></i><i></i></div>'
    else:
        inside='<div class="book-grid">'+''.join(chapter(i) for i in range(4))+'</div>'
        if plan=='b': inside='<div class="stitch-column" aria-hidden="true"><i></i><i></i><i></i></div>'+inside
    return f'<nav class="new-book book-{plan}" aria-label="四个章节导航"><div class="book-frame">{inside}</div></nav>'

CSS='''
/* Hallmark: custom book navigation study; layout: fixed state slots; fonts: confirmed. */
/* Critique: construct new parallel-edged books, rather than repairing the earlier shell. */
:root{--book-paper:#fffef8;--book-edge:#dbc8a7;--book-cover:#ad5740;--book-thread:#947354;--book-shade:rgba(73,53,45,.10);--book-gutter:rgba(104,66,43,.07)}
.plan-c .material-scene{height:calc(384 * var(--rpx));min-height:0;margin-top:0;margin-bottom:calc(24 * var(--rpx));padding:calc(12 * var(--rpx));box-sizing:border-box}
.plan-c .material-copy{display:grid;grid-template-rows:calc(36 * var(--rpx)) calc(144 * var(--rpx)) calc(88 * var(--rpx));gap:calc(8 * var(--rpx));align-content:center;min-width:0}
.plan-c .material-heading{height:calc(144 * var(--rpx));box-sizing:border-box;font-size:calc(48 * var(--rpx));line-height:1.35;margin:0;align-self:start}
.plan-c .material-art{height:calc(300 * var(--rpx));align-self:center}
.type-slot{height:calc(36 * var(--rpx));display:flex;align-items:center}
.type-slot.ghost{visibility:hidden}
.resource-type{font-family:PreviewWenkai,serif;font-size:calc(26 * var(--rpx));line-height:1.3;height:auto;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:var(--color-text-secondary)}
.shape-b .resource-type{padding:calc(2 * var(--rpx)) calc(8 * var(--rpx));border:1px solid var(--color-primary);color:var(--color-primary);border-radius:0}
.shape-c .resource-type{padding:calc(3 * var(--rpx)) calc(14 * var(--rpx));background:var(--color-surface-soft);color:var(--color-text-secondary);clip-path:polygon(0 0,100% 0,100% 100%,calc(10 * var(--rpx)) 100%,0 calc(100% - 10 * var(--rpx)))}
.plan-c .material-action{width:calc(248 * var(--rpx));height:calc(88 * var(--rpx));min-height:0;padding:calc(12 * var(--rpx));align-self:start;justify-self:start;box-sizing:border-box}
.new-book{position:relative;margin:calc(12 * var(--rpx)) 0 calc(28 * var(--rpx));width:100%;box-sizing:border-box}
.book-frame{position:relative;box-sizing:border-box;min-width:0;background:var(--book-cover);padding:calc(8 * var(--rpx));border:1px solid var(--book-cover);border-radius:calc(20 * var(--rpx));box-shadow:0 calc(10 * var(--rpx)) calc(20 * var(--rpx)) var(--book-shade)}
.book-grid{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));background:var(--book-paper);border-radius:calc(14 * var(--rpx));padding:calc(6 * var(--rpx));overflow:clip}
.book-a .book-grid:after{content:"";position:absolute;left:50%;top:0;bottom:0;width:calc(16 * var(--rpx));transform:translateX(-50%);background:linear-gradient(90deg,transparent,var(--book-gutter),transparent);pointer-events:none}
.chapter-link{position:relative;min-width:0;min-height:calc(264 * var(--rpx));width:100%;margin:0;padding:calc(22 * var(--rpx)) calc(18 * var(--rpx));display:flex;flex-direction:column;align-items:flex-start;justify-content:center;border:0;border-radius:0;background:transparent;color:var(--color-text);font:inherit;text-align:left;box-sizing:border-box;overflow:clip;cursor:pointer}
.chapter-link:after{border:0}
.chapter-link:focus-visible{outline:2px solid var(--color-primary);outline-offset:-4px}
.chapter-link:active{background:var(--color-primary-soft)}
.chapter-no{position:relative;z-index:1;display:block;margin-bottom:calc(20 * var(--rpx));font-family:PreviewWenkai,serif;font-size:calc(24 * var(--rpx));color:var(--color-text-muted);line-height:1.4}
.chapter-name{position:relative;z-index:1;font-family:PreviewBrush,serif;font-size:calc(36 * var(--rpx));line-height:1.5}
.chapter-summary{position:relative;z-index:1;display:block;margin-top:calc(8 * var(--rpx));font-family:PreviewWenkai,serif;font-size:calc(26 * var(--rpx));line-height:1.6;color:var(--color-text-secondary)}
.chapter-mark{position:absolute;right:calc(10 * var(--rpx));bottom:calc(8 * var(--rpx));width:calc(90 * var(--rpx));height:calc(90 * var(--rpx));color:var(--color-primary);fill:currentColor;opacity:.07;pointer-events:none}
.book-a .chapter-link:nth-child(-n+2){border-bottom:1px solid var(--color-border)}
.book-a .chapter-link:nth-child(odd){border-right:1px solid var(--color-border)}
.book-b .book-frame{padding:calc(10 * var(--rpx)) calc(8 * var(--rpx)) calc(10 * var(--rpx)) calc(46 * var(--rpx));border-color:var(--book-edge);border-radius:calc(6 * var(--rpx));background:var(--color-surface-soft);box-shadow:0 calc(6 * var(--rpx)) calc(14 * var(--rpx)) var(--book-shade)}
.book-b .book-grid{border:1px solid var(--book-edge);border-radius:0}
.book-b .chapter-link:nth-child(-n+2){border-bottom:1px solid var(--color-border)}
.book-b .chapter-link:nth-child(odd){border-right:1px solid var(--color-border)}
.stitch-column{position:absolute;left:calc(12 * var(--rpx));top:8%;bottom:8%;width:calc(24 * var(--rpx));display:flex;flex-direction:column;justify-content:space-around}
.stitch-column i{display:block;height:calc(36 * var(--rpx));border:1px solid var(--book-thread);border-left:0;border-radius:0 calc(14 * var(--rpx)) calc(14 * var(--rpx)) 0}
.book-c .book-frame{padding:0;border:0;background:transparent;box-shadow:none;border-radius:0}
.two-leaves{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(28 * var(--rpx))}
.book-leaf{min-width:0;padding:calc(6 * var(--rpx));background:var(--book-paper);border:1px solid var(--book-edge);border-radius:calc(20 * var(--rpx));box-shadow:0 calc(6 * var(--rpx)) calc(12 * var(--rpx)) var(--book-shade)}
.book-leaf .chapter-link:first-child{border-bottom:1px solid var(--color-border)}
.binder-rings{position:absolute;left:50%;top:10%;bottom:10%;width:calc(36 * var(--rpx));transform:translateX(-50%);display:flex;flex-direction:column;justify-content:space-around;pointer-events:none}
.binder-rings i{height:calc(16 * var(--rpx));border:2px solid var(--book-thread);background:var(--color-surface-soft);border-radius:50%}
.chapter-dialog{max-width:85%;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg);color:var(--color-text);font-family:PreviewWenkai,serif}
.chapter-dialog h2{font-family:PreviewBrush,serif;font-weight:400}
.chapter-dialog ul{padding-left:24px;line-height:2}
.chapter-dialog button{font-family:inherit;color:var(--color-primary)}
'''

for shape in PLANS:
    for state in ['first','recent']:
        html=(SOURCE/f'wenkai-{state}.html').read_text(encoding='utf-8')
        html=html.replace('class="plan-c"',f'class="plan-c shape-{shape}"')
        html=html.replace('</style>',CSS+'</style>',1)
        heading='月光光' if state=='recent' else '粤语童谣<br>时光屋'
        label='继续学习' if state=='recent' else '开始学习'
        slot=f'<div class="type-slot{" ghost" if state=="first" else ""}"'+(' aria-hidden="true"' if state=='first' else '')+'><span class="resource-type">童谣</span></div>'
        entry=f'<div class="material-copy">{slot}<h1 class="material-heading">{heading}</h1><a class="material-action" href="/design-system/material-preview/c-learn-first.html">{PLAY}<span>{label}</span></a></div>'
        html=re.sub(r'<div class="material-copy">.*?</div>(?=<img class="material-art")',lambda _:entry,html,count=1,flags=re.S)
        html=re.sub(r'<div class="book-stage">.*?(?=<div class="extra-entries">)',lambda _:book(shape),html,count=1,flags=re.S)
        html=html.replace('</html>','''<dialog class="chapter-dialog"><form method="dialog"><button>关闭</button></form><h2></h2><ul></ul></dialog><script>const chapters={learn:['学习天地','音频学习','文字科普'],games:['游戏乐园','童谣接龙','童谣消消乐','歌词挑战','绘本拼图'],original:['原创剧场','原创视频','绘本故事','童谣课程手册'],profile:['我的成长','我的收藏','历史记录','学习统计','个性化设置']};document.querySelectorAll('[data-chapter]').forEach(button=>button.onclick=()=>{const values=chapters[button.dataset.chapter],dialog=document.querySelector('.chapter-dialog');dialog.querySelector('h2').textContent=values[0];dialog.querySelector('ul').replaceChildren(...values.slice(1).map(text=>{const li=document.createElement('li');li.textContent=text;return li}));dialog.showModal()});</script></html>''')
        (OUT/f'{shape}-{state}.html').write_text(html,encoding='utf-8')

shell=(ROOT/'design-system/material-preview/index.html').read_text(encoding='utf-8').split('<main>')[0]
shell=shell.replace('<title>童谣时光屋文创视觉探索</title>','<title>三种书本造型预览</title>')
index=shell+'''<main><h1>书本重新画，入口不跳动</h1><p>固定角色、标题与播放按钮的位置。大标题用马善政楷体，小字统一霞鹜文楷 TC。</p><div class="controls"><select id="state" aria-label="状态"><option value="recent">最近学习</option><option value="first">首次使用</option></select><select id="size" aria-label="宽度"><option>375</option><option>320</option><option>430</option></select></div><div class="grid">'''
for shape,(name,tag) in PLANS.items():
    index+=f'<section><h2>{shape.upper()} / {name}</h2><p>类型：{tag}</p><div class="frame"><iframe title="{name}" data-shape="{shape}" src="{shape}-recent.html"></iframe></div></section>'
index+='''</div><p>首次使用标题为“粤语童谣时光屋”。章节可点击查看栏目。所有书本外框均无倾斜或透视变换；正式页面未修改。</p></main><script>function update(){document.querySelectorAll('iframe').forEach(f=>{f.src=f.dataset.shape+'-'+document.querySelector('#state').value+'.html';f.style.width=document.querySelector('#size').value+'px'})}['state','size'].forEach(id=>document.getElementById(id).onchange=update);</script></html>'''
(OUT/'index.html').write_text(index,encoding='utf-8')
print('Built six home states and three newly constructed book navigations.')
