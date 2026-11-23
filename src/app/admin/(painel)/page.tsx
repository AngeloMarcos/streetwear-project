import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { METHOD_LABEL, STATUS_LABEL, releaseExpiredOrders } from '@/lib/orders';
import { mpEnabled } from '@/lib/mp';
import { money } from '@/lib/pricing';

const FILTERS: (OrderStatus | 'TODOS')[] = ['PAID', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'TODOS'];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  await releaseExpiredOrders();
  const { s = 'PAID', q = '' } = await searchParams;
  const status = FILTERS.includes(s as OrderStatus) ? s : 'PAID';
  const num = Number(q.replace('#', ''));

  const startDay = new Date(); startDay.setHours(0, 0, 0, 0);
  const startMonth = new Date(startDay); startMonth.setDate(1);
  const paidStatuses: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

  const [orders, today, month, toShip, lowStock] = await Promise.all([
    db.order.findMany({
      where: {
        ...(status === 'TODOS' ? {} : { status: status as OrderStatus }),
        ...(q ? { OR: [...(num ? [{ number: num }] : []), { name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { _count: { select: { items: true } } },
    }),
    db.order.aggregate({ where: { status: { in: paidStatuses }, paidAt: { gte: startDay } }, _sum: { totalCents: true }, _count: true }),
    db.order.aggregate({ where: { status: { in: paidStatuses }, paidAt: { gte: startMonth } }, _sum: { totalCents: true }, _count: true }),
    db.order.count({ where: { status: 'PAID' } }),
    db.variant.count({ where: { stock: { lte: 2 }, product: { active: true } } }),
  ]);

  return (
    <>
      {!mpEnabled() && <p className="admin-alert">⚠️ Mercado Pago não configurado — o checkout está <b>bloqueado</b> no ar (nenhum pedido entra). Preencha MP_ACCESS_TOKEN no .env.</p>}
      <div className="kpis">
        <div><span>Vendas hoje</span><b>{money(today._sum.totalCents ?? 0)}</b><small>{today._count} pedidos</small></div>
        <div><span>Vendas no mês</span><b>{money(month._sum.totalCents ?? 0)}</b><small>{month._count} pedidos</small></div>
        <div><span>Para enviar</span><b>{toShip}</b><small>pagos aguardando envio</small></div>
        <div><span>Estoque baixo</span><b>{lowStock}</b><small><Link href="/admin/produtos">tamanhos com ≤ 2</Link></small></div>
      </div>

      <div className="admin__bar">
        <div className="chips">
          {FILTERS.map((f) => (
            <Link key={f} className={`chip ${status === f ? 'is-active' : ''}`} href={`/admin?s=${f}`}>{f === 'TODOS' ? 'Todos' : STATUS_LABEL[f].split(' —')[0]}</Link>
          ))}
        </div>
        <form><input type="hidden" name="s" value="TODOS" /><input className="select" name="q" defaultValue={q} placeholder="Buscar nº, nome, e-mail" /></form>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Data</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/pedidos/${o.id}`}><b>#{o.number}</b></Link></td>
                <td>{o.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{o.name}<br /><span className="muted small">{o.city}/{o.uf}</span></td>
                <td>{o._count.items}</td>
                <td>{METHOD_LABEL[o.paymentMethod]}</td>
                <td>{money(o.totalCents)}</td>
                <td><span className={`status-pill status-${o.status.toLowerCase()}`}>{STATUS_LABEL[o.status].split(' —')[0]}</span></td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={7} className="muted">Nenhum pedido aqui.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
