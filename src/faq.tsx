import React from 'react';
import {business} from './data';
import {useShop} from './state';
import {Breadcrumb,PageHead,LinkButton,Icon} from './ui';

// Answers describe only how this site works and facts supplied by the company. No promises on deadlines or areas.
export const faq:[string,string][]=[
 ['O que a Oficina 3D vende?','Filamentos para impressão 3D, impressoras 3D, presentes e artigos de decoração impressos em 3D, além de impressões personalizadas sob orçamento. Os produtos disponíveis e seus preços estão na loja.'],
 ['Como solicito uma impressão 3D personalizada?','Acesse a página de orçamento, descreva o que você quer criar e, se tiver, envie um arquivo .stl ou uma imagem de referência. A Oficina 3D analisa o pedido e responde pelo contato informado. O envio da solicitação não confirma produção nem preço.'],
 ['Quais formas de pagamento são aceitas?','Os pagamentos são processados pelo Mercado Pago. Pix, cartão de crédito, débito e boleto aparecem no checkout conforme os meios habilitados na conta da Oficina 3D. A loja não recebe nem armazena os dados do seu cartão.'],
 ['Como é calculado o frete?','Informe o CEP no produto, no carrinho ou no checkout. O valor considera o destino e os produtos do carrinho e é exibido antes do pagamento. O CEP usado no cálculo precisa ser o mesmo do endereço de entrega.'],
 ['Como acompanho o meu pedido?','Entre em Minha conta para ver os seus pedidos e a situação do pagamento. Quando o pedido for enviado, o código de rastreamento aparece no próprio pedido.'],
 ['Posso usar cupom de desconto?','Sim, quando a Oficina 3D disponibilizar um cupom. Informe o código no carrinho; o desconto é conferido pelo servidor no momento do pedido.'],
 ['Como solicito troca, devolução ou cancelamento?','Registre a solicitação na página de atendimento e guarde o número de protocolo. A política de devoluções explica as etapas.'],
 ['Onde fica a Oficina 3D e qual o horário de atendimento?',`${business.address}. Atendimento ${business.hours}, na ${business.region}.`],
 ['Como falo com a Oficina 3D?',`Pelo WhatsApp ${business.phone}, pelo Direct do Instagram @${business.instagram} ou pelo e-mail ${business.email}.`],
];

export function FaqPage(){return <div className="container page"><Breadcrumb items={[{name:'Perguntas frequentes'}]}/><PageHead eyebrow="TIRE SUAS DÚVIDAS" title="Perguntas frequentes">Respostas rápidas sobre compras, orçamentos, frete e atendimento.</PageHead><div className="prose faq-list">{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div><div className="inline-callout"><div><h2>Não encontrou a sua resposta?</h2><p>Fale com a Oficina 3D.</p></div><LinkButton href="/contato">Entrar em contato<Icon name="arrow"/></LinkButton></div></div>;}

export function DeliveryPage(){const {initial}=useShop();return <div className="container page"><Breadcrumb items={[{name:'Política de entrega'}]}/><PageHead title="Política de entrega"/><div className="prose">{!initial.legalApproved&&<div className="form-notice"><strong>Minuta pendente de aprovação dos responsáveis.</strong> Transportadora, prazos de postagem, área de entrega e retirada local ainda aguardam definição da Oficina 3D.</div>}<section><h2>Cálculo do frete</h2><p>O frete é calculado pelo CEP de destino e pelos produtos do carrinho. Valor e modalidade são exibidos antes do pagamento. O CEP calculado precisa ser o mesmo do endereço de entrega.</p></section><section><h2>Envio</h2><p>Os pedidos são preparados depois da confirmação do pagamento pelo Mercado Pago. Os envios partem de Cidade Exemplo/RS.</p></section><section><h2>Rastreamento</h2><p>Quando o pedido é enviado, o código de rastreamento é registrado e aparece em Minha conta, no pedido correspondente.</p></section><section><h2>Problemas na entrega</h2><p>Em caso de atraso, avaria ou divergência, registre uma solicitação na <a href="/atendimento">página de atendimento</a> ou fale com a Oficina 3D pelo WhatsApp {business.phone}.</p></section></div></div>;}
