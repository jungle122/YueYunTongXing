"""用项目原素材和授权字体制作独立视觉方案，正式页面保持不变。"""
from pathlib import Path
import re
import json
import hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'design-system/material-preview'
SOURCE = ROOT / 'design-system/icon-comparison'
FONTS = OUT / 'fonts'
for font in FONTS.glob('*.woff2'):
    if font.read_bytes()[:4] == b'\x00\x01\x00\x00':
        font.rename(font.with_suffix('.ttf'))

PLANS = {'a': ('3D 陪读', '霞鹜文楷 TC', 'wenkai'),
         'b': ('板绘绘本', '站酷小薇体', 'xiaowei'),
         'c': ('岭南书卷', '马善政楷体', 'brush')}
COMMON = '''
/* Hallmark: custom storybook material exploration; source: user artwork; shape: app screen. */
/* Critique: artwork participates in the entry; keep functional icons within Phosphor. */
@font-face{font-family:PreviewBody;src:url('fonts/body.ttf') format('truetype');font-display:swap}
@font-face{font-family:PreviewWenkai;src:url('fonts/wenkai.ttf') format('truetype');font-display:swap}
@font-face{font-family:PreviewXiaowei;src:url('fonts/xiaowei.ttf') format('truetype');font-display:swap}
@font-face{font-family:PreviewBrush;src:url('fonts/brush.ttf') format('truetype');font-display:swap}
:root{--preview-body:PreviewBody,sans-serif;--preview-a:PreviewWenkai,serif;--preview-b:PreviewXiaowei,serif;--preview-c:PreviewBrush,serif;--preview-shadow:rgba(73,53,45,.12);--preview-clear:transparent}
wx-page,.native-title,.preview-tabbar a,button{font-family:var(--preview-body)}
.plan-a{--preview-heading:var(--preview-a)}.plan-b{--preview-heading:var(--preview-b)}.plan-c{--preview-heading:var(--preview-c)}
.material-heading,.entry-title,.feature-title{font-family:var(--preview-heading);font-weight:400}
.home-page{padding-top:calc(12 * var(--rpx))}
.sky-decoration,.closing-note{display:none}
.material-scene{position:relative;min-height:calc(324 * var(--rpx));display:flex;align-items:center;box-sizing:border-box;margin:calc(12 * var(--rpx)) 0 calc(24 * var(--rpx));padding:calc(32 * var(--rpx)) calc(12 * var(--rpx));gap:calc(12 * var(--rpx))}
.material-copy{position:relative;z-index:2;min-width:0;flex:1}
.material-heading{display:block;margin:0 0 calc(24 * var(--rpx));font-size:calc(48 * var(--rpx));line-height:1.45;color:var(--color-text);overflow-wrap:break-word}
.material-action{display:inline-flex;align-items:center;justify-content:center;min-height:calc(86 * var(--rpx));padding:calc(12 * var(--rpx)) calc(34 * var(--rpx));border:0;border-radius:calc(16 * var(--rpx));background:var(--color-primary);color:var(--color-white);text-decoration:none;font-size:calc(28 * var(--rpx));line-height:1.6;box-sizing:border-box}
.material-action:active{background:var(--color-primary-pressed)}
.material-action:focus-visible,.feature-card:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px}
.material-art{position:relative;flex:0 0 43%;height:calc(320 * var(--rpx));object-fit:contain;min-width:0}
.material-scene .float-art{animation:material-float 3.4s ease-in-out infinite}
@keyframes material-float{50%{transform:translateY(-5px)}}
@media(prefers-reduced-motion:reduce){.material-scene .float-art{animation:none}}
.entry-title{font-size:calc(34 * var(--rpx));line-height:1.4}.entry-description{font-family:var(--preview-body);font-size:calc(22 * var(--rpx));line-height:1.6}
.extra-title,.feature-description{font-family:var(--preview-body)}
.book-stage{margin-top:calc(12 * var(--rpx))}.book-entry{padding-top:calc(32 * var(--rpx))}
.feature-title{font-size:calc(36 * var(--rpx))}.feature-description{font-size:calc(26 * var(--rpx));line-height:1.6}
.section-caption{font-family:var(--preview-heading);font-size:calc(32 * var(--rpx));letter-spacing:0}
.plan-a .material-art{height:calc(380 * var(--rpx));filter:drop-shadow(0 10px 10px var(--preview-shadow))}
.material-learn-header{position:relative;margin-bottom:calc(28 * var(--rpx));padding:calc(28 * var(--rpx)) calc(4 * var(--rpx)) 0}
.material-learn-header .material-heading{margin-bottom:calc(12 * var(--rpx))}
.landmark-crop{position:relative;height:calc(100 * var(--rpx));overflow:clip;mix-blend-mode:multiply}
.landmark-crop img{position:absolute;bottom:0;width:100%;height:auto}
.plan-b .material-scene{min-height:calc(320 * var(--rpx));border-bottom:1px solid var(--color-border)}
.plan-b .material-art{flex-basis:45%;height:calc(270 * var(--rpx));object-fit:contain}
.plan-b .material-heading{font-size:calc(50 * var(--rpx))}
.plan-b .book-entry{background:var(--preview-clear);border:0;border-bottom:1px solid var(--color-border);border-radius:0}
.scene-illustration{display:block;width:100%;height:calc(360 * var(--rpx));object-fit:contain;border-radius:calc(8 * var(--rpx));margin:0}
.plan-b .material-learn-header{padding-top:calc(16 * var(--rpx));display:grid;grid-template-columns:minmax(0,1fr) 48%;gap:calc(16 * var(--rpx));align-items:center}
.plan-c .material-scene{flex-direction:row-reverse;gap:calc(24 * var(--rpx));min-height:calc(320 * var(--rpx));border-bottom:1px solid var(--color-border)}
.plan-c .material-art{height:calc(280 * var(--rpx));flex-basis:45%;mix-blend-mode:multiply}
.plan-c .material-heading{font-size:calc(54 * var(--rpx))}
.plan-c .material-action{background:var(--preview-clear);border:1px solid var(--color-primary);color:var(--color-primary)}
.plan-c .material-action:active{background:var(--color-primary-soft)}
.fan-header{display:grid;grid-template-columns:minmax(0,1fr) 42%;align-items:center;gap:calc(12 * var(--rpx));min-height:calc(260 * var(--rpx));border-bottom:1px solid var(--color-border)}
.fan-header img{width:100%;height:auto;mix-blend-mode:multiply}
.plan-c .fan-header .material-heading{font-size:calc(54 * var(--rpx))}
.preview-tabbar a{font-family:var(--preview-body)}
'''

