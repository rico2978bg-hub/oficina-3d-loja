export const business = {
  name: 'Oficina 3D', owner: 'Fulano de Tal — proprietário', email: 'contato@example.com',
  phone: '(11) 90000-0000', whatsapp: '5511900000000', instagram: 'seu_perfil', tiktok: 'seu_perfil',
  address: 'Rua Exemplo, 100 — Centro, Cidade Exemplo/RS, CEP 01001-000',
  hours: 'segunda a sexta, das 9h às 18h', region: 'Região Sul do Brasil',
  about: 'A Oficina 3D transforma ideias em peças impressas em 3D. Estamos trabalhando para oferecer também impressoras e filamentos, ampliando as possibilidades de criação na nossa região.',
  difference: 'Nosso objetivo é aproximar o mundo 3D de você, com preços justos e variedade para tirar suas ideias do papel.',
  origin: 'https://previa.example.net',
};
export const whatsapp = (message = 'Olá! Vim pelo site da Oficina 3D e gostaria de saber mais.') => `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
export const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
export const categories = [
  { id: 'filamentos', name: 'Filamentos', subtitle: 'Cores para as suas ideias', kind: 'spool' },
  { id: 'impressoras', name: 'Impressoras 3D', subtitle: 'O próximo passo da criação', kind: 'printer' },
  { id: 'personalizados', name: 'Presentes e decoração', subtitle: 'Do seu jeito, em 3D', kind: 'vase' },
];
// Service entry point shown with the product categories; it is not a product category.
export const customPrintCard = { href: '/servicos', name: 'Impressões personalizadas', subtitle: 'Sua ideia, impressa sob medida', kind: 'printer' };
export type Product = {
  id: string; slug: string; name: string; category: string; price: number; stock: number; description: string;
  demo?: boolean; featured?: boolean; kind: string; color?: string; images?: string[]; sku?: string;
  specs?: Record<string,string>; variants?: { id: string; name: string; stock: number; price?: number }[];
  seoTitle?: string; seoDescription?: string; version?: string;
  // Optional catalog facts. Only the owner fills them in; nothing is inferred.
  shortDescription?: string; promoPrice?: number; brand?: string; material?: string;
  weightKg?: number; lengthCm?: number; widthCm?: number; heightCm?: number; createdAt?: string;
};
export type Coupon = { code: string; type: 'percent'|'fixed'; value: number; active: boolean; minSubtotal?: number; expiresAt?: string; maxUses?: number; uses?: number; version?: string };
// Single source of truth for the charged unit price (client display and server order).
export const onSale=(p:Product)=>!!p.promoPrice&&p.promoPrice>0&&p.promoPrice<p.price;
// A variant with its own price keeps it; otherwise a valid promotional price wins.
export const unitPrice=(p:Product,variant?:string)=>p.variants?.find(v=>v.id===variant)?.price??(onSale(p)?p.promoPrice!:p.price);
// Discount in cents, never above the subtotal. Shared by preview and order so both agree.
export function couponDiscountCents(c:Coupon,subtotalCents:number,now=Date.now()):number{
  if(!c.active)throw new Error('Este cupom não está ativo.');
  if(c.expiresAt&&Date.parse(c.expiresAt)<=now)throw new Error('Este cupom expirou.');
  if(c.maxUses&&(c.uses||0)>=c.maxUses)throw new Error('Este cupom atingiu o limite de usos.');
  if(c.minSubtotal&&subtotalCents<Math.round(c.minSubtotal*100))throw new Error(`Este cupom vale para compras a partir de ${money(c.minSubtotal)}.`);
  const raw=c.type==='percent'?Math.floor(subtotalCents*c.value/100):Math.round(c.value*100);
  return Math.max(0,Math.min(subtotalCents-1,raw));
}
export type CartItem = { id: string; variant: string; qty: number };
// Every seed value is fictional and MUST remain marked DEMO. Real mode never seeds these documents.
export const demoProducts: Product[] = [
  { id:'demo-azul', slug:'demo-filamento-azul', name:'Filamento azul', category:'filamentos', price:89.90, stock:12, demo:true, featured:true, kind:'spool', color:'#0c5ba0', description:'Produto de demonstração para visualizar o catálogo e testar o carrinho. Material, preço, estoque e imagens são ilustrativos; este item não está à venda.', variants:[{id:'azul',name:'Azul',stock:12}], specs:{'Tipo de imagem':'Ilustração de demonstração'} },
  { id:'demo-branco', slug:'demo-filamento-branco', name:'Filamento branco', category:'filamentos', price:89.90, stock:8, demo:true, featured:true, kind:'spool', color:'#e2e4e6', description:'Produto de demonstração para visualizar o catálogo. Preço e estoque fictícios; este item não está à venda.', variants:[{id:'branco',name:'Branco',stock:8}] },
  { id:'demo-impressora', slug:'demo-impressora-3d', name:'Impressora 3D', category:'impressoras', price:1499.90, stock:3, demo:true, featured:true, kind:'printer', color:'#0c5ba0', description:'Exemplo de apresentação de uma impressora 3D. Ilustração, preço e estoque fictícios. Modelo, marca e especificações reais serão informados no cadastro do produto.' },
  { id:'demo-vaso', slug:'demo-vaso-decorativo', name:'Vaso decorativo', category:'personalizados', price:49.90, stock:5, demo:true, featured:true, kind:'vase', color:'#a9bbc3', description:'Exemplo de um objeto decorativo impresso em 3D. Ilustração, preço e estoque fictícios. Para um item personalizado real, solicite um orçamento.' },
];
export const money = (amount: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(amount);
export const publicRoutes = ['/', '/produtos','/loja','/servicos','/sobre','/orcamento','/contato','/localizacao','/privacidade','/termos','/cookies','/devolucoes','/atendimento','/perguntas-frequentes','/entrega',...categories.map(c=>'/categoria/'+c.id)];
export type Initial = { path: string; query: string; products: Product[]; mode:'demo'|'configured'; paymentMode:'test'|'live'; checkoutEnabled?:boolean; user?: {uid:string;email:string;admin:boolean} | null; privacy?:string; banner?: string; origin?:string; catalogError?:boolean; analyticsId?:string; legalApproved?:boolean; terms?:string; returns?:string; controllerName?:string; controllerDocument?:string; privacyContact?:string; retentionPolicy?:string };
