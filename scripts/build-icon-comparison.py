"""从当前 WXML/WXSS 生成独立图标选型预览，不替换小程序图标。"""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'design-system/icon-comparison'
OUT.mkdir(parents=True, exist_ok=True)
FAMILIES = {'lucide': ('A / Lucide', '轻巧线性', 'https://lucide.dev/license'),
            'tabler': ('B / Tabler', '规整线性', 'https://github.com/tabler/tabler-icons/blob/main/LICENSE'),
            'phosphor': ('C / Phosphor', '柔和双色', 'https://github.com/phosphor-icons/core/blob/main/LICENSE')}

def read(name):
    return (ROOT / name).read_text(encoding='utf-8')

def css(source):
    source = re.sub(r'@import\s+[^;]+;', '', source)
    source = re.sub(r'(?<![\w-])page(?![\w-])', 'wx-page', source)
    return re.sub(r'(-?\d+(?:\.\d+)?)rpx', r'calc(\1 * var(--rpx))', source)

def icon(role, family, classes='', baseline=False):
    if baseline:
        return ''
    asset = OUT / f'assets/{family}/{role}.svg'
    if not asset.exists():
        raise FileNotFoundError(asset)
    svg = asset.read_text(encoding='utf-8')
    svg = re.sub(r'<\?xml[^>]*\?>|<!DOCTYPE[^>]*>', '', svg)
    svg = re.sub(r'<svg\b', lambda _: f'<svg class="candidate-icon {classes}" aria-hidden="true"', svg, count=1)
    # Phosphor 的黑色填充继承项目品牌色；形状与原库保持一致。
    svg = svg.replace('fill="#000000"', 'fill="currentColor"').replace('fill="#000"', 'fill="currentColor"')
    return svg

def content(page, family):
    s = read(f'pages/{page}/{page}.wxml')
    s = re.sub(r'<alin-3d\b.*?</alin-3d>', '', s, flags=re.S)
    s = re.sub(r'\s+(?:wx:[\w-]+|bind[\w-]*|catch[\w-]*|hover-[\w-]+|data-url)="[^"]*"', '', s)
    values = {'audioProgress':'31', 'textProgress':'100', 'audioProgressStyle':'width:31%', 'textProgressStyle':'width:100%',
              'stats.totalTimeValue':'2.6', 'stats.totalTimeUnit':'小时', 'stats.totalLearningDays':'11',
              'stats.currentStreak':'1', 'stats.totalFavorites':'10'}
    for kind,share,count,minutes in [('audio',30,19,6),('video',47,30,0),('article',23,15,150)]:
        for key,val in [('share || 0',share),('count',count),('minutes',minutes)]:
            values[f'stats.categoryStats.{kind}.{key}'] = str(val)
    def expr(m):
        key=m[1].strip()
        if key in values: return values[key]
        if 'recentLearning.title' in key: return '开启第一次粤语学习'
        if 'recentLearning.metaText' in key: return '从童谣、绘本和文化科普认识乡音'
        return ''
    s = re.sub(r'{{(.*?)}}', expr, s)
    s = re.sub(r'<text class="recent-label">.*?</text>', '', s)
    s = re.sub(r'<(/?)view\b',r'<\1div',s)
    s = re.sub(r'<(/?)text\b',r'<\1span',s)
    s = re.sub(r'<image\b([^>]*?)(?:/>|>\s*</image>)',r'<img\1>',s)
    s = s.replace('src="/static/', 'src="/static/')
    if family != 'current':
        if page == 'learn':
            for old,role in [('音频学习','music'),('文字科普','reading')]:
                s=re.sub(r'<img[^>]+src="/static/ui/learn/'+old+r'\.jpg"[^>]*>', '<div class="feature-symbol candidate-symbol">'+icon(role,family)+'</div>',s)
        if page == 'home':
            for name,role in [('learn','learn'),('games','games'),('original','original'),('profile','profile')]:
                s=re.sub(r'<img\s+class="entry-watermark"[^>]*src="/static/tabbar/'+name+r'-active.png"[^>]*>',icon(role,family,'entry-watermark'),s)
            s=re.sub(r'<img[^>]*class="extra-icon"[^>]*>', '<div class="extra-icon candidate-symbol">'+icon('community',family)+'</div>',s)
        if page == 'learning-stats':
            for glyph,role in [('◷','clock'),('☀','days'),('↗','streak'),('♥','favorite')]:
                s=s.replace('<span class="stat-symbol">'+glyph+'</span>','<span class="stat-symbol">'+icon(role,family)+'</span>')
            for glyph,role in [('🎵','music'),('🎬','video'),('📖','article')]:
                s=s.replace('>'+glyph+'</div>','>'+icon(role,family)+'</div>')
    return s

