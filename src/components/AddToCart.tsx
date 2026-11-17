'use client';

import { useState } from 'react';
import type { ProductDTO } from '@/lib/products';
import { useCart } from './CartProvider';
import { NotifyMe, SizeGuide, StickyBuy } from './Extras';

export function AddToCart({ p, apparel }: { p: ProductDTO; apparel: boolean }) {
  const { add, setOpen, toast } = useCart();
  const single = p.sizes.length === 1 && p.sizes[0].available ? p.sizes[0].id : null;
  const [variant, setVariant] = useState<string | null>(single);
  const soldOut = p.sizes.every((s) => !s.available);

  return (
    <>
      <div>
        <div className="label-row">
          <span>Tamanho</span>
          {apparel && <SizeGuide type={p.type} />}
        </div>
        <div className="sizes">
          {p.sizes.map((s) => (
            <button key={s.id} className={`size ${variant === s.id ? 'is-active' : ''}`} disabled={!s.available} title={s.available ? undefined : 'Esgotado'}
              aria-pressed={variant === s.id} onClick={() => setVariant(s.id)}>{s.size}</button>
          ))}
        </div>
        {variant && (() => { const s = p.sizes.find((x) => x.id === variant); return s && s.stock <= 3 ? <p className="small" style={{ color: 'var(--accent)', marginTop: 6 }}>Só {s.stock} {s.stock === 1 ? 'peça' : 'peças'} nesse tamanho</p> : null; })()}
      </div>
      <button id="comprar" className="btn btn--block" disabled={soldOut} onClick={() => {
        if (!variant) { toast('Escolhe um tamanho primeiro'); return; }
        add(p, variant);
        setOpen(true);
      }}>
        {soldOut ? 'Esgotado' : variant ? 'Adicionar ao carrinho' : 'Selecione um tamanho'}
      </button>
      <NotifyMe p={p} />
      <StickyBuy p={p} targetId="comprar" />
    </>
  );
}

export function ShopTheLook({ products }: { products: ProductDTO[] }) {
  const { add, setOpen, toast } = useCart();
  return (
    <button className="btn" onClick={() => {
      let added = 0;
      for (const p of products) {
        const pick = p.sizes.find((s) => s.available && ['M', '40', 'Único', '8.25"'].includes(s.size)) ?? p.sizes.find((s) => s.available);
        if (pick) { add(p, pick.id, 1, { silent: true }); added++; }
      }
      if (added) { setOpen(true); toast('Look adicionado (tamanhos padrão — ajuste no carrinho)'); } else toast('Look esgotado');
    }}>Comprar o look</button>
  );
}
