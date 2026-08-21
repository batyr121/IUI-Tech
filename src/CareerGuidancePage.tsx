import {useEffect,useState} from 'react';
import {ArrowRight,Brain,Check,Compass,GraduationCap,Lightbulb,Palette,Presentation,Search,Settings2,Sparkles,Target} from 'lucide-react';
import {api} from './api';
import './career-guidance.css';
import './career-teacher.css';

const questions=[
  ['Мне нравится разбираться, почему система работает именно так.','research'],
  ['Я люблю создавать изображения, истории или необычные идеи.','creative'],
  ['Мне интересно помогать людям и объяснять сложное понятным языком.','social'],
  ['Мне нравится собирать устройства, программировать или конструировать.','technical'],
  ['Я легко организую команду и распределяю задачи.','leadership'],
  ['Мне комфортно работать с числами, таблицами и закономерностями.','analytical'],
  ['Я хочу проводить эксперименты и проверять гипотезы.','research'],
  ['Мне нравится придумывать дизайн продукта или интерфейса.','creative'],
  ['Я получаю удовольствие, когда кому-то становится понятнее после моего объяснения.','social'],
  ['Я предпочитаю сделать работающий прототип, а не только обсуждать идею.','technical'],
  ['Мне интересно презентовать проект и убеждать аудиторию.','leadership'],
  ['Я замечаю ошибки и несоответствия в информации.','analytical']
];

const labels:any={
  research:'Исследования и наука',
  creative:'Дизайн и креативные индустрии',
  social:'Образование и работа с людьми',
  technical:'Инженерия и технологии',
  leadership:'Предпринимательство и управление',
  analytical:'Аналитика и данные'
};

const directionMeta:any={
  research:{icon:Search,color:'#5b8def',project:'Мини-исследование: сравни два способа учиться 7 дней и сделай вывод.',skills:['гипотезы','наблюдение','выводы']},
  creative:{icon:Palette,color:'#9b6bff',project:'Собери 3 варианта постера/интерфейса и объясни, какой понятнее.',skills:['визуальное мышление','идеи','стиль']},
  social:{icon:Presentation,color:'#32a980',project:'Объясни сложную тему младшему ученику и запиши, где он запутался.',skills:['коммуникация','эмпатия','объяснение']},
  technical:{icon:Settings2,color:'#4caed0',project:'Собери схему решения: вход → правило → действие → результат.',skills:['алгоритмы','конструирование','логика']},
  leadership:{icon:Target,color:'#f39b45',project:'Организуй маленькую командную задачу: цель, роли, дедлайн, итог.',skills:['решения','ответственность','презентация']},
  analytical:{icon:Brain,color:'#6b63df',project:'Возьми 5 результатов заданий, найди закономерность и предложи улучшение.',skills:['данные','паттерны','точность']}
};

