import { useEffect, useRef, useState } from 'react';
import { Activity, Award, Bluetooth, Check, Circle, Cpu, Maximize2, Minimize2, Pause, Play, Radio, RefreshCw, ShieldCheck, Sparkles, Wifi, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, type EegSample } from './api';
import { bluetoothManager } from './bluetoothManager';
import CelebrationOverlay from './CelebrationOverlay';
import './student-eeg.css';
import './session-plan.css';
import './signal-warning.css';
import './firmware-warning.css';
import './session-milestone.css';
import './eeg-focus-mode.css';
import './eeg-countdown.css';
import './session-controls.css';

const metrics = [
  ['Attention', 'attention', '#7064e5'], ['Meditation', 'meditation', '#4a9fd2'],
  ['Engagement', 'engagement', '#2ab288'], ['Focus', 'focus', '#8b6adf'],
  ['Relaxation', 'relaxation', '#47b9c8'], ['Blink', 'blink', '#e7a446'],
  ['Signal Quality', 'signal', '#35aa7d'],
] as const;

export default function StudentLiveEEG() {
  const [running, setRunning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [phase, setPhase] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [samples, setSamples] = useState<EegSample[]>([]);
  const [device, setDevice] = useState<any>(null);
  const [error, setError] = useState('');
  const [firmwareWarning,setFirmwareWarning]=useState('');
  const [result, setResult] = useState<any>(null);
  const [celebration,setCelebration]=useState<{title:string;message:string;eyebrow:string}|null>(null);
  const [subject,setSubject]=useState('Самостоятельное занятие');
  const [goalMinutes,setGoalMinutes]=useState(20);
  const [goalReached,setGoalReached]=useState(false);
  const [focusMode,setFocusMode]=useState(false);
  const [paused,setPaused]=useState(false);
  const [countdown,setCountdown]=useState<number|null>(null);
  const sessionRef = useRef('');
  const recordingRef = useRef(false);
  const wasConnectedRef = useRef(bluetoothManager.getSnapshot().connected);
  const bufferRef = useRef<EegSample[]>([]);
  const milestoneShownRef=useRef(false);

  const send = (text: string) => bluetoothManager.send(text);

  useEffect(() => {
    if (!running) return;
    const clock = window.setInterval(() => {if(!paused)setSeconds(value => value + 1)}, 1000);
    const heartbeat = window.setInterval(() => { if (device?.id) void api(`/devices/${device.id}/heartbeat`, { method: 'POST' }); }, 5000);
    const flush = window.setInterval(async () => {
      const batch = bufferRef.current.splice(0, 500);
      if (!batch.length || !sessionRef.current) return;
      try { await api(`/sessions/${sessionRef.current}/samples`, { method: 'POST', body: JSON.stringify({ samples: batch }) }); }
      catch { bufferRef.current.unshift(...batch); }
    }, 2000);
    return () => { clearInterval(clock); clearInterval(flush); clearInterval(heartbeat); };
  }, [running, device?.id,paused]);

  useEffect(()=>bluetoothManager.subscribeSamples(sample=>{if(!recordingRef.current)return;bufferRef.current.push(sample);setSamples(previous=>[...previous.slice(-119),sample])}),[]);
  useEffect(()=>bluetoothManager.subscribe(next=>{
    setDevice(next.device);
    if(wasConnectedRef.current&&!next.connected&&!next.connecting&&sessionRef.current){recordingRef.current=false;setRunning(false);setConnecting(false);setCountdown(null);setPhase('');setError('Bluetooth-соединение с ESP32 потеряно. Незавершённая сессия отменена.');void api(`/sessions/${sessionRef.current}`,{method:'DELETE'}).catch(()=>{});sessionRef.current='';wasConnectedRef.current=false}
    if(next.connected)wasConnectedRef.current=true;
  }),[]);
  useEffect(()=>{document.body.classList.toggle('eeg-focus-mode',focusMode);const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setFocusMode(false)};window.addEventListener('keydown',escape);return()=>{document.body.classList.remove('eeg-focus-mode');window.removeEventListener('keydown',escape)}},[focusMode]);
  useEffect(()=>{if(!running)return;const protect=(event:BeforeUnloadEvent)=>{event.preventDefault()};window.addEventListener('beforeunload',protect);return()=>window.removeEventListener('beforeunload',protect)},[running]);
  useEffect(()=>{if(!running||milestoneShownRef.current||seconds<goalMinutes*60)return;milestoneShownRef.current=true;setGoalReached(true);navigator.vibrate?.([50,35,70]);const timer=window.setTimeout(()=>setGoalReached(false),5000);return()=>window.clearTimeout(timer)},[running,seconds,goalMinutes]);

  const start = async () => {
    setConnecting(true); setPhase('Ожидаем Device ID...'); setError(''); setFirmwareWarning(''); setGoalReached(false); setPaused(false); milestoneShownRef.current=false; setSamples([]); setResult(null);
    try {
      const connectedDevice=await bluetoothManager.connect();
      setDevice(connectedDevice);
      if(connectedDevice.firmwareStatus==='OUTDATED')setFirmwareWarning(`Доступна прошивка v${connectedDevice.recommendedFirmware}. Сейчас установлена v${connectedDevice.firmware}. Обновление выполняет команда IUI.`);else if(connectedDevice.firmwareStatus==='UNKNOWN')setFirmwareWarning('Версия прошивки не распознана. Обратитесь к команде IUI для обслуживания устройства.');
      const created=await api<{session:{id:string}}>('/sessions',{method:'POST',body:JSON.stringify({deviceId:connectedDevice.id,subject:subject.trim()||'Самостоятельное занятие'})});
      sessionRef.current=created.session.id;setPhase('Калибровка сигнала · 3 сек');await send('CALIBRATE');await new Promise(resolve=>window.setTimeout(resolve,3400));setPhase('Приготовьтесь к записи');for(let value=3;value>=1;value--){setCountdown(value);await new Promise(resolve=>window.setTimeout(resolve,700))}setCountdown(null);await send('START');recordingRef.current=true;setSeconds(0);setRunning(true);setConnecting(false);setPhase('');
    } catch (reason) {
      if(sessionRef.current)void api(`/sessions/${sessionRef.current}`,{method:'DELETE'}).catch(()=>{});
      sessionRef.current='';recordingRef.current=false;
      setError(reason instanceof Error ? reason.message : 'Не удалось подключиться по Bluetooth');
      setConnecting(false); setPhase('');
      setCountdown(null);
    }
  };

  const stop = async () => {
    setRunning(false);
    recordingRef.current=false;
    setFocusMode(false);
    try {
      await send('STOP').catch(()=>{});
      const rest = bufferRef.current.splice(0);
      if (rest.length) await api(`/sessions/${sessionRef.current}/samples`, { method: 'POST', body: JSON.stringify({ samples: rest }) });
      if (sessionRef.current) { const finished=await api<{analysis:any}>(`/sessions/${sessionRef.current}/finish`, { method: 'POST' }); const analysis=finished.analysis;setResult(analysis);if(analysis.leveledUp)setCelebration({title:`Поздравляем! Level ${analysis.level}`,message:`Вы получили +${analysis.xp} XP и перешли на новый уровень. Продолжайте в том же темпе!`,eyebrow:'НОВЫЙ УРОВЕНЬ'});else if(analysis.newAchievements?.length)setCelebration({title:analysis.newAchievements[0],message:analysis.motivation,eyebrow:'ДОСТИЖЕНИЕ ОТКРЫТО'}); }
    } catch (reason) { if(sessionRef.current)await api(`/sessions/${sessionRef.current}`,{method:'DELETE'}).catch(()=>{});setError(reason instanceof Error ? reason.message : 'Ошибка завершения сессии'); }
    finally { sessionRef.current = ''; }
  };
  const togglePause=async()=>{try{if(paused){await send('START');recordingRef.current=true;setPaused(false)}else{recordingRef.current=false;await send('STOP');const rest=bufferRef.current.splice(0);if(rest.length&&sessionRef.current)await api(`/sessions/${sessionRef.current}/samples`,{method:'POST',body:JSON.stringify({samples:rest})});setPaused(true)}}catch(reason){setError(reason instanceof Error?reason.message:'Не удалось изменить состояние записи')}};

  const latest = samples.at(-1);
  const empty: EegSample = { timestamp: new Date().toISOString(), attention: 0, meditation: 0, engagement: 0, focus: 0, relaxation: 0, blink: 0, signal: 0 };
  const display = samples.length ? samples : [empty];
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return <>
    {countdown!==null&&<div className="eeg-countdown" role="status"><div key={countdown}>{countdown}</div><b>{countdown===1?'Начинаем':'Расслабьтесь и не двигайтесь'}</b><span>Сигнал откалиброван</span></div>}
    {celebration&&<CelebrationOverlay {...celebration} onClose={()=>setCelebration(null)}/>} 
    <div className="page-head"><div><span>{running ? '● LIVE · СОХРАНЕНИЕ ВКЛЮЧЕНО' : 'ЛИЧНАЯ EEG-СЕССИЯ'}</span><h1>Нейромониторинг</h1><p>Ученик подключает ESP32 самостоятельно. Результат автоматически становится доступен учителю.</p></div><div className="page-actions"><button className={running ? 'danger-button' : 'primary'} disabled={connecting} onClick={running ? stop : start}>{connecting ? <RefreshCw className="spin"/> : running ? <Circle/> : <Radio/>}{connecting ? phase : running ? `Завершить · ${time}` : device?'Начать сессию':'Подключить и начать'}</button></div></div>
    {error && <div className="api-error">{error}</div>}
    {firmwareWarning&&<div className="firmware-warning"><Cpu/><span><b>Проверьте прошивку</b><small>{firmwareWarning}</small></span><button onClick={()=>setFirmwareWarning('')}><X/></button></div>}
    {goalReached&&<div className="session-milestone"><div><Check/></div><span><b>Цель занятия выполнена!</b><small>{goalMinutes} минут сфокусированной работы · можно завершить или продолжить</small></span><Sparkles/></div>}
    {result&&<div className="session-result"><button onClick={()=>setResult(null)}><X/></button><div><Check/></div><span><small>АНАЛИЗ ГОТОВ · СИГНАЛ {result.dataQuality?.toUpperCase()}</small><h2>{result.score}% когнитивной эффективности</h2><p>Стабильность внимания {result.stability}% · усталость {result.fatigue}% · сигнал {result.signal}%</p><em>{result.adaptedTasks?`Недельный план обновлён: ${result.adaptedTasks} нейро-задач адаптировано под Live EEG.`:result.planId?'Недельный план создан по Live EEG и уже доступен в «Мой план».':result.motivation}</em></span><strong><Award/> +{result.xp} XP · Level {result.level}</strong><Sparkles className="result-spark"/></div>}
    {!running&&!connecting&&<div className="session-plan"><span><small>ПОДКЛЮЧЕНИЕ</small><div><button className="active"><Bluetooth/>{device?'Bluetooth подключён':'Bluetooth Low Energy'}</button></div></span><span><small>ТЕМА ЗАНЯТИЯ</small><input value={subject} maxLength={120} onChange={event=>setSubject(event.target.value)} placeholder="Например, Подготовка к математике"/></span><span><small>ЦЕЛЬ ПО ВРЕМЕНИ</small><div>{[10,20,30,45].map(value=><button className={goalMinutes===value?'active':''} key={value} onClick={()=>setGoalMinutes(value)}>{value} мин</button>)}</div></span><p><ShieldCheck/> Подключение единое для всей платформы. После анализа ESP32 останется подключённым для следующей сессии.</p></div>}
    {running&&<div className="session-goal"><span><b>{subject}</b><small>{seconds<goalMinutes*60?`До цели ${Math.ceil((goalMinutes*60-seconds)/60)} мин`:'Цель занятия выполнена'}</small></span><i><em style={{width:`${Math.min(100,seconds/(goalMinutes*60)*100)}%`}}/></i><strong>{Math.min(100,Math.round(seconds/(goalMinutes*60)*100))}%</strong></div>}
    {running&&<div className="session-controls"><button className={paused?'resume-control':'pause-control'} onClick={togglePause}>{paused?<Play fill="currentColor"/>:<Pause/>}{paused?'Продолжить запись':'Пауза'}</button><button className="focus-mode-toggle" onClick={()=>setFocusMode(!focusMode)}>{focusMode?<Minimize2/>:<Maximize2/>}{focusMode?'Обычный режим':'Режим фокуса'}<kbd>Esc</kbd></button></div>}
    <div className="live-status"><span><i className={running&&!paused ? 'pulse' : ''}/>{paused?'Запись приостановлена':running ? 'Запись в PostgreSQL' : device?'Устройство готово':'Ожидание устройства'}</span><span><Wifi/> Сигнал {Math.round(latest?.signal || 0)}%</span><span><Bluetooth/> {device ? `${device.serialNumber} · v${device.firmware}` : 'Bluetooth Low Energy'}</span></div>
    {running&&latest&&latest.signal<40&&<div className="signal-warning"><Wifi/><span><b>Низкое качество сигнала</b><small>Проверьте контакт электродов, общий GND и неподвижность кабеля BioAmp EXG.</small></span></div>}
    <div className="live-metrics">{metrics.map(([name, key, color]) => <div className="live-metric" key={name}><span>{name}<i style={{background:color}}/></span><strong>{Math.round(latest?.[key] || 0)}<small>{name === 'Blink' ? ' / мин' : '%'}</small></strong><div className="metric-line"><ResponsiveContainer width="100%" height="100%"><LineChart data={display}><Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></div>)}</div>
    <section className="eeg-main-chart"><div className="chart-top"><div><h3><Activity/> Ваш EEG-поток</h3><p>{running ? `${samples.length} значений в текущем окне` : 'Здесь появятся только реальные данные BioAmp EXG'}</p></div></div><div className="eeg-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={display}><CartesianGrid vertical={false} stroke="#edf0f5"/><XAxis dataKey="timestamp" hide/><YAxis domain={[0,100]} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="attention" stroke="#7165e6" fill="#7165e615" strokeWidth={2.5}/><Line type="monotone" dataKey="engagement" stroke="#45b8dc" strokeWidth={2}/><Line type="monotone" dataKey="focus" stroke="#38bd88" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></section>
  </>;
}
