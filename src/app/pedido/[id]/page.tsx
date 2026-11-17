import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { METHOD_LABEL, STATUS_LABEL, tokenMatches } from '@/lib/orders';
import { mpEnabled } from '@/lib/mp';
import { money } from '@/lib/pricing';
import { PixBox, StatusWatcher } from './PixBox';

export const metadata: Metadata = { title: 'Pedido', robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  const o = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!o || !tokenMatches(o.accessToken, t)) notFound();

  const pending = o.status === 'PENDING';
  const demo = !mpEnabled();

  return (
    <section className="section order">
      <span className="mono muted">Pedido #{o.number} · {METHOD_LABEL[o.paymentMethod]}</span>
      <h1 className="section__title" style={{ fontSize: 'clamp(48px,9vw,120px)' }}>
        {o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED' ? 'Valeu! ✓' : o.status === 'CANCELED' ? 'Cancelado' : 'Quase lá.'}
      </h1>
      <p className={`status-pill status-${o.status.toLowerCase()}`}>{STATUS_LABEL[o.status]}</p>
      {o.trackingCode && <p style={{ marginTop: 12 }}>Rastreio: <b>{o.trackingCode}</b> — <a className="link-arrow" href={`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(o.trackingCode)}`} target="_blank" rel="noopener">acompanhar</a></p>}

      {pending && <StatusWatcher id={o.id} token={o.accessToken} />}

      {pending && o.paymentMethod === 'PIX' && o.pixQr && (
        <PixBox id={o.id} token={o.accessToken} code={o.pixQr} base64={o.pixQrBase64} amount={money(o.totalCents)} expiresAt={o.pixExpiresAt?.toISOString() ?? null} demo={demo} />
      )}
      {pending && o.paymentMethod !== 'PIX' && (
        <div style={{ margin: '24px 0' }}>
          <p style={{ marginBottom: 12 }}>Assim que o Mercado Pago confirmar o pagamento, esta página atualiza sozinha.</p>
          {o.mpCheckoutUrl && <a className="btn" href={o.mpCheckoutUrl}>Continuar pagamento</a>}
          {demo && <PixBox id={o.id} token={o.accessToken} code="" base64={null} amount={money(o.totalCents)} expiresAt={null} demo onlySimulate />}
        </div>
      )}
      {o.status === 'PAID' && <p style={{ margin: '16px 0', maxWidth: 560 }}>Pagamento confirmado. Vamos separar e enviar em até 2 dias úteis — o código de rastreio aparece aqui e chega no seu e-mail.</p>}
      {o.status === 'CANCELED' && <p style={{ margin: '16px 0' }}>Este pedido foi cancelado (pagamento não concluído). Os itens voltaram pro estoque.</p>}

      <div className="order-summary">
        <h4 className="mono">Itens</h4>
        {o.items.map((i) => (
          <div key={i.id} className="totals"><div><span>{i.qty}x {i.name} — {i.colorName} · {i.size}</span><span>{money(i.priceCents * i.qty)}</span></div></div>
        ))}
        <div className="totals" style={{ marginTop: 12 }}>
          <div><span>Subtotal</span><span>{money(o.subtotalCents)}</span></div>
          {o.discountCents > 0 && <div className="pix"><span>Desconto Pix</span><span>−{money(o.discountCents)}</span></div>}
          <div><span>Frete</span><span>{o.shippingCents ? money(o.shippingCents) : 'Grátis'}</span></div>
          <div className="grand"><span>Total</span><span>{money(o.totalCents)}</span></div>
        </div>
        <h4 className="mono" style={{ marginTop: 20 }}>Entrega</h4>
        <p className="small">{o.name}<br />{o.street}, {o.addressNumber}{o.complement ? ` — ${o.complement}` : ''}<br />{o.district && `${o.district} · `}{o.city}/{o.uf} · {o.cep}</p>
      </div>
      <br /><Link className="btn btn--ghost" href="/loja">Continuar comprando</Link>
    </section>
  );
}
