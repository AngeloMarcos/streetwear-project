'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, TYPES } from '@/lib/config';
import { money } from '@/lib/pricing';
import type { ProductDTO } from '@/lib/products';
import { useCart } from './CartProvider';
import { ProductArt } from './ProductArt';

const CAT_KEYS = Object.keys(CATEGORIES);
const typesOf = (cat: string) => Object.entries(TYPES).filter(([, t]) => t.category === cat);

export type MenuArt = Record<string, ProductDTO | undefined>;

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`logo ${footer ? 'logo--footer' : ''}`} aria-label="BLOCO Supply Co. — início">
      <span className="logo__mark" /><span className="logo__word">BLOCO</span>
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

export function Header({ blackFriday = false, menuArt = {} }: { blackFriday?: boolean; menuArt?: MenuArt }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [bump, setBump] = useState(false);
  const [megaClosed, setMegaClosed] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname + (params.toString() ? `?${params}` : '');
  const prevCount = useRef(count);

  const prevPage = useRef(current);
  useEffect(() => {
    setMenu(false); setSearch(false); setOpen(false);
    if (prevPage.current !== current) setMegaClosed(true); // clicou num link do submenu: fecha até o mouse sair
    prevPage.current = current;
  }, [current, setOpen]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);
  useEffect(() => {
    if (count > prevCount.current) { setBump(true); setTimeout(() => setBump(false), 400); }
    prevCount.current = count;
  }, [count]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setSearch(false); setOpen(false); setMegaClosed(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const tab = menu ? 0 : -1;
  const navLink = (href: string, label: string, cls = '') => (
    <Link href={href} className={`${cls} ${current === href ? 'is-active' : ''}`}>{label}</Link>
  );

  return (
    <>
      <header className="header">
        <button className="icon-btn menu-toggle" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <svg viewBox="0 0 24 24" width="22" height="22"><path d={menu ? 'M5 5l14 14M19 5L5 19' : 'M3 6h18M3 12h18M3 18h18'} stroke="currentColor" strokeWidth="2" /></svg>
        </button>
        <Logo />
        <nav className={`nav ${megaClosed ? 'mega-closed' : ''}`} aria-label="Principal" onMouseLeave={() => setMegaClosed(false)}>
          {blackFriday && navLink('/black-friday', 'Black Friday', 'nav__bf')}
          {navLink('/loja?tag=novo', 'Novidades')}
          {CAT_KEYS.map((cat) => {
            const feat = menuArt[cat];
            return (
              <div className="nav__item" key={cat}>
                {navLink(`/loja?cat=${cat}`, CATEGORIES[cat])}
                <div className="mega" role="region" aria-label={`Menu ${CATEGORIES[cat]}`}>
                  <div className="mega__col">
                    <span className="mono muted">{CATEGORIES[cat]}</span>
                    {typesOf(cat).map(([k, t]) => <Link key={k} href={`/loja?tipo=${k}`}>{t.plural}</Link>)}
                    <Link href={`/loja?cat=${cat}`} className="link-arrow">Ver tudo →</Link>
                  </div>
                  <div className="mega__col">
                    <span className="mono muted">Destaques</span>
                    <Link href="/loja?tag=novo">Novidades</Link>
                    <Link href="/collabs">Collabs</Link>
                    <Link href="/drop">Drop da semana</Link>
                    {blackFriday && <Link href="/black-friday" className="price--bf">Black Friday</Link>}
                  </div>
                  {feat && (
                    <Link href={`/produto/${feat.slug}`} className="mega__feat">
                      <span className="mega__img"><ProductArt product={feat} /></span>
                      <span className="small"><b>{feat.name}</b> · {money(feat.priceCents)}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          {navLink('/collabs', 'Collabs')}
          {navLink('/lookbook', 'Lookbook')}
          {navLink('/blog', 'Blog')}
          <Link href="/drop" className={`nav__drop ${pathname === '/drop' ? 'is-active' : ''}`}>Drop</Link>
        </nav>
        <div className="header__actions">
          <button className="icon-btn" aria-label="Buscar" onClick={() => setSearch(!search)}>
            <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
          <button className="icon-btn cart-btn" aria-label={`Abrir carrinho (${count} itens)`} onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 8h14l-1 13H6L5 8z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            <span className={`cart-count ${bump ? 'bump' : ''}`}>{count}</span>
          </button>
        </div>
      </header>

      {search && <SearchBar onClose={() => setSearch(false)} />}

      <aside className={`mobile-menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <nav>
          {blackFriday && <Link href="/black-friday" className="nav__bf" tabIndex={tab}>Black Friday</Link>}
          <Link href="/loja?tag=novo" tabIndex={tab}>Novidades</Link>
          {CAT_KEYS.map((cat) => (
            <div key={cat} className="mobile-menu__group">
              <Link href={`/loja?cat=${cat}`} tabIndex={tab}>{CATEGORIES[cat]}</Link>
              <div className="mobile-menu__sub">
                {typesOf(cat).map(([k, t]) => <Link key={k} href={`/loja?tipo=${k}`} tabIndex={tab}>{t.plural}</Link>)}
              </div>
            </div>
          ))}
          <Link href="/collabs" tabIndex={tab}>Collabs</Link>
          <Link href="/lookbook" tabIndex={tab}>Lookbook</Link>
          <Link href="/drop" tabIndex={tab}>Drop da semana</Link>
          <Link href="/blog" tabIndex={tab}>Blog</Link>
          <Link href="/sobre" tabIndex={tab}>Sobre</Link>
          <Link href="/loja" tabIndex={tab}>Ver tudo</Link>
        </nav>
      </aside>
    </>
  );
}