base_css=css(read('styles/theme.wxss')+read('app.wxss'))
extra='''*{animation:none!important;transition:none!important}html,body{margin:0;overflow-x:clip}body{--rpx:calc(100vw / 750);background:#fffdf5}wx-page{display:block}img{object-fit:contain}button{font-family:inherit}.candidate-icon{width:100%;height:100%;display:block;fill:none;color:var(--color-primary)}.candidate-icon[fill="currentColor"]{fill:currentColor}.candidate-icon.entry-watermark{width:calc(148 * var(--rpx));height:calc(148 * var(--rpx))}.candidate-symbol{padding:10px;box-sizing:border-box;border:0;background:var(--color-surface-soft)}.candidate-symbol .candidate-icon{width:100%;height:100%}.category-icon{background:var(--color-surface-soft)!important;padding:9px;box-sizing:border-box}.stat-symbol .candidate-icon{width:24px;height:24px}.native-title{font:16px 'Microsoft YaHei',sans-serif;text-align:center;padding:18px 0;background:#fffdf5;color:#49352d}.preview-tabbar{position:fixed;bottom:0;left:0;right:0;display:flex;padding:9px 0 15px;background:#fffdf5;border-top:1px solid #ead8bc;z-index:50}.preview-tabbar a{flex:1;text-align:center;text-decoration:none;font:11px 'Microsoft YaHei',sans-serif;color:#765f54}.preview-tabbar a.selected{color:#a94736}.preview-tabbar svg,.preview-tabbar img{display:block;width:26px;height:26px;margin:0 auto 5px;color:inherit}.preview-tabbar svg:not([fill]){fill:none}.native-title+wx-page{min-height:calc(100vh - 56px)}'''
tabs=[('home','首页'),('learn','学习'),('games','游戏'),('original','原创'),('profile','我的')]
titles={'home':'粤语童谣时光屋','learn':'学习天地','learning-stats':'学习统计'}
for family in [*FAMILIES,'current']:
    for page,title in titles.items():
        tab=''
        for role,label in tabs:
            active=role==page or (page=='learning-stats' and role=='profile')
            graphic=icon(role,family) if family!='current' else f'<img src="/static/tabbar/{role}{"-active" if active else ""}.png">'
            target=role if role in titles else 'home'
            tab+=f'<a class="{"selected" if active else ""}" href="{family}-{target}.html">{graphic}{label}</a>'
        page_css=css(read(f'pages/{page}/{page}.wxss'))
        (OUT/f'{family}-{page}.html').write_text(f'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{base_css}\n{page_css}\n{extra}</style><div class="native-title">{title}</div><wx-page>{content(page,family)}</wx-page><nav class="preview-tabbar">{tab}</nav></html>',encoding='utf-8')

