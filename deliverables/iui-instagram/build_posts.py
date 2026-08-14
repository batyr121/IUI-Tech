from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import textwrap

ROOT=Path(__file__).parent
ASSETS=ROOT/'assets'
OUT=ROOT/'posts'
OUT.mkdir(exist_ok=True)
W=H=1080
INK=(23,29,47); MUTED=(105,114,132); PURPLE=(101,88,211); BLUE=(44,167,214)
FONT='/Library/Fonts/SF-Pro-Display-Regular.otf'
BOLD='/Library/Fonts/SF-Pro-Display-Bold.otf'
if not Path(FONT).exists(): FONT='/System/Library/Fonts/SFNS.ttf'
if not Path(BOLD).exists(): BOLD=FONT

def font(size,bold=False): return ImageFont.truetype(BOLD if bold else FONT,size)
def gradient(a=(255,255,255),b=(242,244,255)):
    im=Image.new('RGB',(W,H)); p=im.load()
    for y in range(H):
        t=y/(H-1)
        for x in range(W):
            u=(x/W*.28+t*.72)
            p[x,y]=tuple(int(a[i]*(1-u)+b[i]*u) for i in range(3))
    return im
def cover(path,box):
    im=Image.open(path).convert('RGB'); x0,y0,x1,y1=box; bw,bh=x1-x0,y1-y0
    scale=max(bw/im.width,bh/im.height); im=im.resize((int(im.width*scale),int(im.height*scale)),Image.Resampling.LANCZOS)
    left=(im.width-bw)//2; top=(im.height-bh)//2
    return im.crop((left,top,left+bw,top+bh))
def rounded_photo(canvas,path,box,r=52):
    ph=cover(path,box); mask=Image.new('L',ph.size); ImageDraw.Draw(mask).rounded_rectangle((0,0,*ph.size),r,fill=255)
    canvas.paste(ph,(box[0],box[1]),mask)
def wrap(draw,text,xy,width,size,color=INK,bold=False,spacing=6):
    f=font(size,bold); words=text.split(); lines=[]; line=''
    for word in words:
        test=(line+' '+word).strip()
        if draw.textbbox((0,0),test,font=f)[2]<=width: line=test
        else: lines.append(line); line=word
    if line: lines.append(line)
    draw.multiline_text(xy,'\n'.join(lines),font=f,fill=color,spacing=spacing)
    return len(lines)*(size+spacing)
def brand(canvas,dark=False):
    logo=Image.open(ROOT.parent.parent/'public/brand/iui-neural-mark.png').convert('RGBA').resize((54,54),Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo,(58,48)); d=ImageDraw.Draw(canvas); c=(255,255,255) if dark else INK
    d.text((124,55),'IUI',font=font(26,True),fill=c); d.text((124,84),'TECHNOLOGY',font=font(10,True),fill=(210,215,230) if dark else MUTED)
def pill(d,xy,text):
    f=font(16,True); box=d.textbbox((0,0),text,font=f); w=box[2]+34
    d.rounded_rectangle((xy[0],xy[1],xy[0]+w,xy[1]+42),21,fill=(244,242,255)); d.text((xy[0]+17,xy[1]+11),text,font=f,fill=PURPLE)
def footer(d,num):
    d.text((58,1024),'iui.technology',font=font(16,True),fill=MUTED); d.text((975,1024),f'{num:02d}',font=font(16,True),fill=MUTED)
def save(im,n):
    p=OUT/f'iui-post-{n:02d}.png'; im.convert('RGB').save(p,quality=96); return p

posts=[]

# 1 — hero
im=gradient().convert('RGBA'); rounded_photo(im,ASSETS/'student.png',(420,78,1035,970),60); d=ImageDraw.Draw(im); brand(im); pill(d,(58,168),'NEUROLEARNING')
wrap(d,'Учёба становится понятнее.',(58,235),500,72,bold=True,spacing=2); wrap(d,'IUI видит не только ответ, но и процесс: внимание, вовлечённость и момент, когда ребёнку становится трудно.',(58,500),410,29,color=MUTED,spacing=10)
d.rounded_rectangle((58,790,350,862),25,fill=PURPLE); d.text((91,812),'Узнать точку старта →',font=font(22,True),fill='white'); footer(d,1); posts.append(save(im,1))

# 2 — metrics/product
im=gradient((255,255,255),(238,247,255)).convert('RGBA'); rounded_photo(im,ASSETS/'device.png',(58,480,1022,970),55); d=ImageDraw.Draw(im); brand(im); pill(d,(58,164),'ЧТО АНАЛИЗИРУЕТ IUI')
wrap(d,'Не просто результат. Причина.',(58,224),900,65,bold=True)
for i,(v,t) in enumerate([('01','Внимание'),('02','Вовлечённость'),('03','Утомление')]):
    x=58+i*322; d.rounded_rectangle((x,390,x+290,465),22,fill=(255,255,255,225),outline=(225,227,239),width=2); d.text((x+22,413),v,font=font(16,True),fill=PURPLE); d.text((x+72,409),t,font=font(22,True),fill=INK)
