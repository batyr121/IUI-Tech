import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Archive, CalendarDays, ArrowRight, Award, BarChart3, Bell, BookOpen, Brain, Building2, Check,
  ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Cpu, Download, FileText, Flame,
  Compass, Gauge, GraduationCap, LayoutDashboard, ListChecks, Menu, MoreHorizontal, Play,
  Plus, Radio, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp, UserRound, Users,
  Wifi, X, Zap
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import './styles.css';
import './role-dashboard.css';
import './premium-polish.css';
import './header-actions.css';
import './network-status.css';
import './gamification-polish.css';
import StudentLearningOverview from './StudentLearningOverview';
import ParentLearningOverview from './ParentLearningOverview';
import TeacherDashboardOverview from './TeacherDashboardOverview';
import './motion-system.css';
import './notification-badge.css';
import './auth-polish.css';
import './notification-progress.css';
import './streak-state.css';
import './sidebar-scroll.css';
import './boot.css';
import './audience-section.css';
import './scenario-cards.css';
import PlatformPage from './PlatformPages';
import GuestDiagnostic from './GuestDiagnostic';
import { api, authApi } from './api';

type Screen = 'boot' | 'landing' | 'auth' | 'guest-diagnostic' | 'dashboard';

const chartData = [
  {t:'09:00', attention:66, engagement:58, focus:62}, {t:'09:05', attention:72, engagement:67, focus:68},
  {t:'09:10', attention:69, engagement:73, focus:72}, {t:'09:15', attention:78, engagement:71, focus:79},
  {t:'09:20', attention:82, engagement:76, focus:77}, {t:'09:25', attention:76, engagement:81, focus:84},
  {t:'09:30', attention:85, engagement:79, focus:82}, {t:'09:35', attention:88, engagement:84, focus:87},
  {t:'09:40', attention:83, engagement:86, focus:85}, {t:'09:45', attention:91, engagement:88, focus:90},
];

const nav = ['Возможности', 'Как работает', 'Платформа', 'Отзывы'];

function Logo({dark=false}:{dark?:boolean}) {
  return <button className="logo" onClick={()=>location.reload()} aria-label="IUI Technology">
    <span className="logo-mark"><img src="/brand/iui-brain-charge-v4.svg" alt=""/></span>
    <span className={dark?'light':''}>IUI <b>TECHNOLOGY</b></span>
  </button>
}

function MiniChart({color='#6e63e8', dataKey='attention'}:{color?:string,dataKey?:string}) {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData.slice(3)}>
    <defs><linearGradient id={'g'+dataKey} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={.28}/><stop offset="1" stopColor={color} stopOpacity={0}/></linearGradient></defs>
    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.3} fill={'url(#g'+dataKey+')'} dot={false}/>
  </AreaChart></ResponsiveContainer>
}

function ProductPreview() {
  return <div className="product-window">
    <div className="window-top"><div className="window-dots"><i/><i/><i/></div><span>Live сессия · 9А класс</span><div className="live-pill"><i/> LIVE</div></div>
    <div className="window-body">
      <aside className="preview-side"><Logo/><div className="mini-nav active"><LayoutDashboard/> Обзор</div><div className="mini-nav"><Users/> Ученики</div><div className="mini-nav"><Activity/> Live EEG</div><div className="mini-nav"><BarChart3/> Аналитика</div></aside>
      <main className="preview-main">
        <div className="student-row"><div><span className="eyebrow">ТЕКУЩАЯ СЕССИЯ</span><h3>Доброе утро, Данияр 👋</h3><p>Математика · 42 минуты</p></div><div className="student-chip"><div className="avatar">ДС</div><span><b>Данияр С.</b><small>Устройство подключено</small></span><Wifi/></div></div>
        <div className="metric-grid">
          {[['Внимание','87%','+12%', '#6c62e8','attention'],['Вовлечённость','82%','+8%','#168fc9','engagement'],['Концентрация','90%','+14%','#19a77c','focus']].map(x=><div className="metric" key={x[0]}><div><span>{x[0]}</span><em style={{color:x[3]}}>{x[2]}</em></div><strong>{x[1]}</strong><div className="micro-chart"><MiniChart color={x[3]} dataKey={x[4]}/></div></div>)}
        </div>
        <div className="focus-card"><div className="card-heading"><div><span className="eyebrow">НЕЙРОДИНАМИКА</span><h4>Фокус и вовлечённость</h4></div><button>45 минут <ChevronDown/></button></div><div className="hero-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7065e8" stopOpacity=".25"/><stop offset="1" stopColor="#7065e8" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="#eef0f6" vertical={false}/><XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fontSize:10,fill:'#9aa1b4'}}/><Area type="monotone" dataKey="attention" stroke="#7065e8" fill="url(#mainGrad)" strokeWidth="2.5" dot={false}/><Line type="monotone" dataKey="engagement" stroke="#4db7d8" strokeWidth="2" dot={false}/></AreaChart></ResponsiveContainer></div></div>
      </main>
    </div>
  </div>
}