for key in PLANS:
    for page in ['home', 'learn']:
        for state in ['first', 'recent']:
            html = (SOURCE / f'c-refined-{page}.html').read_text(encoding='utf-8')
            html = html.replace('<wx-page>', f'<wx-page class="plan-{key}">')
            html = html.replace('</style>', COMMON + '</style>', 1)
            heading = '阿霖陪你<br>翻开童谣书' if key == 'a' else '声音里的<br>小故事' if key == 'b' else '童谣时光屋'
            if state == 'recent':
                heading = '月光光'
            action = '继续学习' if state == 'recent' else '开始学习'
            if page == 'home':
                art = {'a':'alin-3d.png','b':'sketch-character.png','c':'moon-sticker.png'}[key]
                float_class = ' float-art' if key == 'a' else ''
                entry = f'<section class="material-scene"><div class="material-copy"><h1 class="material-heading">{heading}</h1><a class="material-action" href="{key}-learn-{state}.html">{action}</a></div><img class="material-art{float_class}" src="assets/{art}" alt="阿霖角色素材"></section>'
                html = re.sub(r'<div\s+class="recent-card".*?(?=<div class="storybook-heading">)', lambda _:entry, html, count=1, flags=re.S)
                html = re.sub(r'<div class="storybook-heading">.*?</div>', '', html, count=1, flags=re.S)
            else:
                if key == 'a':
                    header = '<header class="material-learn-header"><h1 class="material-heading">学习天地</h1><div class="landmark-crop"><img src="assets/notebook-divider.png" alt="笔记本分隔页中的岭南建筑纹样"></div></header>'
                elif key == 'b':
                    header = '<header class="material-learn-header"><h1 class="material-heading">学习天地</h1><img class="scene-illustration" src="assets/umbrella-story.png" alt="尾巴伞童谣场景插画"></header>'
                else:
                    header = '<header class="material-learn-header fan-header"><h1 class="material-heading">学习天地</h1><img src="assets/music-fan.png" alt="圆形扇面中的听歌阿霖"></header>'
                html = re.sub(r'<div class="page-intro learn-hero">.*?</div>', lambda _:header, html, count=1, flags=re.S)
            for target in ['home','learn','learning-stats']:
                html = html.replace(f'href="c-refined-{target}.html"', f'href="{key}-{"learn" if target == "learning-stats" else target}-{state}.html"')
            (OUT/f'{key}-{page}-{state}.html').write_text(html, encoding='utf-8')

