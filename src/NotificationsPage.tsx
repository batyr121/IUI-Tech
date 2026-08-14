import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Bell, Brain, Check, Cpu, FileText, RefreshCw, Sparkles } from 'lucide-react';
import { api } from './api';
import './notifications-page.css';

const navigate=(page:string)=>{const button=[...document.querySelectorAll<HTMLButtonElement>('.app-side nav button')].find(item=>item.textContent?.includes(page));button?.click()};

export default function NotificationsPage(){
  const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[read,setRead]=useState<Set<string>>(()=>new Set(JSON.parse(localStorage.getItem('iui-read-notifications')||'[]'))),[error,setError]=useState('');
  const load=()=>{setLoading(true);setError('');api<{notifications:any[]}>('/notifications').then(response=>setItems(response.notifications)).catch(reason=>setError(reason.message)).finally(()=>setLoading(false))};
  useEffect(()=>{load()},[]);
  const persist=(next:Set<string>)=>{setRead(next);localStorage.setItem('iui-read-notifications',JSON.stringify([...next]))};
  const open=(item:any)=>{persist(new Set(read).add(item.id));if(item.action)navigate(item.action)};
  const markAll=()=>persist(new Set(items.map(item=>item.id)));
  return <><div className="page-head"><div><span>ЦЕНТР СОБЫТИЙ</span><h1>Уведомления</h1><p>Дневные задания, прогресс, подключения и готовые отчёты из актуальных данных платформы.</p></div><div className="page-actions"><button className="soft-button" onClick={load}><RefreshCw className={loading?'spin':''}/>Обновить</button><button className="primary" disabled={!items.length} onClick={markAll}><Check/>Прочитать все</button></div></div>{error&&<div className="api-error">{error}</div>}<section className="notification-stats"><div><Bell/><span><b>{items.length}</b><small>событий</small></span></div><div><Sparkles/><span><b>{items.filter(item=>!read.has(item.id)).length}</b><small>новых</small></span></div><div><Activity/><span><b>{items.filter(item=>item.type==='PROGRESS').length}</b><small>по обучению</small></span></div></section>{loading?<div className="notification-list">{[1,2,3,4].map(item=><div className="notification-skeleton" key={item}/>)}</div>:items.length?<div className="notification-list">{items.map(item=><button key={item.id} className={read.has(item.id)?'read':''} onClick={()=>open(item)}><div className={`notification-icon ${item.type.toLowerCase()}`}>{item.type==='DEVICE'?<Cpu/>:item.type==='PROGRESS'?<Sparkles/>:<FileText/>}</div><span><small>{item.type==='DEVICE'?'УСТРОЙСТВО':item.type==='PROGRESS'?'ЛИЧНЫЙ ПРОГРЕСС':'AI-АНАЛИТИКА'}</small><b>{item.title}</b><p>{item.message}</p></span><time>{new Date(item.createdAt).toLocaleString('ru-RU')}</time>{!read.has(item.id)&&<i/>}<ArrowRight className="notification-arrow"/></button>)}</div>:<div className="empty-analytics"><Brain/><h2>Новых событий нет</h2><p>Здесь появятся дневные задания, подключения учеников и готовые отчёты.</p></div>}</>;
}
