"""C 方案首页细化与小字字体对比，仅生成预览。"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'design-system/c-polish'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'design-system/material-preview'
CUTOUT = OUT / 'assets/moon-alin-transparent.png'
if not CUTOUT.exists():
    raise FileNotFoundError('请先保存透明背景阿霖素材：' + str(CUTOUT))

def icon(role):
    s = (ROOT/f'design-system/icon-comparison/assets/phosphor/{role}.svg').read_text(encoding='utf-8')
    return re.sub(r'<svg\b', '<svg class="action-icon" aria-hidden="true"', s, count=1)

CSS = '''
/* Hallmark: preserve selected C design, compare small-copy typography. */
/* Critique: one clear continuation action; aligned cover and page geometry. */
@font-face{font-family:PreviewSong;src:local("SimSun");font-display:swap}
:root{--book-gutter:#e8dcc5;--book-crease:rgba(121,84,54,.07);--book-soft-shadow:rgba(73,53,45,.12)}
body,.native-title,.preview-tabbar a,.entry-description,.entry-number,.entry-corner,.extra-title,.extra-desc,.resource-type,.material-action,.material-action span{font-family:var(--preview-body);font-style:normal}
.material-heading,.entry-title{font-family:var(--preview-c);font-weight:400}
.material-heading{margin-bottom:calc(16 * var(--rpx))}
.resource-type{display:table;margin:0 0 calc(12 * var(--rpx));padding:calc(3 * var(--rpx)) calc(12 * var(--rpx));border:1px solid var(--color-primary-border);border-radius:calc(8 * var(--rpx));background:var(--color-primary-soft);color:var(--color-primary);font-size:calc(26 * var(--rpx));line-height:1.5}
.plan-c .material-art{mix-blend-mode:normal;object-fit:contain;height:calc(300 * var(--rpx))}
.plan-c .material-scene{padding-top:calc(18 * var(--rpx));padding-bottom:calc(24 * var(--rpx));min-height:calc(320 * var(--rpx))}
.plan-c .material-action{display:inline-flex;gap:calc(12 * var(--rpx));min-height:calc(88 * var(--rpx));max-width:100%;padding:calc(12 * var(--rpx)) calc(24 * var(--rpx));border:1px solid var(--color-primary);border-radius:calc(20 * var(--rpx));background:var(--color-primary);color:var(--color-white);font-size:calc(30 * var(--rpx));font-weight:500;line-height:1.4;transition:background-color 140ms ease-out,transform 140ms ease-out}
.material-action .action-icon{width:calc(36 * var(--rpx));height:calc(36 * var(--rpx));fill:currentColor;flex-shrink:0}
.material-action span{white-space:nowrap}
.plan-c .material-action:hover{background:var(--color-primary-pressed)}
.plan-c .material-action:active{background:var(--color-primary-pressed);transform:translateY(1px)}
.plan-c .material-action:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px}
.plan-c .material-action[aria-disabled="true"]{background:var(--color-disabled-bg);color:var(--color-disabled-text);border-color:var(--color-border);cursor:not-allowed}
.book-cover{border-width:calc(2 * var(--rpx));border-radius:calc(28 * var(--rpx));box-shadow:0 calc(10 * var(--rpx)) calc(20 * var(--rpx)) var(--book-soft-shadow)}
.page-stack{transform:none;border-radius:calc(22 * var(--rpx));background:var(--color-surface-soft)}
.page-stack-left,.page-stack-right{transform:none}
.open-book{border-radius:calc(22 * var(--rpx));box-shadow:none}
.left-page{border-radius:calc(20 * var(--rpx)) 0 0 calc(20 * var(--rpx));box-shadow:inset calc(-8 * var(--rpx)) 0 calc(12 * var(--rpx)) var(--book-crease)}
.right-page{border-radius:0 calc(20 * var(--rpx)) calc(20 * var(--rpx)) 0;box-shadow:inset calc(8 * var(--rpx)) 0 calc(12 * var(--rpx)) var(--book-crease)}
.book-spine{width:calc(18 * var(--rpx));background:linear-gradient(90deg,var(--color-surface),var(--book-gutter) 50%,var(--color-surface));opacity:.7}
.spine-highlight{display:none}
.book-entry{border-radius:calc(14 * var(--rpx))}
.entry-title{font-size:calc(32 * var(--rpx))}
.entry-number,.entry-corner,.entry-description{letter-spacing:0}
.entry-description,.extra-desc,.entry-number{font-size:calc(26 * var(--rpx));line-height:1.55}
@media(prefers-reduced-motion:reduce){.plan-c .material-action{transition:none}}
'''

for family in ['wenkai','song']:
    for state in ['first','recent']:
        html = (SOURCE/f'c-home-{state}.html').read_text(encoding='utf-8')
        html = html.replace("url('fonts/", "url('/design-system/material-preview/fonts/")
        html = html.replace('src="assets/', 'src="/design-system/material-preview/assets/')
        html = html.replace('/design-system/material-preview/assets/moon-sticker.png', '/design-system/c-polish/assets/moon-alin-transparent.png')
        body_font = 'PreviewWenkai' if family=='wenkai' else 'PreviewSong'
        html = html.replace('</style>', CSS + f':root{{--preview-body:{body_font},serif}}</style>', 1)
        heading = '月光光' if state=='recent' else '童谣时光屋'
        badge = '<span class="resource-type">童谣</span>' if state=='recent' else ''
        label = '继续学习' if state=='recent' else '开始学习'
        action_role = 'music' if state=='recent' else 'learn'
        markup = f'<div class="material-copy">{badge}<h1 class="material-heading">{heading}</h1><a class="material-action" href="/design-system/material-preview/c-learn-first.html">{icon(action_role)}<span>{label}</span></a></div>'
        html = re.sub(r'<div class="material-copy">.*?</div>', lambda _:markup, html, count=1, flags=re.S)
        html = html.replace('href="c-home-', f'href="{family}-')
        (OUT/f'{family}-{state}.html').write_text(html,encoding='utf-8')

shell=(SOURCE/'index.html').read_text(encoding='utf-8').split('<main>')[0]
shell=shell.replace('<title>童谣时光屋文创视觉探索</title>', '<title>C 方案细化：文楷与宋体对比</title>')
shell=shell.replace('.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))', '.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))')
shell=shell.replace('main{max-width:1240px', 'main{max-width:820px')
html=shell+'''<main><h1>C 方案细化：文楷与宋体</h1><p>大标题保留马善政楷体，正文、标签、按钮和数据分别比较两种字体。月亮阿霖改为透明底，书本结构与继续学习按钮同步优化。</p><div class="controls"><select id="state" aria-label="学习状态"><option value="recent">最近学习</option><option value="first">首次使用</option></select><select id="size" aria-label="宽度"><option>375</option><option>320</option><option>430</option></select><button id="transparent">查看透明素材</button></div><div class="grid">'''
for family,name in [('wenkai','霞鹜文楷 TC'),('song','宋体')]:
    html+=f'<section><h2>{name}</h2><div class="frame"><iframe title="{name}" data-font="{family}" src="{family}-recent.html"></iframe></div></section>'
html+='''</div><p>预览中的“月光光”为展示记录。“童谣”为资源类型。宋体调用本机已安装字体，不打包分发字体文件。正式小程序未改。</p><dialog id="cutout"><form method="dialog"><button>关闭</button></form><p>透明背景素材</p><img src="assets/moon-alin-transparent.png" alt="透明背景月亮阿霖" style="max-width:80%;max-height:65vh"></dialog></main><script>const frames=[...document.querySelectorAll('iframe')];function update(){frames.forEach(f=>{f.src=f.dataset.font+'-'+document.querySelector('#state').value+'.html';f.style.width=document.querySelector('#size').value+'px'})}['state','size'].forEach(id=>document.getElementById(id).onchange=update);document.querySelector('#transparent').onclick=()=>document.querySelector('#cutout').showModal();</script></html>'''
(OUT/'index.html').write_text(html,encoding='utf-8')
print('Built four C home previews with typography comparison.')
