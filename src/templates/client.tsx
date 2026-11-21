'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ProductDTO } from '@/lib/products';
import { money, pixPrice } from '@/lib/pricing';
import { site } from '@/content/site';
import { CATEGORIES, TYPES } from '@/lib/config';
import { useCart } from '@/components/CartProvider';
import { ProductArt } from '@/components/ProductArt';
import { TEMPLATES, base, brandOf, productHref, type TplN } from './meta';

/** Barra de apresentação: troca de template mantendo a mesma página */
export function TplSwitcher({ n }: { n: TplN }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/template-\d/, '');
  return (
    <nav className="tpl-switch" aria-label="Escolher template">
      <span>Apresentação</span>
      {TEMPLATES.map((t) => (
        <Link key={t.n} href={`${base(t.n)}${rest}`} className={t.n === n ? 'is-on' : ''} title={t.hint}>
          {t.n} · {t.name}
        </Link>
      ))}
      <Link href="/">Site atual</Link>
    </nav>
  );
}

/** Topo de cada template: logo, menu e carrinho (o mesmo carrinho do site) */
export function TplHeader({ n, links }: { n: TplN; links: [string, string][] }) {
  const { count, setOpen } = useCart();
  return (
    <header className="tpl-head">
      <Link href={base(n)} className="tpl-logo" aria-label={`${site.fullName}: início`}>
        <span className="tpl-logo__mark" />{site.name}
      </Link>
      <nav className="tpl-nav" aria-label="Menu">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <button className="tpl-cart" onClick={() => setOpen(true)} aria-label={`Abrir carrinho (${count} itens)`}>
        Carrinho <b>{count}</b>
      </button>
    </header>
  );
}

/** Card de produto dos templates (link para a página de produto do mesmo template) */
export function TplCard({ p, n, big = false }: { p: ProductDTO; n: TplN; big?: boolean }) {
  const { config } = useCart();
  const soldOut = p.sizes.every((s) => !s.available);
  return (
    <Link href={productHref(n, p.slug)} className={`tpl-card ${big ? 'tpl-card--big' : ''}`}>
      <span className="tpl-card__img">
        <ProductArt product={p} />
        {p.offPercent > 0 && <span className="tpl-off">−{p.offPercent}%</span>}
        {p.offPercent === 0 && p.bfPercent > 0 && <span className="tpl-off tpl-off--soon">−{p.bfPercent}% na BF</span>}
        {soldOut && <span className="tpl-flag">Esgotado</span>}
      </span>
      <span className="tpl-card__name">{p.name}</span>
      <span className="tpl-card__meta">{p.colorName}</span>
      <span className="tpl-card__price">
        {p.offPercent > 0 && <s>{money(p.fullPriceCents)}</s>}
        <b>{money(p.priceCents)}</b>
      </span>
      <span className="tpl-card__pix">{money(pixPrice(p.priceCents, config))} no Pix</span>
    </Link>
  );
}

const PRICES: [string, (c: number) => boolean][] = [
  ['Qualquer preço', () => true],
  ['Até R$ 150', (c) => c <= 15000],
  ['R$ 150 a R$ 300', (c) => c > 15000 && c <= 30000],
  ['Acima de R$ 300', (c) => c > 30000],
];

/** Vitrine com busca e filtros (marca, tamanho, preço) fixos no topo */
export function TplGrid({ products, n, filters = true, chips = false }: { products: ProductDTO[]; n: TplN; filters?: boolean; chips?: boolean }) {
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState(0);
  const brands = useMemo(() => [...new Set(products.map(brandOf))], [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))], [products]);
  const list = products.filter((p) => {
    const term = q.trim().toLowerCase();
    if (term && !`${p.name} ${p.colorName} ${TYPES[p.type]?.plural ?? ''} ${CATEGORIES[p.category] ?? ''}`.toLowerCase().includes(term)) return false;
    if (brand && brandOf(p) !== brand) return false;
    if (size && !p.sizes.some((s) => s.size === size && s.available)) return false;
    return PRICES[price][1](p.priceCents);
  });
  const clear = () => { setQ(''); setBrand(''); setSize(''); setPrice(0); };

  return (
    <div className="tpl-shop">
      {chips && (
        <div className="tpl-chips" aria-label="Atalhos por tendência">
          <button className={q === '' ? 'is-on' : ''} onClick={() => setQ('')}>Tudo</button>
          {site.trends.map((t) => (
            <button key={t.label} className={q === t.label ? 'is-on' : ''} onClick={() => setQ(q === t.label ? '' : t.label)}>{t.label}</button>
          ))}
        </div>
      )}
      {filters && (
        <div className="tpl-filters" role="search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto ou cor" aria-label="Buscar" />
          <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marca">
            <option value="">Todas as marcas</option>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="Tamanho">
            <option value="">Todos os tamanhos</option>
            {sizes.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-label="Preço">
            {PRICES.map(([l], i) => <option key={l} value={i}>{l}</option>)}
          </select>
        </div>
      )}
      {filters && <p className="tpl-count">{list.length} {list.length === 1 ? 'produto' : 'produtos'}</p>}
      {list.length ? (
        <div className="tpl-grid">{list.map((p) => <TplCard key={p.id} p={p} n={n} />)}</div>
      ) : (
        <p className="tpl-empty">Nada com esses filtros. <button onClick={clear}>Limpar filtros</button></p>
      )}
    </div>
  );
}
