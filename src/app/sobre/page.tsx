import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProductsBySlugs } from '@/lib/products';
import { ProductArt } from '@/components/ProductArt';

export const metadata: Metadata = { title: 'Sobre', description: `${site.fullName}: ${site.tagline}` };

export default async function SobrePage() {
  const art = await getProductsBySlugs(site.hero.products);
  return (
    <>
      <section className="about">
        <div className="about__text">
          <span className="mono muted">Sobre a {site.name}</span>
          <h1 className="section__title" style={{ fontSize: 'clamp(56px,11vw,160px)' }}>{site.about.title[0]}<br />{site.about.title[1]}</h1>
          {site.about.text.map((t, i) => <p key={i}>{t}</p>)}
          <div className="about__links">
            <Link className="btn" href="/loja">Ver a loja</Link>
            <Link className="link-arrow" href="/drop">Próximo drop →</Link>
          </div>
        </div>
        <div className="about__art">{art.map((p) => <div key={p.id}><ProductArt product={p} view={2} /></div>)}</div>
      </section>
      <ul className="facts">
        {site.about.facts.map(([n, l]) => <li key={l}><b>{n}</b><span>{l}</span></li>)}
      </ul>
    </>
  );
}
