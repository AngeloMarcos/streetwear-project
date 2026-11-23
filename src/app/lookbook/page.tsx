import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProductsBySlugs } from '@/lib/products';
import { money } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { ShopTheLook } from '@/components/AddToCart';

export const metadata: Metadata = { title: 'Lookbook', description: 'Lookbook Verão 27 da Street Dreams, fotografado em São Paulo.' };

/** Lookbook no estilo Supreme: um look por vez, centralizado, com a legenda das peças em letra de máquina */
export default async function Lookbook() {
  const lb = site.lookbook;
  const cover = site.campaigns.lookbook;
  const all = await getProductsBySlugs(lb.looks.flatMap((l) => l.slugs));
  const total = lb.looks.length + 1;
  const n = (i: number) => `${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div className="lb">
      <header className="lb__head">
        <p>{lb.season.toLowerCase()}</p>
        <p className="lb__intro">{cover.text}</p>
      </header>

      {/* capa: a foto da campanha */}
      <figure className="lb__frame" id="look-1">
        <div className="lb__img lb__img--photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.img} alt={cover.alt} style={{ objectPosition: cover.focus }} />
        </div>
        <figcaption className="lb__cap">
          <span className="lb__n">{n(1)}</span>
          <span>{cover.title.toLowerCase()} — várzea, zona leste</span>
          <a href="#look-2" className="lb__next">próximo →</a>
        </figcaption>
      </figure>

      {lb.looks.map((l, i) => {
        const items = l.slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
        const idx = i + 2;
        return (
          <figure className="lb__frame" key={l.title} id={`look-${idx}`}>
            <div className="lb__img" style={{ background: l.bg }}>
              <div className={`lb__pieces lb__pieces--${items.length}`}>
                {items.map((p) => <Link key={p.id} href={`/produto/${p.slug}`} aria-label={p.name}><ProductArt product={p} bare /></Link>)}
              </div>
            </div>
            <figcaption className="lb__cap">
              <span className="lb__n">{n(idx)}</span>
              <span className="lb__items">
                <b>{l.title.toLowerCase()}</b>
                {items.map((p) => (
                  <Link key={p.id} href={`/produto/${p.slug}`}>{p.name.toLowerCase()} — {p.colorName.toLowerCase()} · {money(p.priceCents)}</Link>
                ))}
              </span>
              <span className="lb__side">
                {items.length > 0 && <ShopTheLook products={items} />}
                {idx < total ? <a href={`#look-${idx + 1}`} className="lb__next">próximo →</a> : <a href="#look-1" className="lb__next">↑ início</a>}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
