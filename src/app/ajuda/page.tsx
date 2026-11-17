import type { Metadata } from 'next';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { site } from '@/content/site';
import { GUIDES } from '@/lib/sizes';

export const metadata: Metadata = { title: 'Ajuda' };

export default function Ajuda() {
  return (
    <section className="section help">
      <h1 className="section__title" style={{ fontSize: 'clamp(56px,10vw,140px)' }}>Ajuda</h1>
      <h2 id="envio">Envio e prazos</h2>
      <p>Enviamos para todo o Brasil pelos Correios em até 2 dias úteis após a confirmação do pagamento. Frete grátis acima de {money(shopConfig.freeShippingCents)}; abaixo disso, {money(shopConfig.shippingCents)}. Você recebe o código de rastreio por e-mail.</p>
      <h2 id="trocas">Trocas e devoluções</h2>
      <p>A primeira troca é grátis em até 30 dias após o recebimento. Pelo Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias após receber o pedido, com reembolso integral. A peça deve estar sem uso e com etiqueta. Fale com a gente pelo WhatsApp com o número do pedido.</p>
      <h2 id="medidas">Tabela de medidas</h2>
      <p>Medidas da peça estendida, com variação de até 2 cm.</p>
      {Object.values(GUIDES).map((g) => (
        <div key={g.title} className="help__guide">
          <h3>{g.title}</h3>
          <p className="small muted">{g.fit}</p>
          <table className="size-table">
            <thead><tr>{g.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{g.rows.map(([s, ...v]) => <tr key={s}><th>{s}</th>{v.map((n, i) => <td key={i}>{n}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ))}
      <h2>Pagamento</h2>
      <p>Pix com {shopConfig.pixDiscountPercent}% de desconto (aprovação na hora), cartão de crédito em até {shopConfig.maxInstallments}x sem juros e boleto. Pagamentos processados com segurança pelo Mercado Pago — a loja não armazena dados de cartão.</p>
      <p><a className="link-arrow" href={site.social.whatsapp} target="_blank" rel="noopener">Falar no WhatsApp →</a></p>
    </section>
  );
}
