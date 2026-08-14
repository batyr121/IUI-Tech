from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT=Path(__file__).parent; ASSETS=ROOT/'assets'; POSTS=ROOT/'extra-posts'; STORIES=ROOT/'stories'; HIGHLIGHTS=ROOT/'highlights'; BRAND=ROOT/'brand'
for folder in (POSTS,STORIES,HIGHLIGHTS,BRAND): folder.mkdir(exist_ok=True)
INK=(23,29,47); MUTED=(100,110,130); PURPLE=(101,88,211); BLUE=(48,174,218); GREEN=(43,171,130); WHITE=(255,255,255)
REG='/Library/Fonts/SF-Pro-Display-Regular.otf'; BOLD='/Library/Fonts/SF-Pro-Display-Bold.otf'
def ft(n,b=False): return ImageFont.truetype(BOLD if b else REG,n)
def grad(size,one=(255,255,255),two=(239,243,255)):
    w,h=size; im=Image.new('RGB',size); px=im.load()
    for y in range(h):
        t=y/max(1,h-1)
        c=tuple(int(one[i]*(1-t)+two[i]*t) for i in range(3))
        for x in range(w): px[x,y]=c
    return im.convert('RGBA')
def fit(path,size):
    im=Image.open(path).convert('RGBA'); s=max(size[0]/im.width,size[1]/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.Resampling.LANCZOS)
    return im.crop(((im.width-size[0])//2,(im.height-size[1])//2,(im.width+size[0])//2,(im.height+size[1])//2))
def photo(im,path,box,r=48):
    p=fit(path,(box[2]-box[0],box[3]-box[1])); m=Image.new('L',p.size); ImageDraw.Draw(m).rounded_rectangle((0,0,p.width,p.height),r,fill=255); im.paste(p,(box[0],box[1]),m)
def logo(im,x=58,y=50,light=False,scale=1):
    mark=Image.open(ROOT.parent.parent/'public/brand/iui-neural-mark.png').convert('RGBA').resize((int(52*scale),int(52*scale)),Image.Resampling.LANCZOS); im.alpha_composite(mark,(x,y)); d=ImageDraw.Draw(im); c=WHITE if light else INK
    d.text((x+65*scale,y+4*scale),'IUI',font=ft(int(25*scale),True),fill=c); d.text((x+65*scale,y+33*scale),'TECHNOLOGY',font=ft(int(10*scale),True),fill=(220,225,240) if light else MUTED)
def wrapped(d,text,xy,width,size,color=INK,b=True,spacing=8):
    f=ft(size,b); lines=[]; line=''
    for word in text.split():
        candidate=(line+' '+word).strip()
        if d.textbbox((0,0),candidate,font=f)[2]<=width: line=candidate
        else: lines.append(line); line=word
    if line: lines.append(line)
    d.multiline_text(xy,'\n'.join(lines),font=f,fill=color,spacing=spacing)
    return len(lines)*(size+spacing)
def tag(d,text,x=58,y=160):
    f=ft(16,True); w=d.textbbox((0,0),text,font=f)[2]+34; d.rounded_rectangle((x,y,x+w,y+42),21,fill=(243,240,255)); d.text((x+17,y+11),text,font=f,fill=PURPLE)
def post_footer(d,n): d.text((58,1024),'iui.technology',font=ft(16,True),fill=MUTED); d.text((980,1024),f'{n:02}',font=ft(16,True),fill=MUTED)
def save_pdf(paths,target):
    ims=[Image.open(p).convert('RGB') for p in paths]; ims[0].save(target,save_all=True,append_images=ims[1:],resolution=108,quality=95)

# Six additional feed posts
feed=[]
def feed_canvas(): return grad((1080,1080))

im=feed_canvas(); d=ImageDraw.Draw(im); logo(im); tag(d,'ВАЖНЫЙ ВОПРОС'); wrapped(d,'«Он просто ленится?»',(58,230),870,72); wrapped(d,'Иногда за отказом стоит не лень, а слишком большой шаг, непонятная инструкция или усталость.',(58,465),860,31,MUTED,False,11)
d.rounded_rectangle((58,690,1022,905),42,fill=(255,255,255),outline=(226,226,238),width=2); d.text((95,730),'IUI помогает увидеть контекст',(95,730),font=ft(28,True),fill=INK) if False else None
d.text((95,728),'IUI помогает увидеть контекст',font=ft(28,True),fill=INK); d.text((95,785),'и подобрать следующий достижимый шаг.',font=ft(27),fill=PURPLE); post_footer(d,7); p=POSTS/'iui-post-07.png'; im.convert('RGB').save(p); feed.append(p)

im=feed_canvas(); photo(im,ASSETS/'teacher-story.png',(420,110,1022,970),58); d=ImageDraw.Draw(im); logo(im); tag(d,'ДЛЯ ПРЕПОДАВАТЕЛЯ'); wrapped(d,'Каждый ребёнок учится по-разному.',(58,230),470,64); wrapped(d,'Учитель видит отчёты, динамику и кому сегодня нужна поддержка.',(58,560),380,28,MUTED,False,9); post_footer(d,8); p=POSTS/'iui-post-08.png'; im.convert('RGB').save(p); feed.append(p)

im=feed_canvas(); d=ImageDraw.Draw(im); logo(im); tag(d,'ИТОГ ЦИКЛА'); wrapped(d,'Не одна цифра. 12 страниц о развитии ребёнка.',(58,225),930,66)
cards=[('01','Знания'),('02','EEG-контекст'),('03','Недельная практика'),('04','Рекомендации')]
for i,(n,t) in enumerate(cards):
    x=58+(i%2)*492; y=540+(i//2)*155; d.rounded_rectangle((x,y,x+456,y+125),30,fill=WHITE,outline=(226,227,239),width=2); d.text((x+28,y+37),n,font=ft(20,True),fill=PURPLE); d.text((x+90,y+34),t,font=ft(27,True),fill=INK)
post_footer(d,9); p=POSTS/'iui-post-09.png'; im.convert('RGB').save(p); feed.append(p)

im=feed_canvas(); d=ImageDraw.Draw(im); logo(im); tag(d,'ЧЕСТНО О ТЕХНОЛОГИИ'); wrapped(d,'IUI не ставит диагнозы.',(58,230),900,76); wrapped(d,'EEG используется только как образовательный контекст — вместе с ответами, сложностью задания и качеством сигнала.',(58,475),860,33,MUTED,False,12)
d.rounded_rectangle((58,760,1022,900),36,fill=(237,249,245)); d.text((92,803),'Цель — сделать обучение понятнее и бережнее.',font=ft(27,True),fill=(37,126,99)); post_footer(d,10); p=POSTS/'iui-post-10.png'; im.convert('RGB').save(p); feed.append(p)

im=feed_canvas(); d=ImageDraw.Draw(im); logo(im); tag(d,'ПРАВИЛЬНАЯ ДИНАМИКА'); wrapped(d,'Не сравниваем детей между собой.',(58,225),900,68); wrapped(d,'Смотрим, как меняются знания, самостоятельность и рабочий ритм самого ребёнка.',(58,450),790,32,MUTED,False,11)
for i,(v,l,c) in enumerate([('62%','точка старта',PURPLE),('74%','контроль',BLUE),('−18%','подсказок',GREEN)]):
    x=58+i*322; d.rounded_rectangle((x,700,x+292,885),35,fill=WHITE,outline=(225,227,238),width=2); d.text((x+26,735),v,font=ft(45,True),fill=c); d.text((x+26,810),l,font=ft(19),fill=MUTED)
post_footer(d,11); p=POSTS/'iui-post-11.png'; im.convert('RGB').save(p); feed.append(p)

im=feed_canvas(); photo(im,ASSETS/'student.png',(520,350,1022,970),55); d=ImageDraw.Draw(im); logo(im); tag(d,'IUI В ОДНОЙ ФРАЗЕ'); wrapped(d,'Понять. Поддержать. Развивать.',(58,225),900,72); wrapped(d,'Диагностика → личный план → контроль → понятный отчёт.',(58,525),420,31,MUTED,False,10); post_footer(d,12); p=POSTS/'iui-post-12.png'; im.convert('RGB').save(p); feed.append(p)
save_pdf(feed,ROOT/'IUI_Extra_Posts.pdf')

# Stories 1080 × 1920
story_files=[]
def story_base(photo_path=None):
    im=grad((1080,1920),(255,255,255),(236,243,255));
    if photo_path: photo(im,photo_path,(48,780,1032,1740),62)
    logo(im,58,68,scale=1.15); return im
stories=[
('Что мешает ребёнку учиться уверенно?','Проверим знания и внимание во время одной диагностики.','УЗНАТЬ ТОЧКУ СТАРТА',ASSETS/'student.png'),
('Что обычно сложнее?','Математика  ·  Логика  ·  Язык','ОТВЕТЬТЕ В ОПРОСЕ',None),
('40 минут, чтобы увидеть больше.','15 мин математика\n10 мин логика\n15 мин язык + EEG','УСТРОЙСТВО ДАЁМ МЫ',None),
('После диагностики ребёнок не остаётся с отчётом один.','IUI создаёт короткий персональный план на всю неделю.','7–10 МИНУТ В ДЕНЬ',ASSETS/'device.png'),
('Родителю — ясность.','Что получается · где возник барьер · как поддержать без давления.','ПОНЯТНЫЕ РЕКОМЕНДАЦИИ',ASSETS/'parent.png'),
('Учителю — приоритеты.','Кому нужна помощь сегодня и как меняется результат после практики.','ДАННЫЕ → ДЕЙСТВИЕ',ASSETS/'teacher-story.png'),
('В конце — 12-страничный отчёт.','Знания · EEG-контекст · динамика · план следующего цикла.','НЕ МЕДИЦИНСКИЙ ДИАГНОЗ',None),
('Первая диагностика — бесплатно.','Начните с понятной точки старта ребёнка.','ЗАПИСАТЬСЯ',ASSETS/'student.png')]
for i,(title,sub,cta,pic) in enumerate(stories,1):
    im=story_base(pic); d=ImageDraw.Draw(im); tag(d,f'STORY {i:02}',58,205); wrapped(d,title,(58,290),925,76,INK,True,7); wrapped(d,sub,(58,560 if len(title)<45 else 650),880,34,MUTED,False,13)
    if i==2:
        for j,label in enumerate(('Математика','Логика','Язык')):
            y=825+j*165; d.rounded_rectangle((58,y,1022,y+125),34,fill=WHITE,outline=(222,224,238),width=3); d.text((95,y+39),label,font=ft(29,True),fill=INK); d.ellipse((916,y+35,972,y+91),outline=PURPLE,width=4)
    if i==3:
        for j,(time,label) in enumerate((('15','Математика'),('10','Логика'),('15','Язык'))):
            x=58+j*322; d.rounded_rectangle((x,900,x+290,1085),38,fill=WHITE,outline=(223,225,238),width=3); d.text((x+28,935),time,font=ft(46,True),fill=PURPLE); d.text((x+28,1005),label,font=ft(21,True),fill=INK)
        d.rounded_rectangle((58,1130,1022,1310),38,fill=(241,239,255)); d.text((95,1170),'EEG идёт параллельно заданию',font=ft(31,True),fill=INK); d.text((95,1225),'без оценивания и сравнения с другими',font=ft(23),fill=MUTED)
    if i==7:
        for j in range(3):
            x=140+j*130; y=850-j*55; d.rounded_rectangle((x,y,x+520,y+650),42,fill=(255,255,255),outline=(220,222,236),width=3)
        d.text((230,930),'IUI LEARNING REPORT',font=ft(20,True),fill=PURPLE); d.text((230,1000),'12',font=ft(105,True),fill=INK); d.text((380,1055),'страниц',font=ft(30,True),fill=MUTED)
        for j,w in enumerate((510,430,470,350)): d.rounded_rectangle((230,1160+j*60,230+w,1178+j*60),9,fill=(224,222,244) if j%2==0 else (220,240,247))
    y=1765; d.rounded_rectangle((58,y,1022,y+92),30,fill=PURPLE); d.text((540,y+47),cta,font=ft(22,True),anchor='mm',fill=WHITE); d.text((58,1875),'iui.technology',font=ft(17,True),fill=MUTED)
    p=STORIES/f'iui-story-{i:02}.png'; im.convert('RGB').save(p); story_files.append(p)
save_pdf(story_files,ROOT/'IUI_Stories.pdf')

# Highlight covers 1080 × 1920
highlight_files=[]
highlights=[('Старт','01','Точка начала'),('Как это','02','Цикл IUI'),('EEG','∿','Контекст внимания'),('План','✓','7 дней'),('Отчёты','↗','Динамика'),('Родителям','♡','Поддержка'),('FAQ','?','Ответы')]
for i,(name,symbol,note) in enumerate(highlights):
    im=grad((1080,1920),(255,255,255),(239,237,255)); d=ImageDraw.Draw(im); logo(im,58,70,scale=1.1)
    d.ellipse((290,570,790,1070),fill=(255,255,255),outline=(216,212,246),width=5); d.ellipse((350,630,730,1010),fill=PURPLE if i%2==0 else BLUE); d.text((540,820),symbol,font=ft(125,True),anchor='mm',fill=WHITE)
    d.text((540,1195),name,font=ft(62,True),anchor='mm',fill=INK); d.text((540,1275),note,font=ft(27),anchor='mm',fill=MUTED); d.text((540,1815),'IUI TECHNOLOGY',font=ft(17,True),anchor='mm',fill=MUTED)
    p=HIGHLIGHTS/f'iui-highlight-{i+1:02}-{name.lower().replace(" ","-")}.png'; im.convert('RGB').save(p); highlight_files.append(p)
save_pdf(highlight_files,ROOT/'IUI_Highlights.pdf')

# Avatar and logo lockups
avatar=grad((1080,1080),(255,255,255),(238,242,255)); mark=Image.open(ROOT.parent.parent/'public/brand/iui-neural-mark.png').convert('RGBA').resize((650,650),Image.Resampling.LANCZOS); avatar.alpha_composite(mark,(215,175)); ImageDraw.Draw(avatar).text((540,910),'IUI TECHNOLOGY',font=ft(35,True),anchor='mm',fill=INK); avatar.convert('RGB').save(BRAND/'iui-avatar.png')
sheet=grad((1600,1000)); d=ImageDraw.Draw(sheet); d.text((90,70),'IUI Social identity',font=ft(54,True),fill=INK); d.text((90,145),'Основной знак · безопасное поле · цвета',font=ft(24),fill=MUTED)
mark2=Image.open(ROOT.parent.parent/'public/brand/iui-neural-mark.png').convert('RGBA').resize((360,360),Image.Resampling.LANCZOS); sheet.alpha_composite(mark2,(110,290)); d.text((530,360),'IUI',font=ft(110,True),fill=INK); d.text((535,490),'TECHNOLOGY',font=ft(31,True),fill=MUTED)
for x,c,name in [(90,PURPLE,'IUI Violet'),(450,BLUE,'Neuro Blue'),(810,INK,'Ink'),(1170,WHITE,'White')]:
    d.rounded_rectangle((x,760,x+270,900),32,fill=c,outline=(222,224,233),width=2); d.text((x+16,920),name,font=ft(19,True),fill=INK)
sheet.convert('RGB').save(BRAND/'iui-logo-social-guide.png')

def contact(paths,target,thumb):
    cols=3; rows=(len(paths)+cols-1)//cols; out=Image.new('RGB',(thumb[0]*cols,thumb[1]*rows),(235,237,243))
    for i,p in enumerate(paths): out.paste(fit(p,thumb),((i%cols)*thumb[0],(i//cols)*thumb[1]))
    out.save(target,quality=92)
contact(feed,ROOT/'extra-posts-preview.jpg',(360,360)); contact(story_files,ROOT/'stories-preview.jpg',(270,480)); contact(highlight_files,ROOT/'highlights-preview.jpg',(270,480))
print(f'{len(feed)} posts, {len(story_files)} stories, {len(highlight_files)} highlights built')
