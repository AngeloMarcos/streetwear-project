import Link from 'next/link';
import { db } from '@/lib/db';
import { markAlertsNotified } from '../actions';

/** Pedidos de "avise-me quando chegar", agrupados por produto e tamanho */
export default async function StockAlerts() {
  const alerts = await db.stockAlert.findMany({
    where: { notifiedAt: null },
    include: { variant: { include: { product: { select: { id: true, name: true, colorName: true, slug: true } } } } },
    orderBy: { createdAt: 'asc' },
    take: 2000,
  });
  const groups = new Map<string, typeof alerts>();
  for (const a of alerts) groups.set(a.variantId, [...(groups.get(a.variantId) ?? []), a]);
  const rows = [...groups.values()].sort((a, b) => b.length - a.length);

  return (
    <>
      <div className="admin__bar"><h1 className="section__title">Avise-me ({alerts.length})</h1></div>
      <p className="muted" style={{ marginBottom: 16 }}>Clientes esperando um tamanho esgotado. Quando repor o estoque, copie os e-mails, mande o aviso e clique em “Marcar como avisados”.</p>
      {!rows.length && <p className="muted">Ninguém esperando reposição agora.</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Produto</th><th>Tamanho</th><th>Estoque</th><th>Pedidos</th><th>E-mails</th><th /></tr></thead>
          <tbody>
            {rows.map((g) => {
              const v = g[0].variant;
              return (
                <tr key={v.id}>
                  <td><Link href={`/admin/produtos/${v.product.id}`}>{v.product.name}</Link><div className="small muted">{v.product.colorName}</div></td>
                  <td>{v.size}</td>
                  <td>{v.stock > 0 ? <b style={{ color: 'var(--ok)' }}>{v.stock} — pode avisar</b> : 0}</td>
                  <td>{g.length}</td>
                  <td><textarea readOnly rows={2} className="small" style={{ width: 240 }} defaultValue={g.map((a) => a.email).join(', ')} /></td>
                  <td><form action={markAlertsNotified.bind(null, v.id)}><button className="chip">Marcar como avisados</button></form></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
