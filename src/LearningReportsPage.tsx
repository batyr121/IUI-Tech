import { useEffect, useMemo, useState } from 'react';
import { Brain, Check, Download, FileText, Lightbulb, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import { api } from './api';
import './learning-reports.css';
import './learning-report-delta.css';
import './weekly-report.css';
import './weekly-section-deltas.css';
import './weekly-neuro-deltas.css';
import { buildLearningReport } from './learning-report-document';

const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const labels:Record<string,string>={math:'Математика',logic:'Логика',language:'Язык',attention:'Внимание',focus:'Фокус',engagement:'Вовлечённость',relaxation:'Восстановление',signal:'Качество сигнала'};
const signed=(value:number)=>`${value>=0?'+':''}${value}%`;

export default function LearningReportsPage(){
  const [reports,setReports]=useState<any[]>([]),[diagnostics,setDiagnostics]=useState<any[]>([]),[selected,setSelected]=useState<any>(null),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{api<any>('/learning-reports').then(data=>{setReports(data.reports);setDiagnostics(data.diagnostics);setSelected(data.reports[0]||null)}).catch(reason=>setError(reason.message)).finally(()=>setLoading(false))},[]);
  const visible=useMemo(()=>reports.filter(item=>`${item.student} ${item.publicId} ${item.className}`.toLowerCase().includes(query.toLowerCase())),[reports,query]);
  const diagnostic=selected&&(diagnostics.find(item=>item.id===selected.sourceDiagnosticId)||diagnostics.find(item=>item.publicId===selected.publicId));
  const previousDiagnostic=diagnostic&&diagnostics.find(item=>item.publicId===diagnostic.publicId&&item.id!==diagnostic.id&&new Date(item.completedAt)<new Date(diagnostic.completedAt));
  const diagnosticDelta=diagnostic&&previousDiagnostic?diagnostic.totalScore-previousDiagnostic.totalScore:null;

  const print=()=>{
    if(!selected)return;
    const win=window.open('','_blank');if(!win)return setError('Разрешите всплывающие окна для создания PDF');
    win.document.write(buildLearningReport(selected,diagnostic,previousDiagnostic));win.document.close();
  };
  const download=(type:'csv'|'xls')=>{
    const columns=['Тип','Ученик','IUI ID','Класс','Неделя','Старт','Контроль','Дельта знаний','Дельта фокуса','Дельта вовлечённости','Прогресс','Точность','Активные дни','Навыки'];
    const rows=visible.map(item=>[item.kind==='live-eeg'?'Live EEG':'Недельный план',item.student,item.publicId,item.className,item.weekNumber??'',item.diagnosticScore,item.checkIn?.totalScore??'',item.checkIn?.baselineDelta??'',item.checkIn?.focusDelta??'',item.checkIn?.engagementDelta??'',item.progress,item.accuracy,item.completedDays,(item.focusSkills||[]).join('; ')]);
    let content:string,mime:string;
    if(type==='csv'){const safe=(value:unknown)=>{const text=String(value??'');return `"${(/^[=+\-@]/.test(text)?`'${text}`:text).replace(/"/g,'""')}"`};content=[columns,...rows].map(row=>row.map(safe).join(',')).join('\n');mime='text/csv;charset=utf-8'}
    else{const cells=(row:unknown[])=>`<tr>${row.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`;content=`<html><meta charset="utf-8"><table>${cells(columns)}${rows.map(cells).join('')}</table></html>`;mime='application/vnd.ms-excel'}
    const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(['\ufeff'+content],{type:mime}));link.download=`iui-learning-reports.${type}`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  };
  if(loading)return <div className="learning-report-skeleton"><div/><div/><section/></div>;
  return <>
    <div className="page-head"><div><span>РЕЗУЛЬТАТ НЕДЕЛИ</span><h1>Учебные отчёты</h1><p>Стартовая и контрольная диагностика, EEG-динамика и следующие шаги в одном документе.</p></div><div className="page-actions"><button className="soft-button" disabled={!visible.length} onClick={()=>download('csv')}><Download/> CSV</button><button className="soft-button" disabled={!visible.length} onClick={()=>download('xls')}><Download/> Excel</button><button className="primary" disabled={!selected} onClick={print}><Download/> PDF для родителя</button></div></div>
    {error&&<div className="api-error">{error}</div>}
    {!reports.length?<div className="empty-analytics"><FileText/><h2>Первый отчёт ещё формируется</h2><p>Он появится после диагностики или после завершённой Live EEG-сессии.</p></div>:<div className="learning-report-layout">
      <aside><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ученик или класс..."/></label>{visible.map(item=><button className={selected?.id===item.id?'active':''} onClick={()=>setSelected(item)} key={item.id}><span><b>{item.student}</b><small>{item.kind==='live-eeg'?'Live EEG':'План недели'} · {item.className} · {new Date(item.startsAt).toLocaleDateString('ru-RU')}</small></span><strong>{item.kind==='live-eeg'?item.diagnosticScore:item.progress}%</strong></button>)}</aside>
      {selected&&<main className="learning-report-paper">
        <header><div><small>{selected.kind==='live-eeg'?'IUI NEURO LEARNING REPORT':'IUI LEARNING REPORT'}</small><h2>{selected.student}</h2><p>{selected.className} · {selected.publicId}</p></div><span><Check/>{selected.kind==='live-eeg'?'Сформирован после Live EEG':'Обновляется автоматически'}</span></header>
        <div className="learning-kpis"><article><Brain/><span><b>{selected.diagnosticScore}%</b><small>{selected.kind==='live-eeg'?'нейроэффективность':'стартовая точка'}</small>{diagnosticDelta!==null&&<em className={diagnosticDelta>=0?'positive':'negative'}>{signed(diagnosticDelta)} к прошлой</em>}</span></article><article><TrendingUp/><span><b>{selected.kind==='live-eeg'?`${selected.eeg?.durationMinutes||0} мин`:selected.progress+'%'}</b><small>{selected.kind==='live-eeg'?'длительность':'план недели'}</small></span></article><article><Target/><span><b>{selected.accuracy}%</b><small>{selected.kind==='live-eeg'?'средний фокус':'точность ответов'}</small></span></article><article><Sparkles/><span><b>{selected.kind==='live-eeg'?selected.eeg?.sampleCount:selected.completedDays+'/7'}</b><small>{selected.kind==='live-eeg'?'точек сигнала':'учебных дней'}</small></span></article></div>
        {selected.kind==='live-eeg'&&<section className="weekly-report-checkpoint"><div><Brain/><span><small>LIVE EEG ОТЧЁТ</small><h3>{selected.eeg?.summary||`Когнитивная эффективность — ${selected.diagnosticScore}%`}</h3></span></div><div><b>{selected.eeg?.attentionAvg}%<small>внимание</small></b><b>{selected.eeg?.engagementAvg}%<small>вовлечённость</small></b><b>{selected.eeg?.signalAvg}%<small>сигнал</small></b></div><p>{selected.eeg?.recommendation||'Сессия сохранена. Используйте результат как образовательную точку наблюдения.'}</p></section>}
        {selected.kind!=='live-eeg'&&(selected.checkIn?<section className="weekly-report-checkpoint"><div><Brain/><span><small>КОНТРОЛЬНАЯ ТОЧКА</small><h3>{selected.checkIn.totalScore}% · {signed(selected.checkIn.baselineDelta)} к старту</h3></span></div><div><b>{signed(selected.checkIn.focusDelta)}<small>фокус EEG</small></b><b>{signed(selected.checkIn.engagementDelta)}<small>вовлечённость</small></b><b>{selected.checkIn.adaptedTaskCount}<small>заданий обновлено</small></b></div><div className="weekly-section-deltas">{(['math','logic','language'] as const).map(key=>{const before=Number(selected.sectionScores?.[key]||0),after=Number(selected.checkIn.sectionScores?.[key]||0);return <span key={key}><small>{labels[key]}</small><b>{before}% → {after}%</b><em className={after>=before?'positive':'negative'}>{signed(after-before)}</em></span>})}</div><p>{selected.checkIn.recommendation}</p></section>:<section className="weekly-report-pending"><Brain/><span><small>СЛЕДУЮЩЕЕ ИЗМЕРЕНИЕ</small><h3>Контрольная диагностика в середине недели</h3><p>6 новых вопросов и EEG-сравнение покажут, закрепились ли навыки.</p></span></section>)}
        {selected.checkIn&&<div className="weekly-neuro-deltas"><span><b>{signed(selected.checkIn.attentionDelta)}</b><small>внимание</small></span><span><b>{signed(selected.checkIn.focusDelta)}</b><small>фокус</small></span><span><b className={selected.checkIn.fatigueDelta<=0?'good':'warn'}>{signed(selected.checkIn.fatigueDelta)}</b><small>усталость ↓ лучше</small></span><span><b>{signed(selected.checkIn.relaxationDelta)}</b><small>расслабление</small></span><span><b className={selected.checkIn.signalQuality>=70?'good':selected.checkIn.signalQuality<40?'warn':''}>{selected.checkIn.signalQuality}%</b><small>качество сигнала</small></span></div>}
        <section className="learning-focus"><Lightbulb/><div><small>ПЕРСОНАЛЬНЫЙ ФОКУС</small><h3>{(selected.focusSkills||[]).slice(0,3).join(' · ')||'Закрепление базовых навыков'}</h3><p>{selected.checkIn?'Фокус обновлён по контрольному измерению.':'Задания подобраны по стартовой диагностике и классу ребёнка.'}</p></div></section>
        <div className="subject-progress"><h3>Прогресс по направлениям</h3>{selected.subjects.map((item:any)=><div key={item.subject}><span>{labels[item.subject]||item.subject}<b>{item.progress}%</b></span><i><em style={{width:`${item.progress}%`}}/></i></div>)}</div>
        <section className="next-actions"><Sparkles/><div><small>ЧТО ДЕЛАТЬ ДАЛЬШЕ</small><h3>{selected.kind==='live-eeg'?'Рекомендации после Live EEG':'Рекомендации на следующую неделю'}</h3><ul>{(selected.recommendations||diagnostic?.recommendations||['Продолжать короткие ежедневные занятия.']).slice(0,4).map((item:string)=><li key={item}>{item}</li>)}</ul></div></section>
        <footer><span>{selected.kind==='live-eeg'?`Устройство: ${selected.eeg?.device?.displayName||'IUI NeuroBand'}`:`Подсказки: ${selected.hintRate}% попыток`}</span><span>{selected.kind==='live-eeg'?`Прошивка: ${selected.eeg?.device?.firmwareVersion||'—'}`:`Средний ответ: ${Math.round(selected.averageResponseMs/1000)} сек`}</span><b>{selected.kind==='live-eeg'?'Live EEG завершён':`${selected.completed}/${selected.total} заданий`}</b></footer>
      </main>}
    </div>}
  </>;
}
