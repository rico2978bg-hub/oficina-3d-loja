import {Coupon,Product,unitPrice,couponDiscountCents} from '../src/data';
import {Env,HttpError,dbFetch,docData,documentWrite,transactionDoc,withTransaction} from './firebase';
import {auditWrite} from './audit';
import {couponCode} from './orders';
import {shippingItems} from './shipping';

const missing=async(env:Env,path:string)=>{try{return docData(await dbFetch(env,'/'+path));}catch(e){if(e instanceof HttpError&&e.status===404)return null;throw e;}};

// Preview only: prices come from the catalog, and the order recalculates everything in its own transaction.
export async function previewCoupon(env:Env,b:any){
 const code=couponCode(b?.code);if(!code)throw new HttpError(400,'Informe um cupom.');
 const items=shippingItems(b?.items);if(!items.length)throw new HttpError(400,'O carrinho está vazio.');
 let subtotalCents=0;
 for(const item of items){const p=await missing(env,'products/'+item.id) as Product|null;if(!p||p.demo)throw new HttpError(409,'Um produto do carrinho está indisponível.');subtotalCents+=Math.round(unitPrice(p,item.variant)*100)*item.qty;}
 const c=await missing(env,'coupons/'+code) as Coupon|null;if(!c)throw new HttpError(400,'Cupom inválido.');
 let discountCents:number;try{discountCents=couponDiscountCents(c,subtotalCents);}catch(e){throw new HttpError(400,(e as Error).message);}
 return {code,discount:discountCents/100,subtotal:subtotalCents/100};
}

export function validateCoupon(b:any):Coupon{
 const code=couponCode(b?.code);if(!code)throw new HttpError(400,'Informe o código do cupom.');
 if(!['percent','fixed'].includes(b.type))throw new HttpError(400,'Escolha o tipo de desconto.');
 const value=Number(b.value);if(!Number.isFinite(value)||value<=0||(b.type==='percent'&&value>=100)||value>1000000)throw new HttpError(400,'Informe um desconto válido (percentual abaixo de 100).');
 const c:Coupon={code,type:b.type,value,active:!!b.active,uses:0};
 if(b.minSubtotal!==undefined&&b.minSubtotal!==''&&b.minSubtotal!==null){const v=Number(b.minSubtotal);if(!Number.isFinite(v)||v<0)throw new HttpError(400,'Valor mínimo inválido.');if(v>0)c.minSubtotal=v;}
 if(b.maxUses!==undefined&&b.maxUses!==''&&b.maxUses!==null){const v=Number(b.maxUses);if(!Number.isSafeInteger(v)||v<1)throw new HttpError(400,'Limite de usos inválido.');c.maxUses=v;}
 if(b.expiresAt){const t=Date.parse(b.expiresAt);if(!Number.isFinite(t))throw new HttpError(400,'Data de validade inválida.');c.expiresAt=new Date(t).toISOString();}
 return c;
}

// Uses are owned by orders; the admin edit keeps the stored counter.
export async function saveCoupon(env:Env,input:any,actor:string){
 const c=validateCoupon(input),path='coupons/'+c.code;
 return withTransaction(env,async tx=>{
  const raw=await transactionDoc(env,path,tx);
  if(raw&&input.version!==raw.updateTime)throw new HttpError(409,'Este cupom já existe ou mudou. Recarregue o painel.');
  const data={...c,uses:raw?docData(raw).uses||0:0};
  return {writes:[documentWrite(env,path,data,raw),auditWrite(env,actor,'coupon.save',c.code)],result:data};
 });
}
