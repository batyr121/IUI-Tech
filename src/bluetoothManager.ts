import { api, requestBluetoothDevice, type DeviceHello, type EegSample } from './api';

export type BluetoothSnapshot={connected:boolean;connecting:boolean;device:any|null;error:string};
type Listener=(snapshot:BluetoothSnapshot)=>void;
type SampleListener=(sample:EegSample)=>void;

let snapshot:BluetoothSnapshot={connected:false,connecting:false,device:null,error:''};
let handle:any=null;
let rememberedDevice:any=null;
let connectionPromise:Promise<any>|null=null;
let recovering=false;
let heartbeat:number|undefined;
const listeners=new Set<Listener>();
const sampleListeners=new Set<SampleListener>();

const emit=()=>listeners.forEach(listener=>listener(snapshot));
const setSnapshot=(next:Partial<BluetoothSnapshot>)=>{snapshot={...snapshot,...next};emit()};
const stopHeartbeat=()=>{if(heartbeat)window.clearInterval(heartbeat);heartbeat=undefined};
const startHeartbeat=()=>{stopHeartbeat();heartbeat=window.setInterval(()=>{if(snapshot.device?.id)void api(`/devices/${snapshot.device.id}/heartbeat`,{method:'POST'}).catch(()=>{})},5000)};

const wait=(milliseconds:number)=>new Promise(resolve=>window.setTimeout(resolve,milliseconds));
const lost=async()=>{
  if(recovering||!handle)return;
  recovering=true;stopHeartbeat();setSnapshot({connected:false,connecting:true,error:'Восстанавливаем Bluetooth-соединение…'});
  for(let attempt=0;attempt<3;attempt++){
    try{await wait(500+attempt*400);await handle.reconnect();await handle.send('INFO');recovering=false;setSnapshot({connected:true,connecting:false,error:''});startHeartbeat();return}catch{}
  }
  const backendId=snapshot.device?.id;rememberedDevice=handle?.device||rememberedDevice;handle=null;connectionPromise=null;recovering=false;
  setSnapshot({connected:false,connecting:false,device:null,error:'Bluetooth-соединение потеряно. Включите ESP32 и нажмите подключение ещё раз.'});
  if(backendId)void api(`/devices/${backendId}/disconnect`,{method:'POST'}).catch(()=>{});
};

async function connect(){
  if(snapshot.connected&&snapshot.device)return snapshot.device;
  if(connectionPromise)return connectionPromise;
  setSnapshot({connecting:true,error:''});
  connectionPromise=new Promise(async(resolve,reject)=>{
    let completed=false;
    const timeout=window.setTimeout(()=>{if(completed)return;completed=true;void handle?.close();connectionPromise=null;setSnapshot({connecting:false,error:'Устройство не прислало Device ID'});reject(new Error('Устройство не прислало Device ID'))},7000);
    const onMeta=async(meta:DeviceHello)=>{
      if(completed)return;
      try{
        const response=await api<{device:any}>('/devices/connect',{method:'POST',body:JSON.stringify({deviceId:meta.deviceId,name:meta.name||'IUI NeuroBand',firmware:meta.firmware||'unknown',sensorModel:meta.sensor||'BioAmp EXG Pill',sampleRate:Number(meta.sampleRate)||250,baudRate:115200})});
        completed=true;window.clearTimeout(timeout);setSnapshot({connected:true,connecting:false,device:response.device,error:''});startHeartbeat();resolve(response.device);
      }catch(reason){completed=true;window.clearTimeout(timeout);await handle?.close();handle=null;rememberedDevice=null;connectionPromise=null;const message=reason instanceof Error?reason.message:'Не удалось зарегистрировать устройство';setSnapshot({connected:false,connecting:false,error:message});reject(new Error(message))}
    };
    try{handle=await requestBluetoothDevice(sample=>sampleListeners.forEach(listener=>listener(sample)),onMeta,()=>{void lost()},rememberedDevice);rememberedDevice=handle.device;await handle.send('INFO')}catch(reason){completed=true;window.clearTimeout(timeout);handle=null;connectionPromise=null;const message=reason instanceof Error?reason.message:'Не удалось подключиться по Bluetooth';setSnapshot({connected:false,connecting:false,error:message});reject(new Error(message))}
  });
  try{return await connectionPromise}finally{if(!snapshot.connecting)connectionPromise=null}
}

async function restore(){
  if(snapshot.connected&&snapshot.device)return snapshot.device;
  const bluetooth=(navigator as any).bluetooth;
  if(!bluetooth||typeof bluetooth.getDevices!=='function')return null;
  const authorized=await bluetooth.getDevices();
  const device=authorized.find((item:any)=>/^IUI\b/i.test(item.name||''));
  if(!device)return null;
  rememberedDevice=device;
  try{return await connect()}catch{return null}
}

async function disconnect(){
  const backendId=snapshot.device?.id;stopHeartbeat();const current=handle;handle=null;connectionPromise=null;
  if(backendId)await api(`/devices/${backendId}/disconnect`,{method:'POST'}).catch(()=>{});
  await current?.close();rememberedDevice=null;recovering=false;setSnapshot({connected:false,connecting:false,device:null,error:''});
}

const send=async(command:string)=>{if(!handle)throw new Error('Сначала подключите IUI NeuroBand по Bluetooth');try{await handle.send(command)}catch(reason){void lost();throw new Error('Bluetooth временно недоступен. Платформа переподключается автоматически.',{cause:reason})}};
const subscribe=(listener:Listener)=>{listeners.add(listener);listener(snapshot);return()=>{listeners.delete(listener)}};
const subscribeSamples=(listener:SampleListener)=>{sampleListeners.add(listener);return()=>{sampleListeners.delete(listener)}};

export const bluetoothManager={connect,restore,disconnect,send,subscribe,subscribeSamples,getSnapshot:()=>snapshot};
