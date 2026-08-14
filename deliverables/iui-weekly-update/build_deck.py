from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT=Path(__file__).parent
ROOT.mkdir(parents=True,exist_ok=True)
SLIDES=ROOT/'slides'; SLIDES.mkdir(exist_ok=True)
PROJECT=ROOT.parent.parent
W,H=1600,900
INK=(22,29,47); MUTED=(103,113,132); PURPLE=(102,88,214); BLUE=(50,173,218); GREEN=(44,169,126); ORANGE=(233,143,68); LINE=(225,228,237); WHITE=(255,255,255)
REG='/Library/Fonts/SF-Pro-Display-Regular.otf'; BOLD='/Library/Fonts/SF-Pro-Display-Bold.otf'
def ft(n,b=False): return ImageFont.truetype(BOLD if b else REG,n)
def bg(a=(255,255,255),b=(241,244,255)):
    strip=Image.new('RGB',(1,H)); p=strip.load()
    for y in range(H):
        t=y/(H-1); p[0,y]=tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
    return strip.resize((W,H)).convert('RGBA')
def fit(path,size):
    im=Image.open(path).convert('RGBA'); s=max(size[0]/im.width,size[1]/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.Resampling.LANCZOS)
    return im.crop(((im.width-size[0])//2,(im.height-size[1])//2,(im.width+size[0])//2,(im.height+size[1])//2))
def place(im,path,box,r=36):
    ph=fit(path,(box[2]-box[0],box[3]-box[1])); m=Image.new('L',ph.size); ImageDraw.Draw(m).rounded_rectangle((0,0,ph.width,ph.height),r,fill=255); im.paste(ph,(box[0],box[1]),m)
def logo(im,x=72,y=42,light=False):
    mark=Image.open(PROJECT/'public/brand/iui-neural-mark.png').convert('RGBA').resize((46,46),Image.Resampling.LANCZOS); im.alpha_composite(mark,(x,y)); d=ImageDraw.Draw(im); c=WHITE if light else INK
    d.text((x+58,y+2),'IUI',font=ft(25,True),fill=c); d.text((x+58,y+30),'TECHNOLOGY',font=ft(9,True),fill=(225,228,240) if light else MUTED)
def wrap(d,text,xy,width,size,color=INK,bold=False,spacing=5,max_lines=20):
    f=ft(size,bold); lines=[]
    for paragraph in text.split('\n'):
        line=''
        for word in paragraph.split():
            test=(line+' '+word).strip()
            if d.textbbox((0,0),test,font=f)[2]<=width: line=test
            else:
                if line: lines.append(line)
                line=word
        if line: lines.append(line)
    lines=lines[:max_lines]; d.multiline_text(xy,'\n'.join(lines),font=f,fill=color,spacing=spacing)
    return len(lines)*(size+spacing)
def header(im,num,kicker,title,subtitle=''):
    d=ImageDraw.Draw(im); logo(im); d.text((1430,58),f'{num:02d} / 11',font=ft(15,True),fill=MUTED)
    d.rounded_rectangle((72,130,72+d.textbbox((0,0),kicker,font=ft(14,True))[2]+32,168),19,fill=(242,239,255)); d.text((88,141),kicker,font=ft(14,True),fill=PURPLE)
    y=198+wrap(d,title,(72,198),1420,54,INK,True,3,3)
    if subtitle: wrap(d,subtitle,(74,y+14),1300,23,MUTED,False,7,3)
    return d
def footer(d,n): d.line((72,850,1528,850),fill=LINE,width=1); d.text((72,865),'IUI TECHNOLOGY · WEEKLY PRODUCT UPDATE',font=ft(11,True),fill=MUTED); d.text((1490,865),str(n).zfill(2),font=ft(11,True),fill=MUTED)
def card(d,box,title,value=None,note=None,accent=PURPLE):
    d.rounded_rectangle(box,28,fill=WHITE,outline=LINE,width=2); x0,y0,x1,y1=box
    if value is not None: d.text((x0+28,y0+23),str(value),font=ft(43,True),fill=accent); ty=y0+82
    else: ty=y0+28
    d.text((x0+28,ty),title,font=ft(21,True),fill=INK)
    if note: wrap(d,note,(x0+28,ty+36),x1-x0-56,17,MUTED,False,5,4)
def bullet(d,x,y,text,color=GREEN,width=550):
    d.ellipse((x,y+5,x+18,y+23),fill=color); d.text((x+9,y+14),'✓',font=ft(11,True),anchor='mm',fill=WHITE); h=wrap(d,text,(x+32,y),width,19,INK,False,6,3); return max(38,h+4)

slides=[]
def save(im,n):
    p=SLIDES/f'iui-weekly-{n:02d}.png'; im.convert('RGB').save(p,quality=96); slides.append(p)

# 1 Cover
im=bg((255,255,255),(235,241,255)); d=ImageDraw.Draw(im); logo(im); d.ellipse((1170,-170,1750,410),fill=(118,102,226,22)); d.ellipse((-180,590,390,1160),fill=(66,190,221,18))
d.rounded_rectangle((72,165,344,210),22,fill=(241,238,255)); d.text((94,179),'PRODUCT SPRINT · WEEK 01',font=ft(14,True),fill=PURPLE)
wrap(d,'Неделя, когда IUI стал ближе к рынку.',(72,255),1050,72,INK,True,4,3); wrap(d,'Продукт · устройство · B2C · B2B · следующие гипотезы',(76,515),950,29,MUTED,False,8,2)
for i,(v,t) in enumerate((('9','B2C-пробников'),('2','тёплых B2B-сигнала'),('1 290 ₸','цена для проверки'))):
    x=72+i*350; d.rounded_rectangle((x,650,x+315,770),25,fill=(255,255,255,210),outline=LINE,width=2); d.text((x+24,674),v,font=ft(38,True),fill=PURPLE if i!=1 else BLUE); d.text((x+24,730),t,font=ft(16),fill=MUTED)
d.text((72,822),'Итоги 4–10 августа 2026 · план на следующую неделю',font=ft(16,True),fill=MUTED); save(im,1)

# 2 Sprint result
im=bg(); d=header(im,2,'РЕЗУЛЬТАТ НЕДЕЛИ','Что изменилось за один продуктовый спринт','Мы одновременно усилили цифровой продукт, физическое устройство и упаковку для рынка.')
items=[('Платформа','Персональный недельный маршрут, нейроразминки и действия для родителя.','01'),('Отчёт','12 страниц: знания, EEG-контекст, динамика и следующий цикл.','02'),('B2B-панель','Охват, воронка, эффект классов и отчёт администрации.','03'),('Устройство','Новая 3D-модель и стабильное питание через провод.','04'),('Social kit','12 постов, 8 Stories, 7 Highlights и единый визуальный язык.','05'),('Рынок','9 B2C-пробников и два сильных сигнала от частных школ.','06')]
for i,(t,n,num) in enumerate(items):
    x=72+(i%3)*500; y=360+(i//3)*205; d.rounded_rectangle((x,y,x+466,y+170),28,fill=WHITE,outline=LINE,width=2); d.text((x+28,y+25),num,font=ft(17,True),fill=PURPLE); d.text((x+78,y+22),t,font=ft(25,True),fill=INK); wrap(d,n,(x+28,y+72),405,18,MUTED,False,5,4)
footer(d,2); save(im,2)

# 3 Tracker product
im=bg((255,255,255),(244,241,255)); d=header(im,3,'ОБНОВЛЕНИЕ ТРЕКЕРА','От измерения — к недельной работе ребёнка','Главное изменение: IUI теперь не заканчивается после диагностики.')
flow=[('1','Диагностика','Знания + EEG'),('2','Личный план','По пробелам ребёнка'),('3','Нейроразминка','2 минуты в день'),('4','Контроль','Новые задания + EEG'),('5','PDF-отчёт','Родителю и учителю')]
for i,(n,t,s) in enumerate(flow):
    x=72+i*296; y=385; d.rounded_rectangle((x,y,x+260,y+190),30,fill=WHITE,outline=LINE,width=2); d.ellipse((x+24,y+24,x+75,y+75),fill=PURPLE if i<3 else BLUE); d.text((x+50,y+50),n,font=ft(18,True),anchor='mm',fill=WHITE); d.text((x+24,y+96),t,font=ft(22,True),fill=INK); wrap(d,s,(x+24,y+132),210,16,MUTED)
    if i<4: d.text((x+272,y+79),'→',font=ft(28,True),fill=(168,164,210))
d.rounded_rectangle((72,620,1528,790),32,fill=(245,243,255)); d.text((106,650),'Добавили в продукт',font=ft(22,True),fill=PURPLE)
x=106
for label in ('Избирательное внимание','Рабочая память','Контроль импульса','Переключение правил','Семейный план поддержки'):
    w=d.textbbox((0,0),label,font=ft(16,True))[2]+38
    if x+w>1480: x=106
    d.rounded_rectangle((x,704,x+w,750),20,fill=WHITE,outline=(225,222,244),width=2); d.text((x+19,718),label,font=ft(16,True),fill=INK); x+=w+14
footer(d,3); save(im,3)

# 4 Device
im=bg((255,255,255),(238,248,255)); d=header(im,4,'HARDWARE UPDATE','Устройство стало удобнее и стабильнее','Два инженерных решения основаны на реальном сценарии 40-минутной диагностики.')
place(im,PROJECT/'deliverables/iui-instagram/assets/device.png',(800,275,1528,805),44); d=ImageDraw.Draw(im)
d.rounded_rectangle((72,350,720,555),32,fill=WHITE,outline=LINE,width=2); d.text((104,382),'Новая 3D-модель',font=ft(29,True),fill=INK); y=440; y+=bullet(d,104,y,'Более удобная посадка на голове',PURPLE,530); y+=bullet(d,104,y,'Меньше лишнего объёма корпуса',PURPLE,530)
d.rounded_rectangle((72,585,720,790),32,fill=WHITE,outline=LINE,width=2); d.text((104,617),'Питание через провод',font=ft(29,True),fill=INK); y=675; y+=bullet(d,104,y,'Стабильная работа всей диагностики',BLUE,530); y+=bullet(d,104,y,'Нет риска разрядки в середине сессии',BLUE,530)
footer(d,4); save(im,4)

# 5 Cable hypothesis
im=bg(); d=header(im,5,'ПРОВЕРЕННАЯ ГИПОТЕЗА №2','Провод оказался лучше аккумулятора','В нашем сценарии надёжность важнее полной автономности.')
d.rounded_rectangle((72,365,760,745),34,fill=(255,246,238),outline=(246,216,188),width=2); d.text((110,405),'Аккумулятор',font=ft(28,True),fill=ORANGE); d.text((110,470),'40 минут',font=ft(72,True),fill=INK); wrap(d,'Диагностика длится дольше стабильного рабочего окна текущего аккумулятора.',(110,570),560,24,MUTED,False,8,4); d.rounded_rectangle((110,670,315,714),20,fill=(255,232,212)); d.text((132,683),'Риск прерывания',font=ft(16,True),fill=(176,95,37))
d.text((790,525),'→',font=ft(48,True),fill=PURPLE)
d.rounded_rectangle((860,365,1528,745),34,fill=(239,250,246),outline=(193,232,217),width=2); d.text((898,405),'Проводное питание',font=ft(28,True),fill=GREEN); d.text((898,470),'Стабильно',font=ft(64,True),fill=INK); wrap(d,'Сессия не зависит от заряда, устройство легче контролировать и проще обслуживать.',(898,570),560,24,MUTED,False,8,4); d.rounded_rectangle((898,670,1165,714),20,fill=(216,244,233)); d.text((920,683),'Выбрано для пилота',font=ft(16,True),fill=(35,126,93))
footer(d,5); save(im,5)

# 6 Social design
im=bg((255,255,255),(243,241,255)); d=header(im,6,'УПАКОВКА ПРОДУКТА','IUI получил единый дизайн социальных сетей','Теперь коммуникация визуально совпадает с платформой и физическим продуктом.')
place(im,PROJECT/'deliverables/iui-instagram/contact-sheet.jpg',(72,360,820,800),34); place(im,PROJECT/'deliverables/iui-instagram/stories-preview.jpg',(860,360,1160,800),34); place(im,PROJECT/'deliverables/iui-instagram/highlights-preview.jpg',(1200,360,1528,800),34); d=ImageDraw.Draw(im)
for x,v,t in ((72,'12','постов'),(860,'8','Stories'),(1200,'7','Highlights')): d.rounded_rectangle((x,750,x+180,810),20,fill=WHITE,outline=LINE,width=2); d.text((x+18,766),v,font=ft(24,True),fill=PURPLE); d.text((x+62,771),t,font=ft(16,True),fill=INK)
footer(d,6); save(im,6)

# 7 B2C hypothesis
im=bg(); d=header(im,7,'ПРОВЕРЕННАЯ ГИПОТЕЗА №1 · B2C','Родителям интересна бесплатная точка старта','Первый спрос появился до масштабного рекламного запуска.')
card(d,(72,370,505,650),'Записались на пробную диагностику','9','B2C-клиенты · родители',PURPLE); card(d,(535,370,968,650),'Что они получают','40 минут','Знания + EEG + стартовый план',BLUE); card(d,(998,370,1431,650),'Что пока не доказано','?','Повторная покупка и готовность платить',ORANGE)
d.rounded_rectangle((72,700,1431,800),28,fill=(244,242,255)); d.text((104,730),'Сигнал недели',font=ft(17,True),fill=PURPLE); d.text((258,725),'Проблема понятна родителям. Теперь проверяем ценность результата после первой диагностики.',font=ft(22,True),fill=INK)
footer(d,7); save(im,7)

# 8 B2B hypothesis
im=bg((255,255,255),(237,248,255)); d=header(im,8,'ПРОВЕРЕННАЯ ГИПОТЕЗА №1 · B2B','Писать нужно владельцам, а не только директорам','Сильнее всего работает мотив дифференциации школы и публичного инновационного образа.')
d.rounded_rectangle((72,350,715,740),34,fill=WHITE,outline=LINE,width=2); d.text((108,388),'Жайсан Бала',font=ft(34,True),fill=INK); d.rounded_rectangle((108,450,350,494),20,fill=(239,248,255)); d.text((130,463),'ЕСТЬ ИНТЕРЕС',font=ft(15,True),fill=BLUE); wrap(d,'Сеть проявила заинтересованность в продукте и формате диагностики.',(108,545),520,24,MUTED,False,8,4)
d.rounded_rectangle((755,350,1398,740),34,fill=WHITE,outline=LINE,width=2); d.text((791,388),'Space School',font=ft(34,True),fill=INK); d.rounded_rectangle((791,450,1086,494),20,fill=(239,250,246)); d.text((813,463),'САМИ ПОЗВАЛИ НА ВСТРЕЧУ',font=ft(15,True),fill=GREEN); wrap(d,'Входящий интерес — более сильный сигнал, чем простой ответ на холодное сообщение.',(791,545),520,24,MUTED,False,8,4)
d.text((72,780),'Инсайт: продавать не «EEG-график», а инновационное позиционирование + измеримый результат для семей.',font=ft(21,True),fill=PURPLE); footer(d,8); save(im,8)

# 9 hypothesis matrix
im=bg(); d=header(im,9,'СВОДКА ГИПОТЕЗ','Что мы уже знаем — и что ещё предстоит доказать','Не путаем первые сигналы рынка с подтверждённой бизнес-моделью.')
rows=[('B2C: родители записываются на пробник','9 записей','Сигнал есть',GREEN),('B2B: владельцам нужен инфоповод','2 тёплых контакта','Сигнал есть',GREEN),('Провод стабильнее аккумулятора','40-минутный сценарий','Подтверждено',PURPLE),('Цена 1 290 ₸ за диагностику','Пока без оплат','Проверить',ORANGE),('Повторная покупка B2C','Нет данных','Проверить',ORANGE)]
d.rounded_rectangle((72,330,1528,390),20,fill=(246,247,250));
for x,t in ((100,'Гипотеза'),(800,'Наблюдение'),(1240,'Статус')): d.text((x,350),t,font=ft(16,True),fill=MUTED)
for i,(hyp,evidence,status,color) in enumerate(rows):
    y=405+i*78; d.line((72,y+70,1528,y+70),fill=LINE,width=1); d.text((100,y+22),hyp,font=ft(20,True),fill=INK); d.text((800,y+24),evidence,font=ft(18),fill=MUTED); d.rounded_rectangle((1240,y+15,1465,y+55),20,fill=tuple(list(color)+[25])); d.text((1260,y+27),status,font=ft(15,True),fill=color)
footer(d,9); save(im,9)

# 10 next week custdev
im=bg((255,255,255),(243,241,255)); d=header(im,10,'СЛЕДУЮЩАЯ НЕДЕЛЯ','CustDev: можем ли мы реально работать с B2C и B2B?','Цель — не собрать комплименты, а получить поведенческие доказательства.')
cols=[('B2C · родители',[('Ценность','Что изменилось после отчёта?'),('Поведение','Сделал ли ребёнок недельный план?'),('Платёж','Заплатили бы 1 290 ₸ за следующую диагностику?'),('Возврат','Когда нужна повторная проверка?')],PURPLE),('B2B · владельцы школ',[('Мотив','Имидж, удержание семей или результат?'),('Пилот','Сколько учеников готовы включить?'),('Решение','Кто подписывает и кто использует?'),('Деньги','За что школа готова платить регулярно?')],BLUE)]
for i,(name,qs,color) in enumerate(cols):
    x=72+i*748; d.rounded_rectangle((x,335,x+705,790),34,fill=WHITE,outline=LINE,width=2); d.text((x+36,372),name,font=ft(29,True),fill=color); y=445
    for label,q in qs:
        d.text((x+36,y),label.upper(),font=ft(13,True),fill=color); wrap(d,q,(x+150,y-4),500,20,INK,False,5,2); y+=78
footer(d,10); save(im,10)

# 11 pricing experiment
im=bg((255,255,255),(235,246,255)); d=header(im,11,'ГЛАВНАЯ ГИПОТЕЗА НЕДЕЛИ','Можно ли продать диагностику за 1 290 ₸?','Цена считается подтверждённой только после реальной оплаты, а не ответа «да, интересно».')
d.rounded_rectangle((72,345,650,750),38,fill=(101,88,214)); d.text((112,390),'B2C OFFER',font=ft(16,True),fill=(220,216,255)); d.text((112,455),'1 290 ₸',font=ft(78,True),fill=WHITE); d.text((112,555),'за 1 диагностику',font=ft(27,True),fill=WHITE); wrap(d,'40 минут · знания + EEG · персональный стартовый результат',(112,620),470,21,(229,226,251),False,7,3)
steps=[('01','Предложить цену','Всем 9 участникам после пробника'),('02','Зафиксировать оплату','Не намерение, а транзакцию'),('03','Собрать отказ','Цена, доверие или непонятная ценность'),('04','Принять решение','Оставить, изменить или пакетировать')]
for i,(n,t,s) in enumerate(steps):
    x=720+(i%2)*405; y=350+(i//2)*210; d.rounded_rectangle((x,y,x+370,y+170),28,fill=WHITE,outline=LINE,width=2); d.text((x+25,y+24),n,font=ft(17,True),fill=PURPLE); d.text((x+75,y+22),t,font=ft(22,True),fill=INK); wrap(d,s,(x+25,y+75),315,17,MUTED,False,5,3)
d.text((720,785),'Критерий недели: реальные оплаты + причины отказа + готовность вернуться.',font=ft(20,True),fill=PURPLE); footer(d,11); save(im,11)

pdf=ROOT/'IUI_Weekly_Update_2026-08-11.pdf'
images=[Image.open(p).convert('RGB') for p in slides]; images[0].save(pdf,save_all=True,append_images=images[1:],resolution=120,quality=95)
thumbs=[]
for p in slides: thumbs.append(fit(p,(400,225)).convert('RGB'))
preview=Image.new('RGB',(1200,900),(235,237,243))
for i,t in enumerate(thumbs): preview.paste(t,((i%3)*400,(i//3)*225))
preview.save(ROOT/'IUI_Weekly_Update_Preview.jpg',quality=92)
print(pdf); print(f'{len(slides)} slides')
