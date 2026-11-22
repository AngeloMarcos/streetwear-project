'use client';

import Link from 'next/link';
import type { ProductDTO } from '@/lib/products';
import { money, pixPrice } from '@/lib/pricing';
import { ProductArt } from './ProductArt';
import { useCart } from './CartProvider';

export function ProductCard({ p }: { p: ProductDTO }) {
  const { add, config } = useCart();
  const available = p.sizes.filter((s) => s.available).length;
  const soldOut = available === 0;
  return (
    <article className="card">
      <Link href={`/produto/${p.slug}`} className="card__img" aria-label={`${p.name} ${p.colorName}`}>
        <div className="badges">
          {p.offPercent > 0 && <span className="badge badge--bf">−{p.offPercent}%</span>}
          {soldOut && <span className="badge badge--dark">Esgotado</span>}
          {!soldOut && available < p.sizes.length && <span className="badge">Últimas peças</span>}
        </div>
        <ProductArt product={p} />
        <ProductArt product={p} view={1} />
      </Link>
      {!soldOut && (
        <div className="quick-add" aria-label="Adicionar rápido">
          {p.sizes.map((s) => (
            <button key={s.id} disabled={!s.available} onClick={() => add(p, s.id)}>{s.size}</button>
          ))}
        </div>
      )}
      <div>
        <Link href={`/produto/${p.slug}`} className="card__name">
          {p.name}
          {!soldOut && p.tags.includes('novo') && <span className="card__new"> Novo</span>}
          {p.tags.includes('collab') && <span className="card__new card__new--collab"> Collab</span>}
        </Link>
        <div className="card__meta">{p.colorName}</div>
      </div>
      <div>
        {p.offPercent > 0 && <><s className="price-old">{money(p.fullPriceCents)}</s>{' '}</>}
        <span className={`price ${p.offPercent > 0 ? 'price--bf' : ''}`}>{money(p.priceCents)}</span>{' '}
        <span className="price-pix">· {money(pixPrice(p.priceCents, config))} no Pix</span>
      </div>
    </article>
  );
}
