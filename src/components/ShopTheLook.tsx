'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ProductDTO } from '@/lib/products';
import { money } from '@/lib/pricing';
import { useCart } from './CartProvider';
import { ProductArt } from './ProductArt';

/** "Monte o look" (Kith): composição das peças + lista com tamanho e um botão que leva tudo */
export function ShopTheLook({ title, text, bg, products }: { title: string; text: string; bg: string; products: ProductDTO[] }) {
  const { add, setOpen, toast } = useCart();
  const firstFree = (p: ProductDTO) => (p.sizes.length === 1 ? p.sizes[0].available ? p.sizes[0].id : '' : '');
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(products.map((p) => [p.id, firstFree(p)])));
  const total = products.reduce((s, p) => s + p.priceCents, 0);
  const missing = products.filter((p) => p.sizes.some((s) => s.available) && !picked[p.id]);

  const addAll = () => {
    if (missing.length) { toast(`Escolha o tamanho: ${missing.map((p) => p.name).join(', ')}`); return; }
    products.forEach((p) => picked[p.id] && add(p, picked[p.id], 1, { silent: true }));
    setOpen(true);
  };

  return (
    <section className="stl">
      <div className="stl__stage" style={{ background: bg }}>
        {products.map((p, i) => (
          <Link key={p.id} href={`/produto/${p.slug}`} className={`stl__piece stl__piece--${i}`} aria-label={p.name}>
            <ProductArt product={p} bare />
            <span className="stl__pin">{i + 1}</span>
          </Link>
        ))}
      </div>
      <div className="stl__panel">
        <h2 className="section__title">{title}</h2>
        <p className="muted">{text}</p>
        <ol className="stl__list">
          {products.map((p, i) => {
            const out = !p.sizes.some((s) => s.available);
            return (
              <li key={p.id}>
                <span className="stl__n">{i + 1}</span>
                <Link href={`/produto/${p.slug}`} className="stl__name">{p.name}<span className="muted small">{p.colorName}</span></Link>
                <span className="stl__price">{money(p.priceCents)}</span>
                {out ? <span className="small muted">Esgotado</span> : p.sizes.length > 1 ? (
                  <select className="select" aria-label={`Tamanho de ${p.name}`} value={picked[p.id]} onChange={(e) => setPicked({ ...picked, [p.id]: e.target.value })}>
                    <option value="">Tamanho</option>
                    {p.sizes.map((s) => <option key={s.id} value={s.id} disabled={!s.available}>{s.size}{s.available ? '' : ' (esgotado)'}</option>)}
                  </select>
                ) : <span className="small muted">Tamanho único</span>}
              </li>
            );
          })}
        </ol>
        <div className="stl__foot">
          <span>Look completo <b>{money(total)}</b></span>
          <button className="btn" onClick={addAll}>Adicionar o look ao carrinho</button>
        </div>
      </div>
    </section>
  );
}
