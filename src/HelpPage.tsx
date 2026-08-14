import { useState } from 'react';
import { Bluetooth, BookOpen, ChevronDown, Cpu, Globe, LifeBuoy, Mail, ShieldCheck, Wifi } from 'lucide-react';
import './help-page.css';

const questions=[
  ['Почему браузер не видит IUI NeuroBand по Bluetooth?','Используйте Chrome или Edge на ноутбуке либо Chrome на Android. Убедитесь, что ESP32 включён и находится рядом. На опубликованном сайте требуется HTTPS.'],
  ['Нужно ли заранее сопрягать ESP32 в настройках системы?','Нет. Не подключайте устройство через системное меню Bluetooth. Нажмите «Подключить» внутри IUI Technology и выберите IUI NeuroBand в окне браузера.'],
  ['Нужно ли подключаться заново в каждом разделе?','Нет. Подключите IUI NeuroBand один раз в «Устройствах» или Live EEG. Соединение сохранится при переходах внутри платформы и после завершения анализа.'],
  ['Что делать, если Bluetooth отключился?','Включите ESP32, вернитесь в «Устройства» или Live EEG и подключитесь снова. Незавершённая запись будет безопасно отменена.'],
  ['Что делать при низком качестве сигнала?','Проверьте общий GND, контакт электродов, GPIO34 и неподвижность проводов. Во время трёхсекундной калибровки оставайтесь расслабленными.'],
  ['Кто видит данные ученика?','Ученик видит только собственные данные. Учитель видит учеников своей организации. Родитель получает доступ только после персонального приглашения преподавателя.'],
  ['Это медицинская диагностика?','Нет. Метрики являются образовательными индикаторами и не предназначены для постановки медицинских диагнозов.'],
];

export default function HelpPage(){
  const [open,setOpen]=useState(0);
  return <>
    <div className="page-head"><div><span>ЦЕНТР ПОДДЕРЖКИ</span><h1>Помощь</h1><p>Bluetooth, ESP32, BioAmp EXG, приватность и EEG-сессии.</p></div><div className="page-actions"><a className="primary" href="mailto:support@iui.technology"><Mail/>Написать в поддержку</a></div></div>
    <section className="help-quick"><article><Bluetooth/><span><b>Bluetooth LE</b><small>Основное беспроводное подключение</small></span></article><article><Cpu/><span><b>BioAmp EXG</b><small>OUT → GPIO34 · общий GND</small></span></article><article><ShieldCheck/><span><b>Приватность</b><small>Доступ строго по ролям</small></span></article></section>
    <div className="help-layout"><section className="help-faq"><h3>Частые вопросы</h3>{questions.map((item,index)=><button className={open===index?'open':''} key={item[0]} onClick={()=>setOpen(open===index?-1:index)}><span><b>{item[0]}</b><ChevronDown/></span>{open===index&&<p>{item[1]}</p>}</button>)}</section><aside><div className="help-orb"><LifeBuoy/></div><h3>Подключение по Bluetooth</h3><ol><li><Globe/>Откройте Chrome или Edge</li><li><Wifi/>Включите ESP32 рядом с ноутбуком</li><li><Bluetooth/>Нажмите «Подключить Bluetooth»</li><li><BookOpen/>Выберите IUI NeuroBand</li><li><ShieldCheck/>Переходите между разделами без переподключения</li></ol><p>Системное сопряжение не требуется: разрешение Bluetooth выдаётся прямо сайту в окне браузера.</p></aside></div>
  </>;
}
