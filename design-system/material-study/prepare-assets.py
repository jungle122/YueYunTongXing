"""Deterministic cutouts of user-provided images; no generative image processing."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from collections import deque
import json

BASE=Path(__file__).parent
OUT=BASE/'assets';OUT.mkdir(parents=True,exist_ok=True)
TEMP=Path('C:/Users/14740/AppData/Local/Temp')
FILES={
 'science':'03cfe82d-7a16-469e-96af-01a27e87afe3',
 'tape-smoke':'dcc7d5b8-b120-4f2d-b465-c15ba5f1a854',
 'tape-clear':'1d4a12c3-fe23-48db-872e-20b06d202d9d',
 'tape-ivory':'f43c3b47-49ab-4ffd-b379-2f249ed97776',
 'tape-pink':'b10d1ec9-2aa0-40b4-b08d-312c9be15007',
 'paper-grid':'e3a5ade5-e7ca-4c8c-b500-3aa894a55c67',
 'paper-blue':'323064f1-b5e4-45ce-a086-d1c99f4a9fd8',
 'paper-kraft':'e9426bfa-c9ca-4eec-aa8c-0a46781a3348',
 'paper-clip':'7c56acb3-e962-4d81-8069-04c9dcfbecbc',
 'paper-ivory':'e1f0bde8-9388-457c-a32f-9164f4773cb1',
 'photo-stack':'3b048a1c-398d-4d32-a6d2-a32e6c2f233a',
 'paper-stars':'574dfc24-9e54-4d4e-a28c-036dacee1c08'}

def edge_connected(candidate):
 h,w=candidate.shape
 # Pillow flood fill efficiently selects only background connected to the canvas.
 padded=np.pad(candidate,1,constant_values=True)
 img=Image.fromarray(np.where(padded,255,0).astype('uint8')).copy()
 ImageDraw.floodfill(img,(0,0),128)
 return np.array(img)[1:-1,1:-1]==128

records=[]
for name,uid in FILES.items():
 if name in ['tape-smoke','paper-kraft','paper-stars']:continue
 src=TEMP/f'codex-clipboard-{uid}.png';im=Image.open(src).convert('RGBA');arr=np.array(im)
 rgb=arr[:,:,:3].astype(int)
 if name=='science':
  # Checkerboard consists of neutral gray/white pixels. Preserve textured book pixels.
  candidate=(rgb.max(2)-rgb.min(2)<=2)&(rgb.min(2)>=235)
  bg=edge_connected(candidate)
  arr[bg,3]=0
  # A few enclosed checkerboard gaps match the exact gray tile colour.
  exact=(rgb[:,:,0]==238)&(rgb[:,:,1]==238)&(rgb[:,:,2]==238)
  arr[exact,3]=0
 elif name in ['photo-stack','paper-stars']:
  bg=edge_connected((rgb.min(2)>242)&(rgb.max(2)-rgb.min(2)<10));arr[bg,3]=0
  if name=='photo-stack':
   # Remove the existing black photo, preserving its physical cream border.
   interior=Image.fromarray(np.where(rgb.max(2)<80,255,0).astype('uint8')).copy()
   ImageDraw.floodfill(interior,(600,450),128)
   arr[np.array(interior)==128,3]=0
 else:
  # Existing alpha is retained. Strip neutral baked-in checker pixels on edges only.
  neutral=(rgb.max(2)-rgb.min(2)<=2)&(rgb.min(2)>225)
  bg=edge_connected(neutral|(arr[:,:,3]==0))
  # Do not remove white plastic from tape photos; they already have correct alpha.
  if not name.startswith('tape'):arr[bg,3]=0
 im=Image.fromarray(arr)
 if name=='tape-ivory':im=im.transpose(Image.Transpose.ROTATE_90)
 if name in ['tape-clear','tape-pink']:im=im.transpose(Image.Transpose.ROTATE_270)
 if name=='science':
  # Remove isolated checkerboard fringe with a one-pixel alpha opening.
  im.putalpha(im.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)))
 if name!='photo-stack':
  box=im.getchannel('A').getbbox()
  if box:im=im.crop(box)
 im.save(OUT/(name+'.png'),optimize=True)
 records.append({'file':'assets/'+name+'.png','source':str(src),'method':'原图透明通道保留、连通背景去除、裁切；竖向磁带旋转 90 度。无生成或重绘。','license':'用户提供的原型参考，原始授权未核实'})
(BASE/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared',len(records),'source assets')