shell=(SOURCE/'c-refined.html').read_text(encoding='utf-8').split('<main>')[0]
shell=shell.replace('<title>童谣时光屋图标选型</title>','<title>童谣时光屋文创视觉探索</title>')
index=shell+'''<main><h1>让文创走进童谣时光屋</h1><p>三套真实素材方案，均保留书本、浅米黄背景和已确认的 C 图标。正文统一试用思源黑体简体，标题分别比较三种开源字体。</p><div class="controls"><select id="page" aria-label="页面"><option value="home">首页</option><option value="learn">学习天地</option></select><select id="state" aria-label="状态"><option value="first">首次使用</option><option value="recent">有学习记录</option></select><select id="size" aria-label="宽度"><option>375</option><option>320</option><option>430</option></select><button id="motion">暂停角色动效</button></div><div class="grid">'''
for key,(name,font,_) in PLANS.items():
    index+=f'<section><h2>{key.upper()} / {name}</h2><p>标题：{font}</p><div class="frame"><iframe title="{name}" data-plan="{key}" src="{key}-home-first.html"></iframe></div></section>'
index+='''</div><p>素材来自你提供的文创目录，字体均为 SIL OFL 1.1。仅作浏览器预览，未改正式页面。<a href="materials.html">查看素材、字体及后续页面用法</a></p></main><script>const frames=[...document.querySelectorAll('iframe')];function update(){frames.forEach(f=>{f.src=f.dataset.plan+'-'+document.querySelector('#page').value+'-'+document.querySelector('#state').value+'.html';f.style.width=document.querySelector('#size').value+'px'})}['page','state','size'].forEach(id=>document.querySelector('#'+id).onchange=update);let pause=false;document.querySelector('#motion').onclick=()=>{pause=!pause;frames.forEach(f=>f.contentDocument.querySelectorAll('.float-art').forEach(el=>el.style.animationPlayState=pause?'paused':'running'));document.querySelector('#motion').textContent=pause?'播放角色动效':'暂停角色动效'};</script></html>'''
(OUT/'index.html').write_text(index,encoding='utf-8')

details=shell+'''<main><h1>素材与字体</h1><p><a href="index.html">返回预览</a></p><h2>A / 3D 陪读</h2><p>首页使用项目已有 static/ui/alin.png，以原有轻微上下浮动参与入口布局。学习页提取“周边——笔记本分隔页.png”下方的岭南建筑纹样。标题使用霞鹜文楷 TC。</p><h2>B / 板绘绘本</h2><p>首页使用“ip形象板绘风 (1).png”透明角色。学习页使用“插画4——尾巴伞.png”进行 CSS 取景。后续可用舞狮、龙舟、粤剧插画对应游戏与原创内容。标题使用站酷小薇体。</p><h2>C / 岭南书卷</h2><p>首页使用“周边——冰箱贴3 (2).png”的月亮与童谣角色，学习页使用“周边——圆形扇面.png”的听歌姿态。白色素材底通过混合模式融入米黄色纸面，源文件不变。标题使用马善政楷体。</p><h2>全局延续</h2><p>正文统一试用 Noto Sans SC（思源黑体简体）。标题字体用于章节、内容入口，正文用于说明、按钮和数据。角色与插画不替代功能图标，功能图标继续使用 Phosphor 双色。游戏页可用舞狮与龙舟，原创页用粤剧和故事场景，个人成长页用笔记本纹样，错误与空状态使用表情素材。</p><h2>字体来源</h2><p>以下字体均已下载对应的 SIL Open Font License 1.1，授权文件随预览保存。预览使用按展示文字生成的字体子集，正式接入时再按全量字符规划体积与加载。</p><ul>'''
for key,family,folder in [('wenkai','LXGW WenKai TC','lxgwwenkaitc'),('xiaowei','ZCOOL XiaoWei','zcoolxiaowei'),('brush','Ma Shan Zheng','mashanzheng'),('body','Noto Sans SC','notosanssc')]:
    details+=f'<li>{family}：<a href="https://github.com/google/fonts/blob/main/ofl/{folder}/OFL.txt">官方授权</a> / <a href="fonts/{key}-OFL.txt">本地许可证</a></li>'
details+='</ul><p>文创素材来自用户指定目录；未将其来源等同于对第三方公开授权的认定。图片原文件和原有标识保留，布局取景由 CSS 完成。</p></main></html>'
(OUT/'materials.html').write_text(details,encoding='utf-8')
inventory=json.loads((OUT/'inventory.json').read_text(encoding='utf-8-sig'))
records=[]
for id,name in [(3,'umbrella-story.png'),(14,'notebook-divider.png'),(18,'moon-sticker.png'),(28,'music-fan.png'),(37,'sketch-character.png')]:
    records.append({'source':inventory[id]['path'],'preview':f'assets/{name}','sha256':hashlib.sha256((OUT/'assets'/name).read_bytes()).hexdigest()})
records.append({'source':str(ROOT/'static/ui/alin.png'),'preview':'assets/alin-3d.png','sha256':hashlib.sha256((OUT/'assets/alin-3d.png').read_bytes()).hexdigest()})
(OUT/'used-materials.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built 12 material-based page previews and source/font details.')
