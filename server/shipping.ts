import {Env,HttpError,configured,getDoc} from './firebase';
// Package facts come only from the stored catalog, never from the browser.
async function withPackageFacts(env:Env,items:{id:string;variant:string;qty:number}[]){
 if(!configured(env))return items;
 return Promise.all(items.map(async item=>{let p:any=null;try{p=await getDoc(env,'products/'+item.id);}catch(e){if(!(e instanceof HttpError&&e.status===404))throw e;}
  return {...item,...(p?Object.fromEntries(['weightKg','lengthCm','widthCm','heightCm'].filter(k=>Number.isFinite(p[k])).map(k=>[k,p[k]])):{})};}));
}
export function shippingItems(value:any):{id:string;variant:string;qty:number}[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>100)throw new HttpError(400,'Confira os itens para calcular o frete.');
 const result=new Map<string,{id:string;variant:string;qty:number}>();
 for(const item of value){
  if(!item||typeof item!=='object'||typeof item.id!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(item.id)||!Number.isInteger(item.qty)||item.qty<1||item.qty>1000)throw new HttpError(400,'Confira os itens para calcular o frete.');
  const variant=item.variant??'';
  if(typeof variant!=='string'||(variant&&!/^[a-zA-Z0-9-]{1,100}$/.test(variant)))throw new HttpError(400,'Variação inválida para o frete.');
  const key=item.id+':'+variant,qty=(result.get(key)?.qty||0)+item.qty;
  if(qty>1000)throw new HttpError(400,'Quantidade inválida para o frete.');
  result.set(key,{id:item.id,variant,qty});
 }
 return [...result.values()].sort((a,b)=>(a.id+':'+a.variant).localeCompare(b.id+':'+b.variant));
}
export async function shipping(env:Env,cep:string,items:any[]=[]){
 items=shippingItems(items);
 if(!env.SHIPPING_QUOTE_URL)return {cep,amount:18.90,simulated:true,label:'Simulação sem transportadora ou prazo de entrega.'};
 const endpoint=new URL(env.SHIPPING_QUOTE_URL);if(endpoint.protocol!=='https:')throw new HttpError(503,'O serviço de frete precisa usar HTTPS.');
 const r=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',...(env.SHIPPING_API_KEY?{Authorization:`Bearer ${env.SHIPPING_API_KEY}`}:{})},body:JSON.stringify({fromCep:'01001000',toCep:cep,items:await withPackageFacts(env,items)})});
 if(!r.ok)throw new HttpError(503,'O cálculo de frete está indisponível.');
 const d=await r.json() as any;
 if(!Number.isFinite(d.amount)||d.amount<0||typeof d.label!=='string')throw new HttpError(503,'O serviço de frete retornou um valor inválido.');
 return {cep,amount:Math.round(d.amount*100)/100,label:d.label,simulated:false};
}