export default function CareerGuidancePage(){
  const [data,setData]=useState<any>(null);
  const [answers,setAnswers]=useState<number[]>(Array(questions.length).fill(0));
  const [step,setStep]=useState(0);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<any>(null);
  const [review,setReview]=useState({status:'CONFIRMED',note:''});

  useEffect(()=>{api<any>('/career-profile').then(r=>{setData(r);if(r.profile?.responses)setAnswers(r.profile.responses)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);

  const completed=answers.filter(Boolean).length;
  const canSubmit=completed===questions.length;
  const result=data?.profile;
  const current=questions[step];
  const options=[['Совсем не про меня',1],['Скорее нет',2],['Скорее да',3],['Очень похоже на меня',4]] as const;

  const submit=async()=>{
    setSaving(true);setError('');
    try{const r=await api<any>('/career-profile',{method:'POST',body:JSON.stringify({responses:answers})});setData(r)}
    catch(e){setError(e instanceof Error?e.message:'Не удалось сохранить профиль')}
    finally{setSaving(false)}
  };

  const saveReview=async()=>{
    if(!selected||review.note.trim().length<3)return;
    setSaving(true);
    try{
      const r=await api<any>(`/career-profile/${selected.id}/review`,{method:'POST',body:JSON.stringify(review)});
      const profiles=data.profiles.map((item:any)=>item.id===selected.id?{...item,review:r.review}:item);
      setData({...data,profiles});setSelected({...selected,review:r.review});
    }catch(e){setError(e instanceof Error?e.message:'Не удалось сохранить решение')}
    finally{setSaving(false)}
  };

  if(loading)return <div className="loading-panel"><span className="loader dark-loader"/>Готовим профориентацию…</div>;

  if(data?.mode==='teacher'){
    const visible=data.profiles.filter((item:any)=>`${item.name} ${item.className} ${item.publicId}`.toLowerCase().includes(query.toLowerCase()));
    return <div className="career-page">
      <div className="page-head"><div><span>КАРЬЕРНЫЕ ГИПОТЕЗЫ УЧЕНИКОВ</span><h1>Профориентация класса</h1><p>Смотрите карту интересов по классу, обсуждайте направления и превращайте выводы в проекты.</p></div></div>
      {error&&<div className="api-error">{error}</div>}
      <div className="career-teacher-kpis"><span><b>{data.profiles.length}</b><small>учеников в списке</small></span><span><b>{data.profiles.filter((x:any)=>x.profile).length}</b><small>профилей готово</small></span><span><b>{data.profiles.filter((x:any)=>x.review).length}</b><small>обсуждено педагогом</small></span></div>
      <label className="career-search"><Compass/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ученик, класс или IUI ID…"/></label>
      <div className="career-roster">{visible.map((item:any)=><button key={item.id} disabled={!item.profile} onClick={()=>{setSelected(item);setReview({status:item.review?.status||'CONFIRMED',note:item.review?.note||''})}}>
        <span><b>{item.name}</b><small>{item.className} · {item.publicId}{item.early?' · ранняя карта':''}</small></span>
        {item.profile?<><strong>{labels[item.profile.topDirections[0]?.key]||'Профиль готов'}</strong><i className={item.review?'reviewed':''}>{item.review?'Обсуждено':'Открыть'}</i></>:<em>Не пройдено</em>}
      </button>)}</div>
      {selected&&<div className="career-review-backdrop" onMouseDown={()=>setSelected(null)}><section onMouseDown={e=>e.stopPropagation()}><header><div><small>ПЕДАГОГИЧЕСКОЕ ОБСУЖДЕНИЕ</small><h2>{selected.name}</h2><p>{selected.className} · результат ребёнка не изменяется</p></div><button onClick={()=>setSelected(null)}>×</button></header><div className="career-review-directions">{selected.profile.topDirections.map((x:any)=><span key={x.key}><b>{labels[x.key]}</b><small>{x.score}% совпадения</small></span>)}</div><label>Статус<select value={review.status} onChange={e=>setReview({...review,status:e.target.value})}><option value="CONFIRMED">Можно проверить на практике</option><option value="NEEDS_DISCUSSION">Нужно обсудить с семьёй</option><option value="OBSERVATION">Продолжить наблюдение</option></select></label><label>Наблюдение преподавателя<textarea value={review.note} onChange={e=>setReview({...review,note:e.target.value})} placeholder="Какие проекты стоит попробовать? Что ребёнок делает с интересом?"/></label><button className="primary" disabled={saving||review.note.trim().length<3} onClick={saveReview}>{saving?'Сохраняем…':'Сохранить наблюдение'}<Check/></button></section></div>}
    </div>;
  }

  return <div className="career-page">
    <div className="page-head"><div><span>{data?.early?'КАРТА ИНТЕРЕСОВ':'ПРОФОРИЕНТАЦИЯ · IUI'}</span><h1>{data?.early?'Пробуем разные способы мышления':'Карта направлений'}</h1><p>Интересы, учебные результаты и когнитивный профиль превращаются в гипотезы, которые нужно проверять проектами.</p></div></div>
    {error&&<div className="api-error">{error}</div>}

    {result?<>
      <section className="career-hero"><Compass/><div><small>{result.early?'РАННЯЯ КАРТА ИНТЕРЕСОВ':'ПРОФИЛЬ СФОРМИРОВАН'}</small><h2>{result.topDirections.slice(0,2).map((x:any)=>labels[x.key]).join(' · ')}</h2><p>{result.early?'Это не выбор профессии — просто умный способ понять, какие задачи ребёнка зажигают.':'Это ориентир для проб и развития навыков, а не окончательный выбор профессии.'}</p></div><button onClick={()=>setData({...data,profile:null})}>Пройти заново</button></section>
      <div className="career-directions">{result.topDirections.map((item:any,index:number)=>{
        const meta=directionMeta[item.key],Icon=meta.icon;
        return <article key={item.key} style={{'--career-color':meta.color} as any}><i>{index+1}</i><span><small>{index===0?'ВЕДУЩАЯ ГИПОТЕЗА':'ДОПОЛНИТЕЛЬНАЯ ТРАЕКТОРИЯ'}</small><h3><Icon/>{labels[item.key]}</h3><p>{item.reason}</p><em><b style={{width:`${item.score}%`}}/></em><strong>{item.score}% совпадения</strong></span></article>
      })}</div>
      <section className="career-lab"><header><div><small>ЛАБОРАТОРИЯ НАПРАВЛЕНИЙ</small><h2>Прокачиваем не профессию, а будущий навык</h2><p>Каждое направление проверяется маленьким проектом: ребёнок пробует, сравнивает интерес и понимает себя точнее.</p></div><Sparkles/></header><div>{result.topDirections.map((item:any)=>{const meta=directionMeta[item.key],Icon=meta.icon;return <article key={item.key}><Icon/><span><b>{labels[item.key]}</b><p>{meta.project}</p><div>{meta.skills.map((skill:string)=><em key={skill}>{skill}</em>)}</div></span></article>})}</div></section>
      <section className="career-next"><Target/><div><small>ПЛАН ПРОВЕРКИ ГИПОТЕЗЫ</small><h2>Не выбирать — попробовать</h2><ol>{result.nextSteps.map((x:string)=><li key={x}><Check/>{x}</li>)}</ol></div></section>
      <section className="career-note"><Lightbulb/><p>EEG используется только как дополнительное наблюдение за работой во время учебных задач. IUI не определяет профессию по активности мозга и не ограничивает выбор ребёнка.</p></section>
    </>:<section className="career-test">
      <header><div><Brain/><span><small>ИНТЕРЕСЫ И ПРЕДПОЧТЕНИЯ</small><b>Утверждение {step+1} из {questions.length}</b></span></div><strong>{Math.round(completed/questions.length*100)}%</strong></header>
      <i><b style={{width:`${completed/questions.length*100}%`}}/></i>
      <main><Sparkles/><h2>{current[0]}</h2><div>{options.map(([label,value])=><button className={answers[step]===value?'active':''} onClick={()=>{const next=[...answers];next[step]=value;setAnswers(next)}} key={value}><span>{label}</span>{answers[step]===value&&<Check/>}</button>)}</div></main>
      <footer><button disabled={step===0} onClick={()=>setStep(x=>x-1)}>Назад</button>{step<questions.length-1?<button className="primary" disabled={!answers[step]} onClick={()=>setStep(x=>x+1)}>Далее<ArrowRight/></button>:<button className="primary" disabled={!canSubmit||saving} onClick={submit}>{saving?'Анализируем…':'Сформировать профиль'}<GraduationCap/></button>}</footer>
    </section>}
  </div>;
}