index='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>童谣时光屋图标选型</title><meta name="description" content="在现有童谣时光屋界面中比较三套授权清楚的图标。"><style>
/* Hallmark: existing storybook system; scope: icon comparison; typography: preserved. */
/* Critique: compare complete families in separate page previews, preserve current layout. */
:root{--bg:#fffdf5;--ink:#49352d;--line:#ead8bc;--primary:#a94736;--font:'Microsoft YaHei',sans-serif}html,body{overflow-x:clip}body{margin:0;padding:24px;background:var(--bg);color:var(--ink);font:14px var(--font)}main{max-width:1240px;margin:auto}h1{font-size:24px;margin:0 0 12px}p{line-height:1.6}button,select,a{font:inherit;color:inherit}button,select{padding:8px 12px;border:1px solid var(--line);background:var(--bg);border-radius:8px}button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--primary)}h1,h2{text-wrap:balance}button:active{background:var(--line)}button:disabled{background:var(--line);color:var(--ink);cursor:not-allowed}.controls{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0 24px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}h2{font-size:18px;margin:0 0 8px}.frame{overflow:auto}iframe{width:375px;height:790px;border:1px solid var(--line);background:var(--bg)}.source{display:block;margin:8px 0 16px;color:var(--primary)}@media(max-width:900px){.grid{grid-template-columns:minmax(0,1fr)}}
</style><main><h1>为童谣时光屋选一套图标</h1><p>同一页面、同一字号、同一品牌色。预览取自当前 WXML 和 WXSS，数据仅用于展示，不是微信运行截图。</p><div class="controls"><select id="page" aria-label="预览页面"><option value="learn">学习天地</option><option value="home">首页故事书</option><option value="learning-stats">学习统计</option></select><select id="size" aria-label="屏幕宽度"><option>375</option><option>320</option><option>430</option></select><button id="baseline">对照当前图标</button></div><div class="grid">'''
for family,(title,tone,source) in FAMILIES.items():
    license_name='ISC（含 Lucide 上游说明）' if family=='lucide' else 'MIT'
    index+=f'<section><h2>{title}</h2><p>{tone}，{license_name}</p><a class="source" href="{source}" target="_blank" rel="noopener">官方授权</a><div class="frame"><iframe title="{title}" data-family="{family}" src="{family}-learn.html"></iframe></div></section>'
index+='''</div><p>推荐 C：柔和双色与故事书更贴近，图标和 Tab 栏仍属于同一套。A 更轻，B 更规整。选择后再替换小程序中的全部功能图标。</p></main><script>const frames=[...document.querySelectorAll('iframe')];let baseline=false;function update(){frames.forEach(f=>{f.src=(baseline?'current':f.dataset.family)+'-'+document.querySelector('#page').value+'.html';f.style.width=document.querySelector('#size').value+'px'})}document.querySelector('#page').onchange=update;document.querySelector('#size').onchange=update;document.querySelector('#baseline').onclick=()=>{baseline=!baseline;document.querySelector('#baseline').textContent=baseline?'返回候选方案':'对照当前图标';update()};</script></html>'''
(OUT/'index.html').write_text(index,encoding='utf-8')
print('Built 12 source-based page previews and interactive comparison.')

# C 方案细化：透明图标背景，并适度增加图标尺寸。仅写入独立预览。
refined_css = '''
.candidate-symbol { background: transparent; padding: 0; display: flex; align-items: center; justify-content: center; }
.candidate-symbol .candidate-icon { width: calc(60 * var(--rpx)); height: calc(60 * var(--rpx)); flex-shrink: 0; }
.category-icon { background: transparent !important; padding: 0; }
.category-icon .candidate-icon { width: calc(60 * var(--rpx)); height: calc(60 * var(--rpx)); }
.stat-symbol .candidate-icon { width: 26px; height: 26px; }
.preview-tabbar svg { width: 28px; height: 28px; }
'''
for page in titles:
    original = (OUT / f'phosphor-{page}.html').read_text(encoding='utf-8')
    refined = original.replace('</style>', refined_css + '</style>', 1)
    for target in titles:
        refined = refined.replace(f'href="phosphor-{target}.html"', f'href="c-refined-{target}.html"')
    (OUT / f'c-refined-{page}.html').write_text(refined, encoding='utf-8')

# 复用对比页外壳，将三列改为同一方案的三个真实页面布局。
head = index.split('<main>')[0]
refined_index = head + '''<main><h1>C 方案：大一点，轻一点</h1>
<p>入口图标放大到约 30px，Tab 图标为 28px。去掉图标外的浅色方块，保留双色图形、浅米黄底色及原有字号。</p>
<div class="controls"><select id="size" aria-label="屏幕宽度"><option>375</option><option>320</option><option>430</option></select><button id="before">对照调整前</button></div><div class="grid">'''
for page in ['learn', 'home', 'learning-stats']:
    refined_index += f'<section><h2>{titles[page]}</h2><div class="frame"><iframe title="{titles[page]}" data-page="{page}" src="c-refined-{page}.html"></iframe></div></section>'
refined_index += '''</div><p>本页是基于现有代码的浏览器预览，尚未替换小程序正式图标。</p></main>
<script>let before=false;const frames=[...document.querySelectorAll('iframe')];function update(){frames.forEach(f=>{f.src=(before?'phosphor-':'c-refined-')+f.dataset.page+'.html';f.style.width=document.querySelector('#size').value+'px'})}document.querySelector('#size').onchange=update;document.querySelector('#before').onclick=()=>{before=!before;document.querySelector('#before').textContent=before?'查看新版':'对照调整前';update()};</script></html>'''
(OUT / 'c-refined.html').write_text(refined_index, encoding='utf-8')
print('Built refined C preview with transparent backgrounds and larger icons.')
