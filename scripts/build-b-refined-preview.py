"""线装册精修 + 无边框类型文字，仅写预览文件。"""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'design-system/book-shapes'
OUT=ROOT/'design-system/b-refined'
OUT.mkdir(parents=True,exist_ok=True)

CSS='''
/* Hallmark: selected stitched book refinement, preserve confirmed typography and entry. */
/* Critique: reduce mock-card styling and describe binding through four-hole threadwork. */
:root{--binding-cover:#efe4ce;--binding-paper:#fffef8;--binding-rule:#e5d9c0;--binding-cord:#9a7959;--binding-hole:#80644d;--binding-shadow:rgba(73,53,45,.08)}
.shape-b .resource-type{padding:0;border:0;border-radius:0;background:transparent;color:var(--color-text-secondary);clip-path:none}
.book-b{margin-top:calc(16 * var(--rpx));margin-bottom:calc(34 * var(--rpx))}
.book-b .book-frame{padding:calc(12 * var(--rpx)) calc(12 * var(--rpx)) calc(14 * var(--rpx)) calc(54 * var(--rpx));border:1px solid var(--book-edge);border-radius:calc(6 * var(--rpx));background:var(--binding-cover);box-shadow:0 calc(6 * var(--rpx)) calc(14 * var(--rpx)) var(--binding-shadow);isolation:isolate}
.book-b .book-frame:after{content:"";position:absolute;z-index:-1;left:calc(6 * var(--rpx));right:calc(6 * var(--rpx));bottom:calc(-6 * var(--rpx));height:calc(12 * var(--rpx));border:1px solid var(--book-edge);border-top:0;border-radius:0 0 calc(4 * var(--rpx)) calc(4 * var(--rpx));background:repeating-linear-gradient(0deg,var(--binding-paper),var(--binding-paper) 1px,var(--binding-rule) 1px,var(--binding-rule) 2px);box-sizing:border-box;pointer-events:none}
.book-b .book-grid{position:relative;padding:calc(8 * var(--rpx));border:1px solid var(--binding-rule);border-radius:calc(2 * var(--rpx));background:var(--binding-paper)}
.book-b .chapter-link{min-height:calc(280 * var(--rpx));padding:calc(22 * var(--rpx));display:grid;grid-template-rows:calc(34 * var(--rpx)) calc(54 * var(--rpx)) calc(84 * var(--rpx));gap:calc(8 * var(--rpx));align-content:center;justify-content:stretch;align-items:start}
.book-b .chapter-no,.book-b .chapter-summary{margin:0}
.book-b .chapter-no{color:var(--color-text-muted);line-height:1.4}
.book-b .chapter-name{line-height:1.5}
.book-b .chapter-summary{line-height:1.6;overflow-wrap:break-word}
.book-b .chapter-link:nth-child(-n+2){border-bottom:0}
.book-b .chapter-link:nth-child(-n+2):before{content:"";position:absolute;left:calc(22 * var(--rpx));right:calc(22 * var(--rpx));bottom:0;height:1px;background:var(--binding-rule);pointer-events:none}
.book-b .chapter-link:nth-child(odd){border-right:1px solid var(--binding-rule)}
.book-b .chapter-mark{right:calc(12 * var(--rpx));bottom:calc(12 * var(--rpx));width:calc(76 * var(--rpx));height:calc(76 * var(--rpx));opacity:.045}
.book-b .stitch-column{left:calc(4 * var(--rpx));top:calc(32 * var(--rpx));bottom:calc(32 * var(--rpx));width:calc(42 * var(--rpx));display:block;border-right:1px solid var(--binding-rule)}
.binding-cord{display:block;width:100%;height:100%;overflow:visible;fill:none;stroke:var(--binding-cord);stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
.binding-cord .binding-hole{fill:var(--binding-hole);stroke:var(--binding-paper);stroke-width:.7}
.book-b .chapter-link:hover{background:var(--color-primary-soft)}
.book-b .chapter-link:active{background:var(--color-surface-soft)}
.book-b .chapter-link:focus-visible{outline:2px solid var(--color-primary);outline-offset:calc(-8 * var(--rpx))}
'''

# 四孔线装：孔沿纵线连接，出线回绕至书脊边缘。
cord='''<div class="stitch-column" aria-hidden="true"><svg class="binding-cord" viewBox="0 0 36 300" preserveAspectRatio="none"><path d="M24 18V282 M2 18H24 M2 106H24 M2 194H24 M2 282H24 M24 18L2 62L24 106L2 150L24 194L2 238L24 282"/><circle class="binding-hole" cx="24" cy="18" r="2.5"/><circle class="binding-hole" cx="24" cy="106" r="2.5"/><circle class="binding-hole" cx="24" cy="194" r="2.5"/><circle class="binding-hole" cx="24" cy="282" r="2.5"/></svg></div>'''
for state in ['first','recent']:
    html=(SOURCE/f'b-{state}.html').read_text(encoding='utf-8')
    html=html.replace('</style>',CSS+'</style>',1)
    html=re.sub(r'<div class="stitch-column"[^>]*>.*?</div>',lambda _:cord,html,count=1,flags=re.S)
    (OUT/f'{state}.html').write_text(html,encoding='utf-8')

shell=(SOURCE/'index.html').read_text(encoding='utf-8').split('<main>')[0]
shell=shell.replace('<title>三种书本造型预览</title>','<title>线装册精修预览</title>')
shell=shell.replace('repeat(3,minmax(0,1fr))','repeat(2,minmax(0,1fr))').replace('main{max-width:1240px','main{max-width:820px')
html=shell+'''<main><h1>线装册精修</h1><p>四孔装订、薄书皮与纸页层次，统一章节排版；类型标识采用无边框小字。</p><div class="controls"><select id="size" aria-label="预览宽度"><option>375</option><option>320</option><option>430</option></select><button id="compare">对照精修前</button></div><div class="grid"><section><h2>首次使用</h2><div class="frame"><iframe title="首次使用" data-state="first" src="first.html"></iframe></div></section><section><h2>最近学习</h2><div class="frame"><iframe title="最近学习" data-state="recent" src="recent.html"></iframe></div></section></div><p>透明底阿霖、播放按钮及字体保持不变。预览中的学习记录为展示样例，正式页面未修改。</p></main><script>let before=false;const frames=[...document.querySelectorAll('iframe')];function update(){frames.forEach(f=>{f.src=before?'/design-system/book-shapes/b-'+f.dataset.state+'.html':f.dataset.state+'.html';f.style.width=document.querySelector('#size').value+'px'})}document.querySelector('#size').onchange=update;document.querySelector('#compare').onclick=()=>{before=!before;document.querySelector('#compare').textContent=before?'查看精修版':'对照精修前';update()};</script></html>'''
(OUT/'index.html').write_text(html,encoding='utf-8')
print('Built stitched-book refinement with both homepage states.')
