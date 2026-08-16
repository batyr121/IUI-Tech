import {useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Brain,Check,FileText,GraduationCap,Languages,LockKeyhole,Printer,ShieldCheck,Sparkles,Target} from 'lucide-react';
import {api} from './api';
import './guest-diagnostic.css';

type Question={id:string;section:'math'|'logic'|'language';skill:string;prompt:string;options:string[]};
const labels={math:'Математика',logic:'Логика',language:'Язык'};

export default function GuestDiagnostic({onBack,onRegister}:{onBack:()=>void;onRegister:()=>void}){
  const[grade,setGrade]=useState(5),[language,setLanguage]=useState<'ru'|'kk'>('ru'),[questions,setQuestions]=useState<Question[]>([]),[assessmentId,setAssessmentId]=useState(''),[index,setIndex]=useState(0),[answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<any>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const startedRef=useRef(Date.now()),responsesRef=useRef<any[]>([]),current=questions[index],progress=questions.length?Math.round((index+1)/questions.length*100):0;
  const grouped=useMemo(()=>result?Object.entries(result.sectionScores||{}):[],[result]);
  const cognitiveNames:Record<string,string>={attention:'Устойчивость внимания',memory:'Рабочая память',logic:'Логическое мышление',reaction:'Скорость реакции',processing:'Скорость обработки',spatial:'Пространственное мышление',patterns:'Поиск закономерностей',analysis:'Аналитическое мышление',learning:'Перенос нового правила',comprehension:'Понимание инструкции'};
  const cognitive=useMemo(()=>result?Object.entries(result.cognitiveScores||{}).sort((a:any,b:any)=>b[1]-a[1]):[],[result]);
  const start=async()=>{setLoading(true);setError('');try{const data=await api<any>(`/public/diagnostics/questions?grade=${grade}&language=${language}`);setQuestions(data.questions);setAssessmentId(data.assessmentId);setAnswers({});setIndex(0);setResult(null);responsesRef.current=[];startedRef.current=Date.now()}catch(e){setError(e instanceof Error?e.message:'Не удалось загрузить задания')}finally{setLoading(false)}};
  const answer=async(value:number)=>{if(!current||loading)return;const ended=Date.now(),nextAnswers={...answers,[current.id]:value};setAnswers(nextAnswers);responsesRef.current.push({questionId:current.id,answer:value,responseTimeMs:Math.max(500,ended-startedRef.current),changes:0,timeout:false,startedAt:new Date(startedRef.current).toISOString(),answeredAt:new Date(ended).toISOString()});if(index<questions.length-1){setIndex(index+1);startedRef.current=Date.now();return}setLoading(true);setError('');try{const data=await api<any>('/public/diagnostics/score',{method:'POST',body:JSON.stringify({grade,language,assessmentId,answers:nextAnswers,responses:responsesRef.current})});setResult(data.result);setQuestions([])}catch(e){setError(e instanceof Error?e.message:'Не удалось рассчитать результат')}finally{setLoading(false)}};
  if(result)return <div className="guest-diagnostic">
<header className="guest-top">
<button onClick={onBack}>
<ArrowLeft/>На главную</button>
<div>
<img src="/brand/iui-brain-charge-v4.svg"/>IUI <b>TECHNOLOGY</b>
</div>
<span>
<ShieldCheck/>Анонимно</span>
</header>
<main className="guest-result">
<section className="guest-score">
<Sparkles/>
<small>ПЕРВАЯ ПРОВЕРКА ЗНАНИЙ ЗАВЕРШЕНА</small>
<strong>{result.totalScore}<i>%</i>
</strong>
<h1>{result.totalScore>=80?'Знания уверенные':result.totalScore>=60?'Хорошая база — есть точки роста':result.totalScore>=40?'Некоторые темы стоит закрепить':'Начнём с укрепления базы'}</h1>
<p>Результат не сохранён и не привязан к ребёнку. Это первая ориентировочная точка, а не школьная оценка.</p>
</section>
<div className="guest-section-grid">{grouped.map(([key,value]:any)=>
<article key={key}>
<span>{labels[key as keyof typeof labels]||key}<b>{value}%</b>
</span>
<i>
<em style={{width:`${value}%`}}/>
</i>
<small>{value>=80?'Сильная сторона':value>=60?'Стоит закрепить':'Зона внимания'}</small>
</article>)}</div>
<section className="guest-cognitive-profile">
<header><Brain/><div><small>КОГНИТИВНЫЕ ЗАДАЧИ</small><h2>Как ребёнок обрабатывает информацию</h2><p>Профиль построен по точности и времени ответа. Это образовательное наблюдение, а не оценка интеллекта или медицинская диагностика.</p></div></header>
<div>{cognitive.map(([key,value]:any)=><article key={key}><span><b>{cognitiveNames[key]||key}</b><strong>{value}%</strong></span><i><em style={{width:`${value}%`}}/></i><small>{value>=80?'Уверенно':value>=60?'Развивается':'Нужна тренировка'}</small></article>)}</div>
</section>
<div className="guest-result-columns">
<section>
<Target/>
<div>
<small>ЧТО УЖЕ ПОЛУЧАЕТСЯ</small>
<h2>Сильные стороны</h2>
<div>{result.strengths?.length?result.strengths.slice(0,5).map((x:string)=>
<span key={x}>
<Check/>{x}</span>):<p>Для уверенного вывода нужна следующая проверка.</p>}</div>
</div>
</section>
<section>
<Brain/>
<div>
<small>ЧТО СТОИТ УКРЕПИТЬ</small>
<h2>Точки роста</h2>
<div>{result.gaps?.length?result.gaps.slice(0,5).map((x:string)=>
<span key={x}>{x}</span>):<p>Критичных пробелов не выявлено.</p>}</div>
</div>
</section>
</div>
<section className="guest-next">
<div>
<LockKeyhole/>
<span>
<small>СЛЕДУЮЩИЙ ШАГ — ТОЛЬКО ПО ЖЕЛАНИЮ</small>
<h2>Сохранить результат и получить недельный план</h2>
<p>Создайте профиль, если хотите сохранить историю, пройти нейросессию с IUI NeuroBand и получить персональные микро-задания.</p>
</span>
</div>
<div>
<button onClick={()=>window.print()}>
<Printer/>Сохранить результат</button>
<button className="primary" onClick={onRegister}>Создать профиль<ArrowRight/>
</button>
</div>
</section>
</main>
</div>;
  if(!questions.length)return <div className="guest-diagnostic">
<header className="guest-top">
<button onClick={onBack}>
<ArrowLeft/>На главную</button>
<div>
<img src="/brand/iui-brain-charge-v4.svg"/>IUI <b>TECHNOLOGY</b>
</div>
<span>
<ShieldCheck/>Без регистрации</span>
</header>
<main className="guest-welcome">
<div className="guest-copy">
<span className="guest-pill">
<Sparkles/>ПЕРВАЯ СЕССИЯ</span>
<h1>Проверим знания.<br/>
<b>Без аккаунта и анкеты.</b>
</h1>
<p>Выберите класс и язык. Ребёнок выполнит задания по знаниям, вниманию, памяти, реакции, логике и переносу новых правил, а IUI сразу покажет сильные стороны и темы для тренировки.</p>
<div className="guest-trust">
<span>
<Check/>Без имени и телефона</span>
<span>
<Check/>Результат не сохраняется в базе</span>
<span>
<Check/>Не является школьной оценкой</span>
<span>
<Check/>Не является тестом IQ</span>
</div>
</div>
<section className="guest-start-card">
<div className="guest-orbit">
<Brain/>
<i/>
<i/>
</div>
<small>НАСТРОЙКА ДИАГНОСТИКИ</small>
<h2>С чего начнём?</h2>
<label>
<GraduationCap/>Класс<select value={grade} onChange={e=>setGrade(Number(e.target.value))}>{Array.from({length:11},(_,i)=>
<option key={i+1} value={i+1}>{i+1} класс</option>)}</select>
</label>
<label>
<Languages/>Язык заданий<div className="guest-language">
<button className={language==='ru'?'active':''} onClick={()=>setLanguage('ru')}>Русский</button>
<button className={language==='kk'?'active':''} onClick={()=>setLanguage('kk')}>Қазақша</button>
</div>
</label>{error&&<p className="guest-error">{error}</p>}<button className="primary guest-start" disabled={loading} onClick={start}>{loading?'Загружаем…':'Начать анонимно'}<ArrowRight/>
</button>
<p className="guest-privacy">
<ShieldCheck/>Мы не запрашиваем и не сохраняем персональные данные.</p>
</section>
</main>
</div>;
  return <div className="guest-diagnostic">
<header className="guest-top">
<button onClick={onBack}>
<ArrowLeft/>Выйти</button>
<div>
<img src="/brand/iui-brain-charge-v4.svg"/>IUI <b>TECHNOLOGY</b>
</div>
<span>
<ShieldCheck/>Анонимная сессия</span>
</header>
<main className="guest-test">
<div className="guest-test-head">
<div>
<small>{labels[current.section]} · {current.skill}</small>
<b>Вопрос {index+1} из {questions.length}</b>
</div>
<span>{progress}%</span>
</div>
<div className="guest-progress">
<i style={{width:`${progress}%`}}/>
</div>
<section>
<span>{current.section==='math'?<GraduationCap/>:current.section==='logic'?<Brain/>:<Languages/>}</span>
<small>{labels[current.section].toUpperCase()}</small>
<h1>{current.prompt}</h1>
<div>{current.options.map((option,optionIndex)=>
<button key={option} disabled={loading} onClick={()=>void answer(optionIndex)}>
<i>{String.fromCharCode(65+optionIndex)}</i>
<b>{option}</b>
<ArrowRight/>
</button>)}</div>
</section>{error&&<p className="guest-error">{error}</p>}<footer>
<ShieldCheck/>Ответы используются только для расчёта результата в этой сессии.</footer>
</main>
</div>;
}
