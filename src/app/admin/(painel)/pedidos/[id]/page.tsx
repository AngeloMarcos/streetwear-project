import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { METHOD_LABEL, STATUS_LABEL } from '@/lib/orders';
import { money } from '@/lib/pricing';
import { siteUrl } from '@/lib/config';
import { updateOrder } from '../../actions';

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  const o = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!o) notFound();
  const address = `${o.name}\n${o.street}, ${o.addressNumber}${o.complement ? ` — ${o.complement}` : ''}\n${o.district ? `${o.district} — ` : ''}${o.city}/${o.uf}\nCEP ${o.cep}`;
  const customerLink = `${siteUrl()}/pedido/${o.id}?t=${o.accessToken}`;
  const wa = o.phone ? `https://wa.me/55${o.phone.replace(/\D/g, '')}` : null;

  return (
    <>
      <p><Link href="/admin" className="link-arrow">← Pedidos</Link></p>
      <h1 className="section__title" style={{ margin: '16px 0' }}>Pedido #{o.number}</h1>
      {ok && <p className="admin-ok">Salvo ✓</p>}
      {o.notes && <pre className="admin-alert" style={{ whiteSpace: 'pre-wrap' }}>{o.notes}</pre>}

      <div className="admin-grid">
        <div className="panel">
          <h4 className="mono">Itens</h4>
          <table className="table">
            <tbody>
              {o.items.map((i) => <tr key={i.id}><td><b>{i.qty}x</b></td><td>{i.name} — {i.colorName}</td><td><b>{i.size}</b></td><td>{money(i.priceCents * i.qty)}</td></tr>)}
            </tbody>
          </table>
          <div className="totals" style={{ marginTop: 12 }}>
            <div><span>Subtotal</span><span>{money(o.subtotalCents)}</span></div>
            {o.discountCents > 0 && <div><span>Desconto Pix</span><span>−{money(o.discountCents)}</span></div>}
            <div><span>Frete</span><span>{money(o.shippingCents)}</span></div>
            <div className="grand"><span>Total</span><span>{money(o.totalCents)}</span></div>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            {METHOD_LABEL[o.paymentMethod]} · criado {o.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            {o.paidAt && <> · pago {o.paidAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</>}
            {o.mpPaymentId && <> · MP #{o.mpPaymentId}</>}
          </p>
        </div>

        <div className="panel">
          <h4 className="mono">Cliente e entrega</h4>
          <pre className="address">{address}</pre>
          <p className="small">{o.email}<br />CPF {o.cpf}{o.phone && <><br />{o.phone} {wa && <a className="link-arrow" href={wa} target="_blank" rel="noopener">WhatsApp</a>}</>}</p>
          <p className="small muted" style={{ marginTop: 8, wordBreak: 'break-all' }}>Link do cliente: {customerLink}</p>
        </div>

        <form className="panel" action={updateOrder.bind(null, o.id)}>
          <h4 className="mono">Atualizar</h4>
          <label className="field">Status
            <select name="status" defaultValue={o.status}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field">Código de rastreio<input name="trackingCode" defaultValue={o.trackingCode} placeholder="AA123456789BR" /></label>
          <label className="field">Observações internas<textarea name="notes" rows={3} defaultValue={o.notes} /></label>
          <button className="btn btn--block">Salvar</button>
          <p className="small muted">Cancelar devolve os itens ao estoque. Reembolsos são feitos no painel do Mercado Pago.</p>
        </form>
      </div>
    </>
  );
}
