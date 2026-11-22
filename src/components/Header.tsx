'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/lib/config';
import { money } from '@/lib/pricing';
import type { ProductDTO } from '@/lib/products';
import { useCart } from './CartProvider';
import { ProductArt } from './ProductArt';
import { site } from '@/content/site';

const CAT_KEYS = Object.keys(CATEGORIES);

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`logo ${footer ? 'logo--footer' : ''}`} aria-label={`${site.fullName}: início`}>
      <span className="logo__word">{site.name}</span>
    </Link>
  );
}

/** Busca com resultados enquanto digita */
function SearchBar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ProductDTO[] | null>(null);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults(null); return; }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/produtos?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (r.ok) setResults((await r.json()).products);
      } catch { /* digitou de novo */ }
    }, 220);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q]);

  return (
    <div className="search-wrap">
      <form className="search" role="search" onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/loja?q=${encodeURIComponent(q.trim())}`);
      }}>
        <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar camiseta, moletom, boné…" aria-label="Buscar produtos" autoComplete="off" />
        <button type="button" className="icon-btn" aria-label="Fechar busca" onClick={onClose}>✕</button>
      </form>
      {results && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="muted">Nada encontrado para “{q.trim()}”. Tenta “moletom”, “boné” ou uma cor.</p>
          ) : (
            <>
              <div className="search-results__grid">
                {results.map((p) => (
                  <Link key={p.id} href={`/produto/${p.slug}`} className="search-hit">
                    <span className="search-hit__img"><ProductArt product={p} /></span>
                    <span><b>{p.name}</b><span className="muted small">{p.colorName}</span><span className={p.offPercent ? 'price--bf' : ''}>{money(p.priceCents)}</span></span>
                  </Link>
                ))}
              </div>
              <Link className="link-arrow" href={`/loja?q=${encodeURIComponent(q.trim())}`}>Ver todos os resultados →</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({ blackFriday = false }: { blackFriday?: boolean }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [bump, setBump] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname + (params.toString() ? `?${params}` : '');
  const prevCount = useRef(count);

  const prevPage = useRef(current);
  useEffect(() => {
    setMenu(false); setSearch(false); setOpen(false);
    prevPage.current = current;
  }, [current, setOpen]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);
  useEffect(() => {
    if (count > prevCount.current) { setBump(true); setTimeout(() => setBump(false), 400); }
    prevCount.current = count;
  }, [count]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setSearch(false); setOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const tab = menu ? 0 : -1;
  const navLink = (href: string, label: string, cls = '') => (
    <Link href={href} className={`${cls} ${current === href ? 'is-active' : ''}`}>{label}</Link>
  );

  return (
    <>
      {/* Menu em pílula flutuante (Palace / Baw) */}
      <header className="pill">
        <Logo />
        <nav className="pill__nav" aria-label="Principal">
          {navLink('/loja', 'Loja')}
          {navLink('/loja?tag=novo', 'Novidades')}
          {navLink('/drop', 'Drop')}
          {navLink('/lookbook', 'Lookbook')}
          {navLink('/collabs', 'Collabs')}
          {blackFriday && navLink('/black-friday', 'Black Friday', 'pill__bf')}
        </nav>
        <button className="pill__btn pill__search" aria-label="Buscar" onClick={() => setSearch(!search)}>Busca</button>
        <button className="pill__btn" aria-label={`Abrir carrinho (${count} itens)`} onClick={() => setOpen(true)}>
          <span className="pill__label">Carrinho</span> <span className={`pill__count ${bump ? 'bump' : ''}`}>{count}</span>
        </button>
        <button className="pill__btn pill__menu" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? 'Fechar' : 'Menu'}
        </button>
      </header>

      {search && <SearchBar onClose={() => setSearch(false)} />}

      {/* Menu do celular: lista simples em fundo preto (Supreme) */}
      <aside className={`mobile-menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <nav>
          {blackFriday && <Link href="/black-friday" tabIndex={tab}>black friday</Link>}
          <Link href="/loja?tag=novo" tabIndex={tab}>novidades</Link>
          <Link href="/loja" tabIndex={tab}>loja</Link>
          {CAT_KEYS.map((cat) => (
            <Link key={cat} href={`/loja?cat=${cat}`} tabIndex={tab} className="mobile-menu__sub">— {CATEGORIES[cat].toLowerCase()}</Link>
          ))}
          <Link href="/drop" tabIndex={tab}>drop da semana</Link>
          <Link href="/lookbook" tabIndex={tab}>lookbook</Link>
          <Link href="/collabs" tabIndex={tab}>collabs</Link>
          <Link href="/blog" tabIndex={tab}>blog</Link>
          <Link href="/sobre" tabIndex={tab}>sobre</Link>
          <Link href="/ajuda" tabIndex={tab}>ajuda</Link>
          <button type="button" tabIndex={tab} onClick={() => { setMenu(false); setSearch(true); }}>busca</button>
        </nav>
      </aside>
    </>
  );
}
