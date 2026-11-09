"""顶部介绍与最近学习的三套独立预览，不改正式页面。"""
from pathlib import Path
import re
import runpy
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
icons = SimpleNamespace(**runpy.run_path(str(ROOT / 'scripts/build-icon-comparison.py')))

OUT = ROOT / 'design-system/header-comparison'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'design-system/icon-comparison'
NAMES = {'a': ('书页标题', '去掉外框，以留白和细线分层'),
         'b': ('书签题签', '窄书签标识章节，标题留在纸面上'),
         'c': ('目录栏', '章节与标题横向排列，入口更紧凑')}
TITLES = {'learn': ('第一章', '选一种喜欢的方式开始吧', 'intro-title'),
          'learning-stats': ('成长概览', '每一次学习都算数', 'growth-title')}
SHARED = '''
/* Hallmark: custom comparison within the existing storybook theme. */
/* Critique: change title composition only; keep confirmed icons and typography. */
.title-area{position:relative;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:calc(30 * var(--rpx)) calc(6 * var(--rpx));border:0;border-radius:0;background:transparent;box-shadow:none;box-sizing:border-box}
.title-area .area-kicker{display:block;align-self:flex-start;margin:0 0 calc(16 * var(--rpx));padding:0;border:0;border-radius:0;color:var(--color-primary);letter-spacing:0;font-weight:650}
.title-area .intro-title,.title-area .growth-title{width:100%;display:block;margin:0;overflow-wrap:break-word;line-height:1.4}
.title-area+.section-caption{margin-top:calc(24 * var(--rpx))}
.recent-card.resume-entry{width:100%;min-height:0;margin-top:calc(8 * var(--rpx));padding:calc(24 * var(--rpx)) calc(6 * var(--rpx));border:0;border-radius:0;background:transparent;box-shadow:none;gap:calc(20 * var(--rpx));overflow:visible}
.resume-entry .recent-copy{min-width:0;flex:1}
.resume-entry .recent-label{display:block;letter-spacing:0}
.resume-entry .recent-title,.resume-entry .recent-meta{display:block;white-space:normal;overflow:visible;overflow-wrap:break-word;text-overflow:clip}
.resume-icon{flex:0 0 auto;width:calc(60 * var(--rpx));height:calc(60 * var(--rpx));color:var(--color-primary)}
.resume-icon .candidate-icon{width:100%;height:100%}
.resume-chevron{color:var(--color-primary);font-size:28px;flex:0 0 auto}
.resume-entry:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px}
.home-page .storybook-heading{margin-top:calc(32 * var(--rpx))}
.design-a .title-area{padding-bottom:calc(30 * var(--rpx));border-bottom:1px solid var(--color-border)}
.design-a .resume-entry{border-bottom:1px solid var(--color-border);padding-bottom:calc(28 * var(--rpx))}
.design-b .title-area{padding:calc(28 * var(--rpx)) calc(8 * var(--rpx)) calc(30 * var(--rpx)) calc(92 * var(--rpx));min-height:calc(180 * var(--rpx))}
.design-b .area-kicker{position:absolute;left:calc(6 * var(--rpx));top:0;width:calc(58 * var(--rpx));min-height:calc(126 * var(--rpx));padding:calc(14 * var(--rpx)) calc(8 * var(--rpx)) calc(28 * var(--rpx));box-sizing:border-box;writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;letter-spacing:calc(4 * var(--rpx));color:var(--color-surface);background:var(--color-primary);clip-path:polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)}
.design-b .resume-entry{padding-left:calc(92 * var(--rpx));position:relative;min-height:calc(170 * var(--rpx))}
.design-b .resume-icon{position:absolute;left:calc(6 * var(--rpx));top:0;width:calc(58 * var(--rpx));height:calc(130 * var(--rpx));padding:calc(14 * var(--rpx)) calc(9 * var(--rpx)) calc(30 * var(--rpx));box-sizing:border-box;background:var(--color-primary);clip-path:polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)}
.design-b .resume-icon .candidate-icon{color:var(--color-surface)}
.design-c .title-area{display:grid;grid-template-columns:calc(96 * var(--rpx)) minmax(0,1fr);align-items:center;padding:calc(24 * var(--rpx)) 0;gap:calc(24 * var(--rpx));border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border)}
.design-c .area-kicker{margin:0;align-self:center;line-height:1.6;color:var(--color-text-secondary)}
.design-c .title-area .intro-title,.design-c .title-area .growth-title{padding-left:calc(24 * var(--rpx));border-left:1px solid var(--color-border);box-sizing:border-box}
.design-c .resume-entry{display:grid;grid-template-columns:calc(96 * var(--rpx)) minmax(0,1fr) auto;gap:calc(24 * var(--rpx));padding:calc(24 * var(--rpx)) 0;border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border)}
.design-c .resume-icon{display:none}
.design-c .resume-label-column{color:var(--color-text-secondary);font-size:calc(21 * var(--rpx));line-height:1.6}
.design-c .resume-entry .recent-copy{padding-left:calc(24 * var(--rpx));border-left:1px solid var(--color-border)}
.design-c .resume-entry .recent-label{display:none}
.design-a .resume-label-column,.design-b .resume-label-column{display:none}
.design-a .resume-entry{min-height:calc(216 * var(--rpx));padding:calc(40 * var(--rpx)) calc(12 * var(--rpx));gap:calc(28 * var(--rpx));text-decoration:none;color:inherit}
.design-a .resume-entry .recent-title{line-height:1.5}
.design-a .resume-action{color:var(--color-primary);font-size:calc(21 * var(--rpx));font-weight:750;white-space:nowrap;flex-shrink:0}
'''

