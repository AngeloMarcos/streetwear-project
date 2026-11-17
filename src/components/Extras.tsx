'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ProductDTO } from '@/lib/products';
import { money } from '@/lib/pricing';
import { guideFor } from '@/lib/sizes';
import { useCart } from './CartProvider';
import { EmailForm } from './Forms';
import { ProductArt } from './ProductArt';
import { ProductCard } from './ProductCard';

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
};

/** Botão flutuante do WhatsApp (canto inferior direito) */
export function WhatsAppButton({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;
  return (
    <a className="wa-float" href={href} target="_blank" rel="noopener" aria-label="Fale com a gente no WhatsApp">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden><path fill="currentColor" d="M16 3a13 13 0 00-11.2 19.6L3 29l6.6-1.7A13 13 0 1016 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1116 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 01-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 00-.9.4 3.6 3.6 0 00-1.1 2.7 6.3 6.3 0 001.3 3.3 14.4 14.4 0 005.5 4.9c2 .9 2.8.9 3.8.8a3.2 3.2 0 002.1-1.5 2.6 2.6 0 00.2-1.5c-.1-.2-.3-.3-.7-.5z" /></svg>
    </a>
  );
}

/** Pop-up de captura de e-mail: aparece uma vez, depois de alguns segundos navegando */
export function SignupPopup({ blackFriday, maxPercent }: { blackFriday: boolean; maxPercent: number }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const key = blackFriday ? 'bloco.popup.bf' : 'bloco.popup.news';
  const blocked = /^\/(admin|checkout|pedido)/.test(pathname);

  useEffect(() => {
    if (blocked || store.get(key)) return;
    const id = setTimeout(() => setShow(true), 12000);
    return () => clearTimeout(id);
  }, [blocked, key]);

  const close = () => { setShow(false); store.set(key, '1'); };
  if (!show || blocked) return null;
  return (
    <div className="popup" role="dialog" aria-modal="false" aria-label="Entrar na lista">
      <button className="icon-btn popup__close" onClick={close} aria-label="Fechar">✕</button>
      <span className="mono">{blackFriday ? 'Black Friday' : 'Lista BLOCO'}</span>
      <p className="popup__title">{blackFriday ? <>Até {maxPercent}% off.<br />Fica sabendo primeiro.</> : <>Drop toda quinta.<br />Fica sabendo antes.</>}</p>
      <p className="small">{blackFriday ? 'A gente manda o aviso no minuto em que a Black Friday abrir. Sem spam.' : 'Aviso de drop 1h antes de todo mundo. Sem spam, prometido.'}</p>
      <div onSubmit={() => setTimeout(close, 800)}>
        <EmailForm source={blackFriday ? 'black-friday' : 'popup'} placeholder="seu@email.com" button="Quero" className="popup__form" />
      </div>
    </div>
  );
}

/** Guarda o produto visto e mostra os anteriores ("Vistos recentemente") */
export function RecentlyViewed({ slug }: { slug: string }) {
  const [items, setItems] = useState<ProductDTO[]>([]);
  useEffect(() => {
    const prev: string[] = JSON.parse(store.get('bloco.vistos') || '[]');
    const others = prev.filter((s) => s !== slug).slice(0, 4);
    store.set('bloco.vistos', JSON.stringify([slug, ...others].slice(0, 8)));
    if (!others.length) return;
    fetch(`/api/produtos?slugs=${others.map(encodeURIComponent).join(',')}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setItems(d.products))
      .catch(() => {});
  }, [slug]);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="section__head"><h2 className="section__title">Vistos recentemente</h2></div>
      <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  );
}

/** "Avise-me quando chegar" para tamanhos esgotados */
export function NotifyMe({ p }: { p: ProductDTO }) {
  const { toast } = useCart();
  const out = p.sizes.filter((s) => !s.available);
  const [open, setOpen] = useState(false);
  const [variantId, setVariantId] = useState(out[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  if (!out.length) return null;
  return (
    <div className="notify">
      {!open ? (
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>Esgotou seu tamanho? Avise-me quando chegar</button>
      ) : (
        <form className="notify__form" onSubmit={async (e) => {
          e.preventDefault();
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
          setBusy(true);
          const r = await fetch('/api/avise-me', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, variantId }) }).catch(() => null);
          setBusy(false);
          if (r?.ok) { toast('Fechou! Te avisamos quando voltar.'); setOpen(false); } else toast('Não deu pra cadastrar. Confere o e-mail.');
        }}>
          <select className="select" value={variantId} onChange={(e) => setVariantId(e.target.value)} aria-label="Tamanho">
            {out.map((s) => <option key={s.id} value={s.id}>{s.size}</option>)}
          </select>
          <input name="email" type="email" required placeholder="seu@email.com" aria-label="E-mail" />
          <button className="btn" disabled={busy}>Avise-me</button>
        </form>
      )}
    </div>
  );
}

/** Barra fixa de compra no celular: aparece quando o botão principal sai da tela */
export function StickyBuy({ p, targetId }: { p: ProductDTO; targetId: string }) {
  const [visible, setVisible] = useState(false);
  const soldOut = p.sizes.every((s) => !s.available);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);
  return (
    <div className={`sticky-buy ${visible ? 'is-show' : ''}`} aria-hidden={!visible}>
      <div><b>{p.name}</b><span className={p.offPercent ? 'price--bf' : ''}>{money(p.priceCents)}</span></div>
      <button className="btn" tabIndex={visible ? 0 : -1} disabled={soldOut}
        onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
        {soldOut ? 'Esgotado' : 'Comprar'}
      </button>
    </div>
  );
}

/** "Leva junto": acessórios baratos dentro do carrinho */
export function CartUpsell() {
  const { lines, add, open } = useCart();
  const [items, setItems] = useState<ProductDTO[]>([]);
  const inCart = lines.map((l) => l.slug).join(',');
  const last = useRef('');
  useEffect(() => {
    if (!open || !lines.length || last.current === inCart) return;
    last.current = inCart;
    fetch(`/api/produtos?leva=1&exclude=${encodeURIComponent(inCart)}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setItems(d.products))
      .catch(() => {});
  }, [open, inCart, lines.length]);
  const list = items.filter((p) => !lines.some((l) => l.slug === p.slug));
  if (!lines.length || !list.length) return null;
  return (
    <div className="upsell">
      <h4 className="mono">Leva junto</h4>
      {list.map((p) => {
        const size = p.sizes.find((s) => s.available);
        return (
          <div className="upsell__item" key={p.id}>
            <Link href={`/produto/${p.slug}`} className="upsell__img"><ProductArt product={p} /></Link>
            <div><div className="small"><b>{p.name}</b></div><div className={`small ${p.offPercent ? 'price--bf' : ''}`}>{money(p.priceCents)}</div></div>
            {size && <button className="chip" onClick={() => add(p, size.id)}>+ Adicionar</button>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Tabela de medidas (janela) ---------- */

export function SizeGuide({ type }: { type: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const g = guideFor(type);
  return (
    <>
      <button type="button" className="link-btn" onClick={() => ref.current?.showModal()}>Tabela de medidas</button>
      <dialog ref={ref} className="modal" onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="modal__head">
          <h3>Tabela de medidas</h3>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => ref.current?.close()}>✕</button>
        </div>
        <p className="small">{g.fit}</p>
        <table className="size-table">
          <thead><tr>{g.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{g.rows.map(([s, ...v]) => <tr key={s}><th>{s}</th>{v.map((n, i) => <td key={i}>{n}</td>)}</tr>)}</tbody>
        </table>
        <p className="small muted">Medidas da peça estendida, com variação de até 2 cm. Compare com uma peça sua que veste bem.</p>
      </dialog>
    </>
  );
}

/* ---------- Compartilhar produto ---------- */
export function ShareButton({ title }: { title: string }) {
  const { toast } = useCart();
  return (
    <button type="button" className="link-btn" onClick={async () => {
      const url = window.location.href;
      if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* cancelou */ } return; }
      try { await navigator.clipboard.writeText(url); toast('Link copiado'); } catch { toast(url); }
    }}>Compartilhar</button>
  );
}