function Landing({openDashboard,openGuestDiagnostic}:{openDashboard:()=>void;openGuestDiagnostic:()=>void}) {
  const [menu,setMenu]=useState(false);
  useEffect(()=>{const items=[...document.querySelectorAll<HTMLElement>('.landing .section,.landing .logos,.landing .cta,.landing .feature,.landing .step,.landing .quote')];items.forEach((item,index)=>{item.classList.add('scroll-reveal');item.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*55}ms`)});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -45px'});items.forEach(item=>observer.observe(item));return()=>observer.disconnect()},[]);
  return <div className="landing">
    <div className="ambient a1"/><div className="ambient a2"/>
    <header className="site-header"><Logo/><nav>{nav.map(n=><a key={n} href={'#'+n.toLowerCase().replace(' ','-')}>{n}</a>)}</nav><div className="header-actions"><button className="text-btn" onClick={openDashboard}>Войти</button><button className="primary small" onClick={openGuestDiagnostic}>Пройти диагностику <ArrowRight/></button></div><button className="mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    {menu&&<div className="mobile-nav">{nav.map(n=><a key={n} href="#features" onClick={()=>setMenu(false)}>{n}</a>)}<button className="primary" onClick={openGuestDiagnostic}>Пройти диагностику</button></div>}
    <main>
      <section className="hero">
        <div className="hero-kicker"><Sparkles/> Новая эра персонального обучения</div>
        <h1>Transform Education<br/>with <span>AI & Neurotechnology</span></h1>
        <p>Понимайте, как учится каждый ребёнок. EEG и искусственный интеллект превращают нейросигналы в понятные рекомендации для преподавателя.</p>
        <div className="hero-actions"><button className="primary big" onClick={openGuestDiagnostic}>Пройти без регистрации <ArrowRight/></button><button className="secondary big" onClick={()=>document.querySelector('#platform')?.scrollIntoView({behavior:'smooth'})}><span className="play"><Play fill="currentColor"/></span> Посмотреть демо</button></div>
        <div className="trust"><span><Check/> Настройка за 5 минут</span><span><Check/> Без банковской карты</span><span><Check/> 14 дней бесплатно</span></div>
        <div className="preview-wrap" id="platform"><div className="preview-glow"/><ProductPreview/></div>
      </section>

      <section className="logos"><span>Создано для современной образовательной экосистемы</span><div><b>Школы</b><b>Учебные центры</b><b>Репетиторы</b><b>Родители</b><b>EdTech</b></div></section>

      <section className="section features" id="возможности"><div className="section-title"><div className="label">ВОЗМОЖНОСТИ</div><h2>Данные, которые меняют<br/>процесс обучения</h2><p>Всё необходимое, чтобы увидеть незаметное и помочь каждому ученику раскрыть свой потенциал.</p></div>
        <div className="feature-grid">
          <article className="feature large purple"><div className="icon-box"><Activity/></div><h3>Live EEG в реальном времени</h3><p>Следите за вниманием, фокусом и вовлечённостью ученика прямо во время занятия.</p><div className="wave-demo"><div className="wave-label"><span><i/> EEG Signal</span><b>Excellent</b></div><svg viewBox="0 0 500 100" preserveAspectRatio="none"><path d="M0,54 C25,45 30,62 52,55 S82,30 100,54 S127,70 146,50 S177,32 199,56 S230,78 253,48 S284,18 305,54 S334,70 359,48 S390,39 410,55 S445,66 500,45" fill="none" stroke="#7568ef" strokeWidth="3"/></svg></div></article>
          <article className="feature"><div className="icon-box blue"><Brain/></div><h3>AI-рекомендации</h3><p>Персональные выводы и практические советы после каждого занятия.</p><div className="ai-note"><Sparkles/><span><b>AI Insight</b><small>Лучшее время для сложных задач — первые 25 минут занятия.</small></span></div></article>
          <article className="feature"><div className="icon-box green"><TrendingUp/></div><h3>Прогресс без догадок</h3><p>Наглядная динамика когнитивных метрик за день, месяц или учебный год.</p><div className="bars">{[42,60,51,72,64,88,76,94].map((h,i)=><i key={i} style={{height:h+'%'}} className={i===7?'hot':''}/>)}</div></article>
        </div>
      </section>

      <section className="section how" id="как-работает"><div className="section-title"><div className="label">КАК ЭТО РАБОТАЕТ</div><h2>От сигнала до инсайта<br/>за три простых шага</h2></div><div className="steps">{[[Cpu,'01','Подключите устройство','ESP32 подключается в браузере по Bluetooth — без кабеля и установки ПО.'],[Radio,'02','Проведите занятие','Система бережно фиксирует нейродинамику в реальном времени.'],[Sparkles,'03','Получите AI-отчёт','Понятный анализ и персональные рекомендации готовы сразу после занятия.']].map(([I,n,t,p]:any)=><article className="step" key={n}><div className="step-icon"><I/></div><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>

      <section className="section ai-section"><div className="ai-panel"><div className="ai-copy"><div className="label light-label"><Sparkles/> AI АНАЛИТИКА</div><h2>Не просто цифры.<br/>Ясные решения.</h2><p>Искусственный интеллект находит паттерны в данных и объясняет, как улучшить следующее занятие для конкретного ученика.</p><ul><li><Check/> Оценка усталости и стабильности внимания</li><li><Check/> Сравнение с личной динамикой ученика</li><li><Check/> Готовые рекомендации преподавателю</li></ul><button className="white-btn" onClick={openDashboard}>Исследовать аналитику <ArrowRight/></button></div><div className="insight-card"><div className="insight-top"><div className="avatar gradient">АК</div><span><b>Алия Касымова</b><small>AI-отчёт · Сегодня, 10:45</small></span><span className="score">88 <small>/ 100</small></span></div><div className="insight-content"><span className="tag">КЛЮЧЕВОЙ ИНСАЙТ</span><h4>Высокая готовность к обучению</h4><p>Алия сохраняла устойчивую концентрацию 78% занятия. После 32-й минуты заметно постепенное снижение фокуса.</p><div className="recommend"><div><Sparkles/></div><span><b>Рекомендация</b><small>Размещайте новые сложные темы в первой половине урока и добавьте короткую паузу на 30-й минуте.</small></span></div></div></div></div></section>

      <section className="section audience-section"><div className="section-title"><div className="label">ДВА ФОРМАТА · ОДНА СИСТЕМА</div><h2>IUI полезен семье<br/>и целой школе</h2><p>Разные интерфейсы и результаты для тех, кто принимает разные решения.</p></div><div className="audience-grid"><article className="family"><div className="audience-icon"><Users/></div><small>B2C · ДЛЯ СЕМЬИ</small><h3>Понять ребёнка и знать, что делать дальше</h3><p>Первая диагностика превращается в недельную программу, контрольную точку и понятный отчёт для родителя.</p><ul><li><Check/> 40-минутная диагностика знаний + EEG</li><li><Check/> 7–10 минут персональной практики в день</li><li><Check/> Семейный план поддержки без давления</li><li><Check/> 12-страничный отчёт о динамике</li></ul><button onClick={openDashboard}>Записаться на диагностику <ArrowRight/></button><em>Первая диагностика бесплатно · устройство предоставляем</em></article><article className="school"><div className="audience-icon"><Building2/></div><small>B2B · ДЛЯ ШКОЛЫ</small><h3>Доказать эффект программы конкретными данными</h3><p>Школа видит охват, регулярность, динамику классов и учеников, которым сейчас нужна поддержка.</p><ul><li><Check/> Панель эффекта для администрации</li><li><Check/> Воронка диагностика → практика → контроль</li><li><Check/> Отчёты семьям и преподавателям</li><li><Check/> CSV и готовый управленческий PDF</li></ul><button onClick={openDashboard}>Запустить пилот в школе <ArrowRight/></button><em>Для запуска нужен ноутбук · устройства предоставляет IUI</em></article></div></section>

      <section className="section testimonials" id="отзывы"><div className="section-title"><div className="label">СЦЕНАРИИ</div><h2>Понятная ценность<br/>для каждой роли</h2></div><div className="quote-grid">{[['Учитель видит не только результат, но и процесс обучения: где возник барьер и кому нужна поддержка.','Учитель','Индивидуальная работа'],['Администрация получает измеримый охват программы и динамику без ручного сведения таблиц.','Администрация','Управление программой'],['Родитель получает конкретный план поддержки, а ребёнок — короткие достижимые шаги.','Родитель','Поддержка дома']].map((q,i)=><article className="quote" key={i}><div className="scenario-number">0{i+1}</div><p>{q[0]}</p><div className="author"><div className={'avatar av'+i}>{q[1][0]}</div><span><b>{q[1]}</b><small>{q[2]}</small></span></div></article>)}</div></section>

      <section className="section faq"><div className="section-title"><div className="label">FAQ</div><h2>Частые вопросы</h2></div><div className="faq-list">{['Насколько безопасно использование EEG-устройства?','Нужно ли устанавливать специальное программное обеспечение?','Как защищены данные учеников?','Можно ли использовать платформу с целым классом?'].map((x,i)=><details key={x} open={i===0}><summary>{x}<Plus/></summary><p>{i===0?'EEG-устройство только считывает естественную электрическую активность мозга и ничего не передаёт обратно. Метод полностью неинвазивен и безопасен.':'Да. Платформа разработана для гибкого использования в школах и индивидуальных образовательных центрах.'}</p></details>)}</div></section>

      <section className="cta"><div className="cta-orb one"/><div className="cta-orb two"/><div className="label light-label">НАЧНИТЕ СЕГОДНЯ</div><h2>Образование становится<br/>персональным</h2><p>Присоединяйтесь к школам, которые уже строят обучение вокруг потребностей каждого ребёнка.</p><button className="white-btn big" onClick={openDashboard}>Попробовать бесплатно <ArrowRight/></button><small>14 дней бесплатно · Настройка за 5 минут</small></section>
    </main>
    <footer><div><Logo/><p>Нейротехнологии и AI для образования,<br/>которое видит каждого ученика.</p></div><div className="footer-links"><span><b>ПРОДУКТ</b><a>Возможности</a><a>Live EEG</a><a>AI Аналитика</a></span><span><b>КОМПАНИЯ</b><a>О нас</a><a>Исследования</a><a>Контакты</a></span><span><b>ПОДДЕРЖКА</b><a>Помощь</a><a>Документация</a><a>Безопасность</a></span></div><div className="copyright">© 2026 IUI Technology <span>Privacy · Terms</span></div></footer>
  </div>
}

function Auth({onSuccess,onBack}:{onSuccess:()=>void,onBack:()=>void}) {
  const [role,setRole]=useState<'teacher'|'student'|'parent'>('teacher'); const [mode,setMode]=useState<'login'|'signup'>('login'); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{const input=document.querySelector<HTMLInputElement>('.auth-card input[name="password"]');const invite=document.querySelector<HTMLInputElement>('.auth-card input[name="inviteCode"]');if(input){input.minLength=mode==='signup'?10:1;input.placeholder=mode==='signup'?'Не менее 10 символов':'Введите пароль'}if(invite)invite.placeholder=role==='student'?'CLASS-XXXX-XXXX':'IUI-XXXX-XXXX'},[mode,role]);
  useEffect(()=>{const input=document.querySelector<HTMLInputElement>('.password-input input');const toggle=document.querySelector<HTMLButtonElement>('.password-input button');const google=document.querySelector<HTMLButtonElement>('.google-button');if(google){google.disabled=true;google.title='Google OAuth будет доступен после настройки провайдера'}if(!input||!toggle)return;toggle.textContent='Показать';const change=()=>{const visible=input.type==='text';input.type=visible?'password':'text';toggle.textContent=visible?'Показать':'Скрыть'};toggle.addEventListener('click',change);return()=>toggle.removeEventListener('click',change)},[mode,role]);
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setLoading(true);setError('');const form=new FormData(e.currentTarget);try{if(mode==='login')await authApi.login({email:String(form.get('email')).trim(),password:String(form.get('password'))});else{const names=String(form.get('name')||'Новый Пользователь').trim().split(/\s+/);await authApi.register({email:String(form.get('email')).trim(),password:String(form.get('password')),firstName:names[0],lastName:names.slice(1).join(' ')||'Пользователь',role:role.toUpperCase(),inviteCode:String(form.get('inviteCode')||'').trim()||undefined,organizationName:role==='teacher'?String(form.get('organizationName')||'').trim():undefined})}onSuccess()}catch(err){setError(err instanceof Error?err.message:'Не удалось выполнить вход')}finally{setLoading(false)}};
  return <div className="auth-page"><div className="auth-ambient one"/><div className="auth-ambient two"/><header><Logo/><button onClick={onBack}>Вернуться на сайт <ArrowRight/></button></header><main className="auth-card"><div className="auth-icon"><Brain/></div><h1>{mode==='login'?'С возвращением':'Создайте аккаунт'}</h1><p>{mode==='login'?'Войдите, чтобы продолжить работу с IUI Technology.':'Начните персонализировать обучение уже сегодня.'}</p><div className="role-switch">{[['teacher','Учитель',GraduationCap],['student','Ученик',UserRound],['parent','Родитель',Users]].map(([id,label,I]:any)=><button key={id} className={role===id?'active':''} onClick={()=>setRole(id)}><I/>{label}</button>)}</div><form onSubmit={submit}>{mode==='signup'&&<label>Имя и фамилия<input name="name" required autoComplete="name" placeholder="Имя Фамилия"/></label>}{mode==='signup'&&role==='teacher'&&<label>Школа или учебный центр<input name="organizationName" required minLength={2} maxLength={120} autoComplete="organization" placeholder="Название организации"/></label>}<label>Email<input name="email" required type="email" autoComplete="email" placeholder="name@school.kz"/></label>{role!=='teacher'&&mode==='signup'&&<label>{role==='student'?'Код класса':'Код приглашения'}<input name="inviteCode" required autoCapitalize="characters" placeholder={role==='student'?'CLASS-XXXX-XXXX':'IUI-XXXX-XXXX'}/></label>}<label>Пароль<div className="password-input"><input name="password" required minLength={10} autoComplete={mode==='login'?'current-password':'new-password'} type="password" placeholder="Не менее 10 символов"/><button type="button">Забыли?</button></div></label>{error&&<div className="auth-error" role="alert">{error}</div>}<button className="primary auth-submit" disabled={loading}>{loading?<span className="loader"/>:mode==='login'?'Войти в платформу':'Создать аккаунт'} {!loading&&<ArrowRight/>}</button></form><div className="auth-divider"><span>или продолжить с</span></div><button className="google-button"><b>G</b> Google</button><p className="auth-toggle">{mode==='login'?'Ещё нет аккаунта?':'Уже есть аккаунт?'} <button onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Зарегистрироваться':'Войти'}</button></p>{role!=='teacher'&&mode==='signup'&&<div className="invite-note"><ShieldCheck/><span><b>Регистрация только по приглашению</b><small>{role==='student'?'Код класса выдаёт преподаватель.':'Доступ родителю предоставляет преподаватель ученика.'}</small></span></div>}</main><footer className="auth-footer">© 2026 IUI Technology <span>Конфиденциальность · Поддержка</span></footer></div>
}

const sideNav = [
  [LayoutDashboard,'Обзор'],[Building2,'Эффект школы'],[BookOpen,'Классы'],[Users,'Ученики'],[ClipboardCheck,'Диагностика'],[Compass,'Профориентация'],[CalendarDays,'Услуги и запись'],[ListChecks,'Мой план'],[FileText,'Учебный отчёт'],[TrendingUp,'Прогресс'],[Archive,'Архив'],[Cpu,'Устройства'],[Zap,'Прошивка'],[Activity,'Live EEG'],[BarChart3,'Аналитика'],[Download,'Отчёты'],[Target,'Мотивация'],[Award,'Достижения'],[Bell,'Уведомления']
];

function RoleOverview({user,setActive}:{user:any,setActive:(page:string)=>void}){
  const [devices,setDevices]=useState<any[]>([]);const [student,setStudent]=useState<any>(null);const [reports,setReports]=useState<any[]>([]);const [homework,setHomework]=useState<any>(null);
  useEffect(()=>{if(!user)return;const loadDevices=()=>api<any>('/device-status').then(r=>setDevices(r.devices)).catch(()=>{});if(user.role==='TEACHER'){void loadDevices();const timer=setInterval(loadDevices,5000);return()=>clearInterval(timer)}if(user.role==='STUDENT'){void api<any>('/homework-plan').then(setHomework).catch(()=>setHomework(null));void api<any>('/students').then(async r=>{if(r.students[0]){const detail=await api<any>(`/students/${r.students[0].id}`);setStudent(detail.student)}}).catch(()=>{})}if(user.role==='PARENT'){void api<any>('/homework-plan').then(setHomework).catch(()=>setHomework(null));void api<any>('/reports').then(r=>setReports(r.sessions)).catch(()=>{})}},[user]);
  if(!user)return <div className="loading-panel"><span className="loader dark-loader"/> Загружаем кабинет...</div>;
  if(user.role==='PARENT')return <ParentLearningOverview user={user} setActive={setActive}/>;
  if(user.role==='STUDENT')return <StudentLearningOverview user={user} setActive={setActive}/>;
  return <TeacherDashboardOverview user={user} setActive={setActive}/>;
}

function Dashboard({back}:{back:()=>void}) {
  const [active,setActive]=useState('Обзор');
  const [mobile,setMobile]=useState(false);
  const [online,setOnline]=useState(()=>navigator.onLine);
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [hasDiagnostic,setHasDiagnostic]=useState<boolean|null>(null);
  const [unreadNotifications,setUnreadNotifications]=useState(0);
  const [loadError,setLoadError]=useState('');
  useEffect(()=>{authApi.me().then(({user})=>setCurrentUser(user)).catch(error=>setLoadError(error.message))},[]);
  useEffect(()=>{if(currentUser?.role!=='STUDENT'){setHasDiagnostic(null);return}void api<{attempts:any[]}>('/diagnostics').then(result=>setHasDiagnostic(result.attempts.length>0)).catch(()=>setHasDiagnostic(false))},[currentUser,active]);
  useEffect(()=>{if(!currentUser)return;const load=()=>api<{notifications:any[]}>('/notifications').then(response=>{const read=new Set<string>(JSON.parse(localStorage.getItem('iui-read-notifications')||'[]'));setUnreadNotifications(response.notifications.filter(item=>!read.has(item.id)).length)}).catch(()=>{});void load();const timer=window.setInterval(load,15000);return()=>window.clearInterval(timer)},[currentUser,active]);
  useEffect(()=>{const bell=document.querySelector<HTMLButtonElement>('.app-actions button[title="Уведомления"]');if(!bell)return;if(unreadNotifications)bell.dataset.unread=String(Math.min(99,unreadNotifications));else delete bell.dataset.unread},[unreadNotifications,currentUser]);
  useEffect(()=>{const move=(event:PointerEvent)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.dash-card,.summary,.class-card,.achievement-grid article,.progress-roster>article');if(!card)return;const rect=card.getBoundingClientRect();card.style.setProperty('--mouse-x',`${event.clientX-rect.left}px`);card.style.setProperty('--mouse-y',`${event.clientY-rect.top}px`)};document.addEventListener('pointermove',move,{passive:true});return()=>document.removeEventListener('pointermove',move)},[]);
  useEffect(()=>{const sync=()=>setOnline(navigator.onLine);window.addEventListener('online',sync);window.addEventListener('offline',sync);return()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync)}},[]);
  useEffect(()=>{document.body.classList.toggle('network-offline',!online);return()=>document.body.classList.remove('network-offline')},[online]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.querySelector<HTMLInputElement>('.app-actions input')?.focus()}if(event.key==='Enter'&&event.target instanceof HTMLInputElement&&event.target.closest('.app-actions')){const value=event.target.value.trim().toLowerCase();const match=roleNav.find(([,name])=>String(name).toLowerCase().includes(value));if(match){setActive(String(match[1]));event.target.value='';event.target.blur()}}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[currentUser]);
  useEffect(()=>{const bell=document.querySelector<HTMLButtonElement>('.app-actions button[title="Уведомления"]');const avatar=document.querySelector<HTMLElement>('.app-actions .avatar');const help=document.querySelector<HTMLButtonElement>('.side-bottom button[title="Центр поддержки"]');const openNotifications=()=>setActive('Уведомления');const openSettings=()=>setActive('Настройки');const openHelp=()=>setActive('Помощь');bell?.addEventListener('click',openNotifications);avatar?.addEventListener('click',openSettings);help?.addEventListener('click',openHelp);return()=>{bell?.removeEventListener('click',openNotifications);avatar?.removeEventListener('click',openSettings);help?.removeEventListener('click',openHelp)}},[currentUser]);
  const initials=currentUser?`${currentUser.firstName?.[0]||''}${currentUser.lastName?.[0]||''}`:'··';
  const fullName=currentUser?`${currentUser.firstName} ${currentUser.lastName}`:'Загрузка...';
  const orgName=currentUser?.organization?.name||'Моя организация';
  const roleLabel=currentUser?.role==='TEACHER'?'Учитель':currentUser?.role==='STUDENT'?'Ученик':currentUser?.role==='PARENT'?'Родитель':'Администратор';
  const visiblePages=currentUser?.role==='STUDENT'
    ?(hasDiagnostic===false
      ?['Обзор','Диагностика','Профориентация','Устройства','Live EEG']
      :['Обзор','Диагностика','Профориентация','Мой план','Учебный отчёт','Устройства','Live EEG'])
    :currentUser?.role==='PARENT'
      ?['Обзор','Профориентация','Мой план','Учебный отчёт','Услуги и запись']
      :['Обзор','Классы','Ученики','Прогресс','Отчёты'];
  const roleNav=sideNav.filter(([,name])=>visiblePages.includes(name as string));
  return <div className="app-shell"><aside className={'app-side '+(mobile?'shown':'')}><div className="side-logo"><Logo/><button onClick={()=>setMobile(false)}><X/></button></div><div className="workspace"><div className="school-icon">{orgName[0]}</div><span><b>{orgName}</b><small>{roleLabel} · аккаунт</small></span><ChevronDown/></div><nav>{roleNav.map(([Icon,name]:any)=><button className={active===name?'active':''} onClick={()=>{setActive(name);setMobile(false)}} key={name}><Icon/>{name}{name==='Live EEG'&&<i/>}</button>)}</nav><div className="side-bottom"><button onClick={()=>setActive('Настройки')}><Settings/>Настройки</button><button title="Центр поддержки"><CircleHelp/>Помощь</button><div className="profile"><div className="avatar av1">{initials}</div><span><b>{fullName}</b><small>{roleLabel}</small></span><button title="Выйти" onClick={async()=>{await authApi.logout();back()}}><MoreHorizontal/></button></div></div></aside><div className="app-content"><header className="app-header"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">{orgName} <ChevronRight/> <b>{active}</b></div><div className="app-actions"><label><Search/><input placeholder="Поиск..."/><kbd>⌘ K</kbd></label><button title="Уведомления"><Bell/></button><div className="avatar av1">{initials}</div></div></header><main className="dashboard">{loadError&&<div className="api-error">{loadError}</div>}{active==='Обзор'?<RoleOverview user={currentUser} setActive={setActive}/>:<PlatformPage page={active}/>}</main></div></div>
}

function App(){const [screen,setScreen]=useState<Screen>('boot');useEffect(()=>{authApi.me().then(()=>setScreen('dashboard')).catch(()=>setScreen('landing'))},[]);useEffect(()=>{window.scrollTo(0,0)},[screen]);if(screen==='boot')return <div className="app-boot" role="status"><Logo/><span className="loader dark-loader"/><small>Восстанавливаем сессию…</small></div>;if(screen==='landing')return <Landing openDashboard={()=>setScreen('auth')} openGuestDiagnostic={()=>setScreen('guest-diagnostic')}/>;if(screen==='guest-diagnostic')return <GuestDiagnostic onBack={()=>setScreen('landing')} onRegister={()=>setScreen('auth')}/>;if(screen==='auth')return <Auth onSuccess={()=>setScreen('dashboard')} onBack={()=>setScreen('landing')}/>;return <Dashboard back={()=>setScreen('landing')}/>}

const rootElement=document.getElementById('root')!;
const appRoot=(window as any).__iuiReactRoot||createRoot(rootElement);
(window as any).__iuiReactRoot=appRoot;
appRoot.render(<App/>);