for variant in NAMES:
    for page in ['learn', 'home', 'learning-stats']:
        for state in ['first', 'recent']:
            source = (SOURCE / f'c-refined-{page}.html').read_text(encoding='utf-8')
            source = source.replace('<wx-page>', f'<wx-page class="design-{variant}">')
            source = source.replace('</style>', SHARED + '</style>', 1)
            if page in TITLES:
                label, title, title_class = TITLES[page]
                label_class = 'chapter-seal' if page == 'learn' else 'growth-kicker'
                header = f'<div class="title-area"><span class="area-kicker {label_class}">{label}</span><span class="{title_class}">{title}</span></div>'
                if page == 'learn':
                    source = re.sub(r'<div class="page-intro learn-hero">.*?</div>', lambda _: header, source, count=1, flags=re.S)
                else:
                    source = re.sub(r'<div class="growth-overview">.*?<span class="growth-mark"[^>]*>.*?</span>\s*</div>', lambda _: header, source, count=1, flags=re.S)
            else:
                label = '最近学习' if state == 'recent' else '从这里开始'
                title = '月光光' if state == 'recent' else '开启第一次粤语学习'
                meta = '音频学习，已听 3 分钟' if state == 'recent' else '从童谣、绘本和文化科普认识乡音'
                header = f'<div class="recent-card resume-entry"><span class="resume-icon">{icons.icon("learn", "phosphor")}</span><span class="resume-label-column">{label}</span><div class="recent-copy"><span class="recent-label">{label}</span><span class="recent-title">{title}</span><span class="recent-meta">{meta}</span></div><span class="resume-chevron" aria-hidden="true">›</span></div>'
                source = re.sub(r'<div\s+class="recent-card".*?(?=<div class="storybook-heading">)', lambda _: header, source, count=1, flags=re.S)
                if variant == 'a':
                    title = '月光光' if state == 'recent' else '开始学习'
                    action = '<span class="resume-action">继续学习</span>' if state == 'recent' else ''
                    tag = 'div' if state == 'recent' else 'a'
                    link = '' if state == 'recent' else ' href="a-learn-first.html"'
                    minimal = f'<{tag} class="recent-card resume-entry"{link}><span class="resume-icon">{icons.icon("learn", "phosphor")}</span><div class="recent-copy"><span class="recent-title">{title}</span></div>{action}<span class="resume-chevron" aria-hidden="true">›</span></{tag}>'
                    source = re.sub(r'<div class="recent-card resume-entry">.*?(?=<div class="storybook-heading">)', lambda _: minimal, source, count=1, flags=re.S)
                    source = re.sub(r'<div class="storybook-heading">.*?</div>', '', source, count=1, flags=re.S)
            for target in ['learn', 'home', 'learning-stats']:
                source = source.replace(f'href="c-refined-{target}.html"', f'href="{variant}-{target}-{state}.html"')
            (OUT / f'{variant}-{page}-{state}.html').write_text(source, encoding='utf-8')

shell = (SOURCE / 'c-refined.html').read_text(encoding='utf-8').split('<main>')[0]
shell = shell.replace('<title>童谣时光屋图标选型</title>', '<title>时光屋顶部布局对比</title>')
index = shell + '''<main><h1>顶部布局，三种书页形式</h1><p>保留已确认的 C 图标、浅米黄背景和现有字号。先比较布局，正式页面保持不变。</p>
<div class="controls"><select id="page" aria-label="页面"><option value="learn">学习天地</option><option value="home">首页</option><option value="learning-stats">学习统计</option></select><select id="state" aria-label="最近学习状态"><option value="first">首次使用</option><option value="recent">有学习记录</option></select><select id="size" aria-label="预览宽度"><option>375</option><option>320</option><option>430</option></select></div><div class="grid">'''
for key, (name, description) in NAMES.items():
    index += f'<section><h2>{key.upper()} / {name}</h2><p>{description}</p><div class="frame"><iframe title="{name}" data-variant="{key}" src="{key}-learn-first.html"></iframe></div></section>'
index += '''</div><p>建议优先看 A：顶部更轻，书本主体更突出；B 的书签感更强；C 更紧凑。首页展示数据仅用于预览，未连接真实学习记录。</p></main>
<script>const frames=[...document.querySelectorAll('iframe')];function update(){const p=document.querySelector('#page').value,s=document.querySelector('#state').value;document.querySelector('#state').disabled=p!=='home';frames.forEach(f=>{f.src=f.dataset.variant+'-'+p+'-'+s+'.html';f.style.width=document.querySelector('#size').value+'px'})}['page','state','size'].forEach(id=>document.getElementById(id).onchange=update);update();</script></html>'''
(OUT / 'index.html').write_text(index, encoding='utf-8')
print('Built 18 header previews, including both recent-learning states.')

selected = shell.replace('<title>时光屋顶部布局对比</title>', '<title>A 方案首页精简预览</title>')
selected += '''<main><h1>A 方案：首页入口精简</h1><p>入口加大，只保留必要操作文字；去掉书本上方标题。字号、C 图标和浅米黄背景保持不变。</p><div class="controls"><select id="size" aria-label="预览宽度"><option>375</option><option>320</option><option>430</option></select></div><div class="grid">'''
for page, state, title in [('home', 'first', '首次使用'), ('home', 'recent', '有学习记录'), ('learn', 'first', 'A 方案学习页')]:
    selected += f'<section><h2>{title}</h2><div class="frame"><iframe title="{title}" src="a-{page}-{state}.html"></iframe></div></section>'
selected += '''</div><p>仅为浏览器预览，学习记录是展示样例，正式页面未改动。</p></main><script>document.querySelector('#size').onchange=()=>document.querySelectorAll('iframe').forEach(f=>f.style.width=document.querySelector('#size').value+'px');</script></html>'''
(OUT / 'a-refined.html').write_text(selected, encoding='utf-8')
