'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { ProductArt } from './ProductArt';
import { CartUpsell } from './Extras';
import { installments, money } from '@/lib/pricing';

export function CartDrawer() {
  const { lines, totals: t, config, open, setOpen, setQty } = useCart();
  const left = Math.max(0, config.freeShippingCents - t.subtotal);
  const n = installments(t.total, config);
  const close = () => setOpen(false);
  const saved = lines.reduce((s, l) => s + Math.max(0, (l.fullPriceCents ?? l.priceCents) - l.priceCents) * l.qty, 0);

  return (
    <>
      {open && <div className="overlay" onClick={close} />}
      <aside className={`drawer ${open ? 'is-open' : ''}`} aria-label="Carrinho" aria-hidden={!open}>
        <div className="drawer__head">
          <h3>Carrinho{lines.length > 0 && <span className="drawer__count"> ({lines.reduce((s, l) => s + l.qty, 0)})</span>}</h3>
          <button className="drawer__close" onClick={close} aria-label="Fechar carrinho">Fechar</button>
        </div>
        <div className="drawer__body">
          {!lines.length ? (
            <div className="empty">
              <p className="empty__title">Seu carrinho está vazio.</p>
              <p className="muted">Ele está esperando o próximo drop.</p>
              <Link className="btn" href="/loja?tag=novo" onClick={close}>Ver novidades</Link>
            </div>
          ) : (
            <>
              <div className="ship-bar">
                {left > 0 ? <>Faltam <b>{money(left)}</b> pro frete grátis</> : <b>Frete grátis liberado ✓</b>}
                <div className="ship-bar__track"><div className="ship-bar__fill" style={{ width: `${Math.min(100, (t.subtotal / config.freeShippingCents) * 100)}%` }} /></div>
              </div>
              {lines.map((l) => (
                <div className="line" key={l.variantId}>
                  <Link className="line__img" href={`/produto/${l.slug}`} onClick={close}><ProductArt product={l.art} /></Link>
                  <div>
                    <Link className="line__name" href={`/produto/${l.slug}`} onClick={close}>{l.name}</Link>
                    <div className="muted small">{l.colorName} · {l.size}</div>
                    <div className="qty">
                      <button onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Diminuir">−</button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="Aumentar">+</button>
                    </div>
                    <button className="remove" onClick={() => setQty(l.variantId, 0)}>Remover</button>
                  </div>
                  <div className="price">
                    {l.fullPriceCents && l.fullPriceCents > l.priceCents && <s className="price-old">{money(l.fullPriceCents * l.qty)}</s>}
                    {money(l.priceCents * l.qty)}
                  </div>
                </div>
              ))}
              <CartUpsell />
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer__foot">
            <div className="totals">
              {saved > 0 && <div className="bf-saved"><span>Economia Black Friday</span><span>−{money(saved)}</span></div>}
              <div><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
              <div><span>Frete</span><span>{t.shipping ? money(t.shipping) : 'Grátis'}</span></div>
              <div className="grand"><span>Total</span><span>{money(t.total)}</span></div>
              <div className="pix"><span>No Pix ({config.pixDiscountPercent}% off)</span><span>{money(t.pixTotal)}</span></div>
              <div className="muted small"><span>ou {n}x de {money(Math.round(t.total / n))} sem juros</span></div>
            </div>
            <Link className="btn btn--block" href="/checkout" onClick={close}>Finalizar compra · {money(t.total)}</Link>
            <p className="drawer__note">Pix, cartão em até {config.maxInstallments}x ou boleto · troca grátis em 30 dias</p>
          </div>
        )}
      </aside>
    </>
  );
}