footer(d,2); posts.append(save(im,2))

# 3 — 7-day cycle
im=gradient((255,255,255),(246,242,255)).convert('RGBA'); d=ImageDraw.Draw(im); brand(im); pill(d,(58,164),'ПЕРСОНАЛЬНЫЙ МАРШРУТ'); wrap(d,'Одна диагностика. Семь дней роста.',(58,224),870,66,bold=True)
steps=[('1','Диагностика','Знания + EEG'),('2','Личный план','7–10 минут в день'),('3','Контроль','Новые задания + EEG'),('4','Отчёт','Понятно родителю')]
for i,(n,t,s) in enumerate(steps):
    x=58+(i%2)*492; y=470+(i//2)*210; d.rounded_rectangle((x,y,x+456,y+174),34,fill=(255,255,255),outline=(225,224,239),width=2)
    d.ellipse((x+28,y+35,x+94,y+101),fill=PURPLE if i<3 else BLUE); d.text((x+52,y+52),n,font=font(22,True),anchor='mm',fill='white'); d.text((x+120,y+39),t,font=font(28,True),fill=INK); d.text((x+120,y+83),s,font=font(20),fill=MUTED)
wrap(d,'Не сравниваем с другими. Сравниваем ребёнка с его собственной точкой старта.',(58,896),900,25,color=MUTED); footer(d,3); posts.append(save(im,3))

# 4 — parents
im=gradient((255,255,255),(243,247,255)).convert('RGBA'); rounded_photo(im,ASSETS/'parent.png',(58,385,1022,970),58); overlay=Image.new('RGBA',(W,H),(0,0,0,0)); od=ImageDraw.Draw(overlay); od.rounded_rectangle((58,385,1022,970),58,fill=(255,255,255,0)); im=Image.alpha_composite(im,overlay); d=ImageDraw.Draw(im); brand(im); pill(d,(58,164),'ДЛЯ РОДИТЕЛЕЙ')
wrap(d,'Меньше догадок. Больше ясности.',(58,224),940,63,bold=True); footer(d,4); posts.append(save(im,4))

# 5 — diagnostic format
im=gradient((255,255,255),(239,247,255)).convert('RGBA'); d=ImageDraw.Draw(im); brand(im); pill(d,(58,164),'ПЕРВАЯ ВСТРЕЧА'); wrap(d,'Как проходит IUI-диагностика?',(58,224),900,64,bold=True)
items=[('15 мин','Математика'),('10 мин','Логика'),('15 мин','Русский / қазақ тілі'),('EEG','Анализ внимания')]
for i,(a,b) in enumerate(items):
    y=430+i*125; d.rounded_rectangle((58,y,1022,y+98),28,fill=(255,255,255),outline=(225,228,239),width=2); d.text((88,y+29),a,font=font(27,True),fill=PURPLE); d.text((305,y+30),b,font=font(26,True),fill=INK); d.ellipse((952,y+34,982,y+64),fill=(222,247,242)); d.text((967,y+49),'✓',font=font(18,True),anchor='mm',fill=(40,145,112))
wrap(d,'Устройство предоставляем мы. Результат — персональный план развития ребёнка.',(58,938),900,23,color=MUTED); footer(d,5); posts.append(save(im,5))

# 6 — CTA
im=gradient((250,249,255),(225,247,255)).convert('RGBA'); device=cover(ASSETS/'device.png',(480,410,1022,970)); mask=Image.new('L',device.size); ImageDraw.Draw(mask).rounded_rectangle((0,0,*device.size),60,fill=255); im.paste(device,(480,410),mask); d=ImageDraw.Draw(im); brand(im); pill(d,(58,164),'ПОПРОБУЙТЕ IUI')
wrap(d,'Первая диагностика — бесплатно.',(58,232),880,72,bold=True,spacing=2); wrap(d,'Покажем сильные стороны, точки роста и соберём понятный план на неделю.',(58,485),420,31,color=MUTED,spacing=11)
d.rounded_rectangle((58,785,405,862),26,fill=PURPLE); d.text((92,809),'Записаться на диагностику',font=font(21,True),fill='white'); d.text((58,894),'40 минут · устройство предоставляется',font=font(18),fill=MUTED); footer(d,6); posts.append(save(im,6))

images=[Image.open(p).convert('RGB') for p in posts]
images[0].save(ROOT/'IUI_Instagram_Posts.pdf',save_all=True,append_images=images[1:],resolution=108.0,quality=95)
print('\n'.join(str(p) for p in posts)); print(ROOT/'IUI_Instagram_Posts.pdf')
