"""Build one comparison template, preserving the approved shared navigation."""
from pathlib import Path
import re, json
p=Path(__file__).parent
old=(p/'before-collage.html').read_text(encoding='utf-8')
tail=old[old.index('<nav class="tabs"'):]
head='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>原创剧场素材拼贴预览</title><link rel="stylesheet" href="../paper-global/global-paper.css"><link rel="stylesheet" href="original.css"><link rel="stylesheet" href="collage.css"></head><body><script>const variant=new URLSearchParams(location.search).get('v');document.body.className='variant-'+(['a','b','c'].includes(variant)?variant:'a');</script><div class="app"><div class="nav-title">原创剧场</div><main><header class="page-heading"><h1>原创剧场</h1><span class="chapter">第三章</span></header><section class="works" aria-label="原创作品">
<button class="video-entry" data-open="video" aria-label="查看原创视频"><img class="film-source" src="assets/reference-film.png" alt=""><span class="video-copy"><span class="format">童谣影像</span><strong>原创视频</strong><span class="video-bottom"><span>氹氹转、月光光…</span><span class="play-round"><img src="../audio-player-preview/assets/regular/play.svg" alt=""></span></span></span></button>
<button class="book-entry" data-open="books" aria-label="查看绘本合集"><span class="entry-heading"><strong>绘本故事</strong><span class="book-action">查看绘本<img class="arrow" src="../article-reader/assets/arrow-right.svg" alt=""></span></span><span class="collage" aria-hidden="true">'''
pages=['dangdang/page3.jpg','moonlight/page3.jpg','look/page3.jpg','dangdang/page5.jpg','moonlight/page5.jpg','look/page5.jpg']
# Six interior pages from the three existing picture books.
tiles=''.join(f'<span class="tile"><img src="/static/picture-books/{s}" alt=""></span>' for s in pages)
body='''<img class="paper-clip" src="assets/reference-clip.png" alt=""></span></button>
<button class="manual-entry" data-open="manual"><span class="manual-art" aria-hidden="true"><img src="assets/reference-books.png" alt=""></span><span class="manual-copy"><strong>童谣课程手册</strong><span>课程设计与教学</span></span><img class="arrow" src="../article-reader/assets/arrow-right.svg" alt=""></button></section></main>'''
(p/'collage.html').write_text(head+tiles+body+tail,encoding='utf-8')
options=[('a','A 规整拼图','大小画面交错，薄纸托底'),('b','B 错落拼贴','不规则外轮廓，回形针连接'),('c','C 夹页便笺','蓝灰衬纸，内页夹成小册')]
gallery='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>原创剧场三套细节对比</title><link rel="stylesheet" href="gallery.css"></head><body><header><h1>原创剧场 / 三套细节方案</h1><div class="controls"><label>同屏尺寸 <select id="size"><option>320</option><option selected>390</option><option>430</option></select></label><button id="old">显示修改前</button></div><p>上方视频、中间绘本、下方手册。三套均可点击体验入口。</p></header><main class="gallery">'''
for key,title,desc in options:
 gallery+=f'<section><h2>{title}</h2><p>{desc}</p><a href="collage.html?v={key}" target="_blank">单独查看</a><iframe src="collage.html?v={key}" title="{title}"></iframe></section>'
gallery+='''<section id="before" hidden><h2>修改前</h2><p>保留上一版三段布局</p><a href="before-collage.html" target="_blank">单独查看</a><iframe src="before-collage.html" title="修改前"></iframe></section></main><footer><p>胶卷、书堆、回形针：你提供的参考图，经图像工具抠图及横向适配；原始出处和授权尚未核实，仅作当前原型比较。拼图使用项目内《氹氹转》《月光光》《齐齐望过去》的内页。</p><p>视频与绘本入口沿用本阶段的演示弹窗，手册保留加载和重试状态。</p></footer><script>document.querySelector('#size').onchange=e=>document.documentElement.style.setProperty('--screen',e.target.value+'px');document.querySelector('#old').onclick=e=>{const b=document.querySelector('#before');b.hidden=!b.hidden;e.target.textContent=b.hidden?'显示修改前':'隐藏修改前';if(!b.hidden)b.scrollIntoView({behavior:'smooth',block:'start'});};</script></body></html>'''
(p/'preview.html').write_text(gallery,encoding='utf-8')
progress=p.parent/'app-prototype/progress.json'
data=json.loads(progress.read_text(encoding='utf-8-sig'))
data['currentPreview']='../original-preview/preview.html'
data['currentStatus']='原创剧场三套素材拼贴细节方案待选择'
progress.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
