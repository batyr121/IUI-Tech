import { useEffect, useState } from 'react';
import { Bluetooth, Cpu, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';
import { api } from './api';
import { bluetoothManager, type BluetoothSnapshot } from './bluetoothManager';
import './device-connect-page.css';

export default function DeviceConnectPage(){
  const [connection,setConnection]=useState<BluetoothSnapshot>(bluetoothManager.getSnapshot());
  const [devices,setDevices]=useState<any[]>([]);
  const [historyError,setHistoryError]=useState('');
  const load=()=>api<{devices:any[]}>('/devices').then(response=>setDevices(response.devices)).catch(reason=>setHistoryError(reason.message));

  useEffect(()=>{
    void load();
    void bluetoothManager.restore();
    return bluetoothManager.subscribe(next=>{setConnection(next);if(next.connected)void load()});
  },[]);

  const toggle=async()=>{
    setHistoryError('');
    try{if(connection.connected)await bluetoothManager.disconnect();else await bluetoothManager.connect();await load()}
    catch(reason){setHistoryError(reason instanceof Error?reason.message:'Не удалось подключить устройство')}
  };
  const current=connection.device;
  const error=connection.error||historyError;

  return <>
    <div className="page-head"><div><span>ЛИЧНОЕ ОБОРУДОВАНИЕ</span><h1>Устройства</h1><p>Одно Bluetooth-подключение работает во всех разделах платформы.</p></div><div className="page-actions"><button className="primary" disabled={connection.connecting} onClick={toggle}>{connection.connecting?<RefreshCw className="spin"/>:current?<Wifi/>:<Bluetooth/>}{connection.connecting?'Поиск устройства...':current?'Отключить Bluetooth':'Подключить Bluetooth'}</button></div></div>
    {error&&<div className="api-error">{error}</div>}
    <div className="device-connect-layout"><section className={`device-ble-visual ${current?'online':''}`}><div className="ble-rings"><span/><span/><span/><div><Bluetooth/></div></div><h2>{current?current.name:'IUI NeuroBand рядом?'}</h2><p>{current?`${current.serialNumber} · ${current.sensorModel}`:'Включите ESP32 и выберите IUI NeuroBand в окне браузера. Повторное подключение при переходе между разделами не потребуется.'}</p><span className={`device-state ${current?'ready':''}`}><i/>{current?'Bluetooth подключён во всей платформе':'Ожидание подключения'}</span></section><section className="dash-card device-identity"><h3>Идентификация</h3><div><span>Device ID</span><b>{current?.serialNumber||'—'}</b></div><div><span>Версия прошивки</span><b>{current?.firmware||'—'}</b></div><div><span>Совместимость</span><b className={current?.firmwareStatus==='CURRENT'?'compatible':''}>{current?current.firmwareStatus==='CURRENT'?'Актуальна':current.firmwareStatus==='NEWER'?'Новая версия':'Требует обслуживания':'—'}</b></div><div><span>Подключение</span><b>{current?'Bluetooth LE':'—'}</b></div><div><span>Частота</span><b>{current?`${current.sampleRate} Hz`:'—'}</b></div></section></div>
    <h3 className="section-subtitle">Ранее зарегистрированные</h3><div className="device-history">{devices.length?devices.map(device=><article key={device.id}><div><Cpu/></div><span><b>{device.name}</b><small>{device.serialNumber}</small></span><span><b>v{device.firmware||'—'}</b><small>{device.firmwareStatus==='CURRENT'?'Актуальная версия':'Проверьте обновление'}</small></span><i className={device.status.toLowerCase()}>{current?.id===device.id?'CONNECTED':device.status}</i></article>):<div className="empty-state-small"><Bluetooth/><b>Устройств пока нет</b><span>Подключите IUI NeuroBand впервые.</span></div>}</div>
    <section className="info-banner"><ShieldCheck/><span><b>Подключили один раз — используйте везде</b><small>Открывайте Live EEG и другие разделы без повторного выбора устройства. Соединение закроется только по кнопке «Отключить», при выключении ESP32 или перезагрузке сайта.</small></span></section>
  </>;
}
