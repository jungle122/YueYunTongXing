"""依据装帧师公开图解，仅替换预览中的正面装订线。"""
from pathlib import Path
import re
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'design-system/binding-study'
OUT.mkdir(parents=True,exist_ok=True)
AUTHOR='https://blog.papercraftpanda.com/how-to-make-book-japanese-stab-binding-history-patterns-technique/'
GUILD='https://guildofbookworkers.org/sites/default/files/standards/2013_EricAlstrom.pdf'
PHOTO='https://boundbyhand.co.uk/blogs/news/make-japanese-stab-stitch-books'
PLANS=[('four','四眼订','Four-hole','Japanese-4-Hole-Binding-2'),('noble','康熙订','Noble / Kangxi','Japanese-Noble-Binding-2'),('tortoise','龟甲订','Tortoise-shell','Japanese-Tortoise-Shell-Binding-2'),('hemp','麻叶订','Hemp-leaf','Japanese-Hemp-Leaf-Binding-2')]

def trace(kind):
    holes=[(24,y) for y in [48,116,184,252]]
    # 纵线贯通四个主孔并绕过书头、书尾；横线逐孔绕到书脊背面。
    segments=[((24,0),(24,300))]+[((0,y),(24,y)) for _,y in holes]
    if kind in ['noble','hemp']:
        holes += [(12,24),(12,276)]
        segments += [((12,0),(12,24)),((0,24),(12,24)),((12,24),(24,48)),((24,252),(12,276)),((0,276),(12,276)),((12,276),(12,300))]
    if kind=='tortoise':
        for y in [48,116,184,252]:
            for offset in [-16,16]:
                holes.append((12,y+offset))
                segments += [((0,y+offset),(12,y+offset)),((12,y+offset),(24,y))]
    if kind=='hemp':
        for a,b in zip([48,116,184],[116,184,252]):
            mid=(a+b)/2
            holes.append((12,mid))
            segments += [((0,mid),(12,mid)),((12,mid),(24,a)),((12,mid),(24,b))]
    path=' '.join(f'M{x1:g} {y1:g}L{x2:g} {y2:g}' for (x1,y1),(x2,y2) in segments)
    dots=''.join(f'<circle class="binding-hole" cx="{x:g}" cy="{y:g}" r="1.8"/>' for x,y in holes)
    return f'<svg class="binding-cord" data-pattern="{kind}" viewBox="0 0 36 300" preserveAspectRatio="none" aria-hidden="true"><path d="{path}"/>{dots}</svg>',holes,segments

CSS='''
/* Hallmark: binding comparison only, source-backed visible front stitches. */
/* Critique: use perforations and edge wraps; omit unsupported continuous diagonals. */
.book-b .stitch-column{top:0;bottom:0}
.binding-cord{stroke-width:1.25}
.binding-cord .binding-hole{stroke-width:.5}
'''
records=[]
for kind,name,en,file in PLANS:
    svg,holes,segments=trace(kind)
    for state in ['first','recent']:
        html=(ROOT/f'design-system/b-refined/{state}.html').read_text(encoding='utf-8')
        html=html.replace('</style>',CSS+'</style>',1)
        html=re.sub(r'<svg class="binding-cord".*?</svg>',lambda _:svg,html,count=1,flags=re.S)
        (OUT/f'{kind}-{state}.html').write_text(html,encoding='utf-8')
    records.append({'id':kind,'name':name,'english':en,'diagram':f'https://blog.papercraftpanda.com/wp-content/uploads/2022/01/{file}-1024x1024.png','source':AUTHOR,'secondary':GUILD if kind=='noble' else PHOTO,'holes':holes,'segments':segments})

shell=(ROOT/'design-system/book-shapes/index.html').read_text(encoding='utf-8').split('<main>')[0]
shell=shell.replace('<title>三种书本造型预览</title>','<title>真实装订线参考对比</title>')
shell=shell.replace('max-width:1240px','max-width:1640px').replace('repeat(3,minmax(0,1fr))','repeat(4,minmax(0,1fr))')
shell=shell.replace('</style>','''
.closeup{height:224px;background:var(--bg);border:1px solid var(--line);margin:12px 0 20px;display:flex;justify-content:center;align-items:center}
.closeup svg{width:76px;height:200px;fill:none;stroke:var(--primary);stroke-width:1.25;overflow:visible}
.closeup .binding-hole{fill:var(--ink);stroke:var(--bg);stroke-width:.5}
.refs{display:flex;gap:12px;margin:12px 0;flex-wrap:wrap}.refs a{color:var(--primary)}
</style>''')
html=shell+'''<main><h1>按真实装订图解比较线迹</h1><p>上一版是自行绘制的示意，没有按真实针法复刻。本次保持书本、配色、字号及页面布局不变，只比较正面可见的孔位与走线。</p><div class="controls"><select id="state" aria-label="状态"><option value="recent">最近学习</option><option value="first">首次使用</option></select><select id="size" aria-label="宽度"><option>375</option><option>320</option><option>430</option></select><button id="zooms">隐藏线迹放大图</button></div><div class="grid">'''
for record in records:
    kind=record['id'];svg,_,_=trace(kind)
    html+=f'<section><h2>{record["name"]}</h2><p>{record["english"]}</p><div class="refs"><a href="{record["diagram"]}" target="_blank" rel="noopener">作者图解</a><a href="{record["secondary"]}" target="_blank" rel="noopener">补充参考</a></div><div class="closeup">{svg}</div><div class="frame"><iframe title="{record["name"]}" data-pattern="{kind}" src="{kind}-recent.html"></iframe></div></section>'
html+=f'''</div><p>线迹按 <a href="{AUTHOR}">Papercraftpanda 的图解</a>转绘；康熙订另核对 <a href="{GUILD}">Guild of Book Workers 的装帧师讲义</a>，实物参考来自 <a href="{PHOTO}">BOUND</a>。界面省略绕到背面的线段，不是完整穿针教程。正式页面未修改。</p></main><script>function update(){{document.querySelectorAll('iframe').forEach(f=>{{f.src=f.dataset.pattern+'-'+document.querySelector('#state').value+'.html';f.style.width=document.querySelector('#size').value+'px'}})}}['state','size'].forEach(id=>document.getElementById(id).onchange=update);let hidden=false;document.querySelector('#zooms').onclick=()=>{{hidden=!hidden;document.querySelectorAll('.closeup').forEach(el=>el.hidden=hidden);document.querySelector('#zooms').textContent=hidden?'显示线迹放大图':'隐藏线迹放大图'}};</script></html>'''
# hidden 属性应覆盖放大图容器的 flex 声明。
html=html.replace('</style>','.closeup[hidden]{display:none}</style>',1)
(OUT/'index.html').write_text(html,encoding='utf-8')
(OUT/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built four reference-based patterns in eight unchanged page layouts.')
