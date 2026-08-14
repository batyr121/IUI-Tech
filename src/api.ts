export async function api<T>(path:string, options:RequestInit={}) {
  const safePath=path==='/dashboard'?'/v2/dashboard':path==='/reports'?'/v2/reports':path==='/device-status'?'/v2/device-status':path;
  const response=await fetch(`/api${safePath}`,{...options,credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{})}});
  if(response.status===204)return undefined as T;
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||'Ошибка соединения с сервером');
  return body as T;
}

export const authApi={
  me:()=>api<{user:any}>('/auth/me'),
  login:(data:{email:string,password:string})=>api<{user:any}>('/auth/login',{method:'POST',body:JSON.stringify(data)}),
  register:(data:any)=>api<{user:any}>('/auth/register',{method:'POST',body:JSON.stringify(data)}),
  logout:()=>api<void>('/auth/logout',{method:'POST'})
};

export type EegSample={timestamp:string;raw?:number;attention:number;meditation:number;engagement:number;focus:number;relaxation:number;blink:number;signal:number};
export function parseEspLine(line:string):EegSample|null {
  try {
    const value=JSON.parse(line);
    if(typeof value.attention!=='number'||typeof value.engagement!=='number'||typeof value.focus!=='number')return null;
    const clamp=(n:unknown,max=100)=>Math.max(0,Math.min(max,Number(n)||0));
    return {timestamp:new Date().toISOString(),raw:Number(value.raw)||undefined,attention:clamp(value.attention),meditation:clamp(value.meditation),engagement:clamp(value.engagement),focus:clamp(value.focus),relaxation:clamp(value.relaxation),blink:clamp(value.blink,255),signal:clamp(value.signal??value.signalQuality)};
  } catch { return null; }
}

export type DeviceHello={type:'hello';deviceId:string;firmware:string;name?:string;sensor?:string;sampleRate?:number};
export const IUI_BLE_SERVICE='7c8b1000-6f35-4f75-9c41-5f7e1c9a1000';
const IUI_BLE_TX='7c8b1001-6f35-4f75-9c41-5f7e1c9a1000';
const IUI_BLE_RX='7c8b1002-6f35-4f75-9c41-5f7e1c9a1000';

function processDeviceLine(line:string,onSample?:(sample:EegSample)=>void,onMeta?:(meta:DeviceHello)=>void){
  try{const message=JSON.parse(line.trim());if(message.type==='hello'&&message.deviceId){onMeta?.(message);return}}catch{}
  const sample=parseEspLine(line.trim());if(sample&&onSample)onSample(sample);
}

export async function requestBluetoothDevice(onSample?:(sample:EegSample)=>void,onMeta?:(meta:DeviceHello)=>void,onDisconnect?:()=>void,knownDevice?:any){
  const bluetooth=(navigator as any).bluetooth;
  if(!bluetooth)throw new Error('Web Bluetooth недоступен. Используйте Chrome или Edge на ноутбуке либо Android.');
  const device=knownDevice||await bluetooth.requestDevice({filters:[{services:[IUI_BLE_SERVICE]}],optionalServices:[IUI_BLE_SERVICE]});
  const decoder=new TextDecoder();let buffer='';
  const changed=(event:any)=>{buffer+=decoder.decode(event.target.value);const lines=buffer.split(/\r?\n/);buffer=lines.pop()||'';for(const line of lines)processDeviceLine(line,onSample,onMeta)};
  const disconnected=()=>onDisconnect?.();
  let tx:any=null;let rx:any=null;let setupPromise:Promise<void>|null=null;
  const setup=async()=>{
    if(device.gatt?.connected&&tx&&rx)return;
    if(setupPromise)return setupPromise;
    setupPromise=(async()=>{
      const server=await device.gatt?.connect();if(!server)throw new Error('Не удалось установить Bluetooth-соединение с ESP32.');
      const service=await server.getPrimaryService(IUI_BLE_SERVICE);
      const characteristics=await Promise.all([service.getCharacteristic(IUI_BLE_TX),service.getCharacteristic(IUI_BLE_RX)]);
      tx=characteristics[0];rx=characteristics[1];buffer='';
      tx.addEventListener('characteristicvaluechanged',changed);await tx.startNotifications();
    })();
    try{await setupPromise}finally{setupPromise=null}
  };
  device.addEventListener('gattserverdisconnected',disconnected);await setup();
  const send=async(text:string)=>{
    if(!device.gatt?.connected||!rx)await setup();
    const bytes=new TextEncoder().encode(`${text}\n`);
    try{if(typeof rx.writeValueWithoutResponse==='function')await rx.writeValueWithoutResponse(bytes);else await rx.writeValue(bytes)}
    catch(reason){if(device.gatt?.connected)throw reason;tx=null;rx=null;await setup();if(typeof rx.writeValueWithoutResponse==='function')await rx.writeValueWithoutResponse(bytes);else await rx.writeValue(bytes)}
  };
  return {transport:'bluetooth' as const,device,send,reconnect:setup,isConnected:()=>Boolean(device.gatt?.connected),close:async()=>{try{await tx?.stopNotifications()}catch{}tx?.removeEventListener('characteristicvaluechanged',changed);device.removeEventListener('gattserverdisconnected',disconnected);device.gatt?.disconnect();tx=null;rx=null}};
}
