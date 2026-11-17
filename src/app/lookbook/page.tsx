import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProductsBySlugs } from '@/lib/products';
import { money } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { ShopTheLook } from '@/components/AddToCart';

export const metadata: Metadata = { title: 'Lookbook' };

export default async function Lookbook() {
  const all = await getProductsBySlugs(site.lookbook.looks.flatMap((l) => l.slugs));
  return (
    <>
      <section className="lookbook-hero">
        <span className="mono muted">{site.lookbook.season}</span>
        <h1 className="section__title" style={{ fontSize: 'clamp(56px,11vw,160px)' }}>{site.lookbook.title[0]}<br />{site.lookbook.title[1]}</h1>
      </section>
      <div>
        {site.lookbook.looks.map((l, i) => {
          const items = l.slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
          return (
            <article className="look" key={l.title}>
              <div className="look__img" style={{ background: l.bg }}>
                {items.map((p) => <ProductArt key={p.id} product={{ ...p, bg: l.bg }} view={(i % 2) as 0 | 1} />)}
              </div>
              <div className="look__info">
                <span className="mono muted">Look {String(i + 1).padStart(2, '0')}</span>
                <h2>{l.title}</h2>
                <p className="muted">{l.caption}</p>
                <div className="look__items">
                  {items.map((p) => (
                    <Link key={p.id} href={`/produto/${p.slug}`}><span>{p.name} — {p.colorName}</span><span className="price">{money(p.priceCents)}</span></Link>
                  ))}
                </div>
                {items.length > 0 && <div><ShopTheLook products={items} /></div>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
