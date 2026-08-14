import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Award, Check, Sparkles, X } from 'lucide-react';
import './celebration.css';

type CelebrationProps={title:string;message:string;eyebrow?:string;onClose:()=>void;autoClose?:number};
const colors=['#7568e8','#55bde0','#39b982','#f5b54b','#ef7391','#a16ce5'];

export default function CelebrationOverlay({title,message,eyebrow='НОВОЕ ДОСТИЖЕНИЕ',onClose,autoClose=6500}:CelebrationProps){
  useEffect(()=>{const timer=window.setTimeout(onClose,autoClose);return()=>window.clearTimeout(timer)},[autoClose,onClose]);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose]);
  return <div className="celebration-layer" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
    <div className="confetti-field" aria-hidden="true">{Array.from({length:42},(_,index)=><i key={index} style={{'--x':`${(index*37)%100}%`,'--delay':`${(index%9)*-.14}s`,'--duration':`${2.4+(index%6)*.18}s`,'--color':colors[index%colors.length],'--rotate':`${(index*53)%360}deg`} as CSSProperties}/>)}</div>
    <section className="celebration-card" onMouseDown={event=>event.stopPropagation()}>
      <button className="celebration-close" onClick={onClose} aria-label="Закрыть"><X/></button>
      <div className="celebration-halo"><span><Award/></span><i/><i/><i/></div>
      <small><Sparkles/>{eyebrow}</small><h2>{title}</h2><p>{message}</p>
      <button className="primary celebration-action" onClick={onClose}><Check/>Продолжить</button>
    </section>
  </div>;
}
