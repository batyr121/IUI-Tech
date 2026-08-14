import { Bluetooth, Check, ChevronRight, Cpu, History, Info, ShieldCheck, Zap } from 'lucide-react';
import './firmware-page.css';
import './firmware-managed.css';

export default function FirmwarePage(){
  return <>
    <div className="page-head">
      <div>
        <span>ESP32 SOFTWARE</span>
        <h1>Версия прошивки</h1>
        <p>Проверяйте актуальность программного обеспечения подключённых устройств.</p>
      </div>
      <div className="page-actions"><span className="firmware-managed"><ShieldCheck/>Обновляется командой IUI</span></div>
    </div>

    <section className="firmware-hero">
      <div className="firmware-chip"><Cpu/><i/><i/><i/><i/></div>
      <div>
        <span className="firmware-current"><Check/>АКТУАЛЬНАЯ ВЕРСИЯ</span>
        <h2>IUI NeuroBand Firmware <b>v1.2.0</b></h2>
        <p>Bluetooth LE · 250 Hz ADC · 10 Hz telemetry · автоматическая калибровка</p>
      </div>
      <div className="firmware-shield"><ShieldCheck/><span><b>Проверено</b><small>Совместимо с платформой</small></span></div>
    </section>

    <div className="firmware-grid">
      <section>
        <header><History/><span><h3>Что изменилось</h3><p>Версия 1.2.0</p></span></header>
        <ol className="flash-steps">
          <li><i><Check/></i><span><b>Автоматическая калибровка</b><small>Трёхсекундная настройка базовой линии сигнала</small></span></li>
          <li><i><Check/></i><span><b>Уникальный Device ID</b><small>Идентификация ESP32 при каждом подключении</small></span></li>
          <li><i><Check/></i><span><b>Контроль потока</b><small>Команды INFO, CALIBRATE, START и STOP</small></span></li>
          <li><i><Check/></i><span><b>Bluetooth Low Energy</b><small>Беспроводная передача EEG в Chrome или Edge</small></span></li>
        </ol>
      </section>

      <section>
        <header><Bluetooth/><span><h3>Подключение BioAmp EXG</h3><p>Справочная информация</p></span></header>
        <div className="wiring-list">
          <div><b>BioAmp VCC</b><ChevronRight/><strong>ESP32 3V3</strong></div>
          <div><b>BioAmp GND</b><ChevronRight/><strong>ESP32 GND</strong></div>
          <div><b>BioAmp OUT</b><ChevronRight/><strong>ESP32 GPIO34</strong></div>
        </div>
        <div className="firmware-alert"><Zap/><span><b>Используется ADC1</b><small>GPIO34 подходит для считывания сигнала BioAmp EXG.</small></span></div>
      </section>
    </div>

    <section className="firmware-update-note">
      <Info/>
      <span><b>Файл прошивки не распространяется через платформу</b><small>Если доступна новая версия, здесь появится уведомление. Установку выполняет команда IUI Technology во время обслуживания устройства.</small></span>
    </section>

    <section className="protocol-strip">
      <div><small>ТЕКУЩАЯ ВЕРСИЯ</small><b>v1.2.0</b></div>
      <div><small>СТАТУС</small><b>Актуальна</b></div>
      <div><small>ФОРМАТ</small><b>JSON Lines</b></div>
      <div><small>СОЕДИНЕНИЕ</small><b>Bluetooth LE</b></div>
    </section>
  </>;
}
