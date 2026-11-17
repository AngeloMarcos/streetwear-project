import Link from 'next/link';
import { db } from '@/lib/db';
import { CATEGORIES, TYPES } from '@/lib/config';
import { money } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';

export default async function AdminProducts() {
  const products = await db.product.findMany({ include: { variants: { orderBy: { sort: 'asc' } } }, orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }] });
  const now = new Date();
  return (
    <>
      <div className="admin__bar">
        <h1 className="section__title">Produtos</h1>
        <Link className="btn" href="/admin/produtos/novo">+ Novo produto</Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th></th><th>Produto</th><th>Tipo</th><th>Preço</th><th>Estoque por tamanho</th><th>Status</th></tr></thead>
          <tbody>
            {products.map((p) => {
              const total = p.variants.reduce((s, v) => s + v.stock, 0);
              const state = !p.active ? 'Inativo' : p.dropAt && p.dropAt > now ? `Drop ${p.dropAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}` : total === 0 ? 'Esgotado' : 'À venda';
              return (
                <tr key={p.id}>
                  <td style={{ width: 56 }}><div className="thumb"><ProductArt product={p} /></div></td>
                  <td><Link href={`/admin/produtos/${p.id}`}><b>{p.name}</b></Link><br /><span className="muted small">{p.colorName}</span></td>
                  <td>{TYPES[p.type]?.label}<br /><span className="muted small">{CATEGORIES[p.category]}</span></td>
                  <td>{money(p.priceCents)}</td>
                  <td>
                    <div className="stock-chips">
                      {p.variants.map((v) => <span key={v.id} className={v.stock === 0 ? 'out' : v.stock <= 2 ? 'low' : ''}>{v.size}: {v.stock}</span>)}
                    </div>
                  </td>
                  <td>{state}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
