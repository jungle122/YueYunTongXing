"""Hand-traced alpha mask only; all artwork RGB pixels remain from the source."""
from pathlib import Path
from PIL import Image, ImageDraw
p=Path(__file__).parent
src=Path('C:/Users/14740/AppData/Local/Temp/codex-clipboard-03cfe82d-7a16-469e-96af-01a27e87afe3.png')
im=Image.open(src).convert('RGBA')
contours=[
 # Book silhouette, including page edges and the blue cover.
 [(45,635),(67,630),(62,610),(84,599),(133,561),(120,548),(125,535),(145,516),(168,501),(191,489),(225,462),(267,432),(302,402),(337,381),(378,352),(405,362),(473,384),(528,408),(573,433),(602,465),(621,492),(649,537),(697,522),(749,505),(793,500),(853,501),(903,505),(942,510),(924,521),(910,534),(880,549),(851,568),(871,583),(898,596),(930,608),(932,622),(920,633),(933,641),(922,655),(931,669),(956,693),(699,879),(656,860),(614,844),(572,831),(523,816),(468,805),(423,799),(391,802),(354,817),(331,811),(305,784),(283,757),(251,730),(214,709),(168,690),(125,676),(87,662),(54,665),(48,653)],
 # Pencil: retain the original paper stripes and tip.
 [(96,317),(125,292),(151,313),(177,339),(207,365),(235,396),(263,431),(282,452),(265,475),(229,466),(203,436),(176,409),(150,380),(126,352),(106,335)],
 [(278,477),(298,468),(314,502),(283,498)],
 # Light bulb (its base overlaps the book and is already included there).
 [(379,336),(382,309),(395,282),(415,262),(442,246),(475,234),(507,235),(535,244),(557,259),(589,283),(596,313),(602,349),(600,371),(592,393),(583,413),(570,432),(548,438),(493,444),(451,433),(420,422),(405,409),(392,387),(383,363)],
 # Three detached paper rays.
 [(477,128),(497,127),(495,163),(490,196),(484,187),(481,165)],
 [(314,219),(329,198),(345,218),(370,249),(366,258),(341,242)],
 [(611,249),(626,227),(638,205),(648,210),(648,224),(632,235)]
]
scale=4;mask=Image.new('L',(im.width*scale,im.height*scale));d=ImageDraw.Draw(mask)
for poly in contours:d.polygon([(x*scale,y*scale) for x,y in poly],fill=255)
mask=mask.resize(im.size,Image.Resampling.LANCZOS)
im.putalpha(mask);im=im.crop(mask.getbbox());im.save(p/'assets/science-refined.png',optimize=True)
print('Clean alpha silhouette:',im.size)
