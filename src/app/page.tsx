import Link from 'next/link';
import { site } from '@/content/site';
import { CATEGORIES } from '@/lib/config';
import { getBf, getProductsBySlugs, getUpcomingDrop, listBestSellers, listProducts } from '@/lib/products';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { BlackFridayBanner } from '@/components/BlackFridayBanner';
import { ProductArt } from '@/components/ProductArt';
import { ProductCard } from '@/components/ProductCard';
import { Countdown } from '@/components/Countdown';
import { EmailForm } from '@/components/Forms';

export default async function Home() {
  const [heroPicks, newIn, drop, catArt, collabArr, bf, best] = await Promise.all([
    getProductsBySlugs(site.hero.products),
    listProducts({ tags: { has: 'novo' } }, 8),
    getUpcomingDrop(),
    getProductsBySlugs(Object.values(site.categoryArt)),
    getProductsBySlugs([site.collab.product]),
    getBf(),
    listBestSellers(4),
  ]);
  const collab = collabArr[0];

  return (
    <>
      {bf.phase === 'live' && <BlackFridayBanner bf={bf} />}
      <section className="hero">
        {site.hero.video ? (
          <video className="hero__video" src={site.hero.video} poster={site.hero.poster || undefined} autoPlay muted loop playsInline aria-hidden />
        ) : (
          <div className="hero__media">{heroPicks.map((p) => <div key={p.id}><ProductArt product={p} /></div>)}</div>
        )}
        <div className="grain" />
        <div className="hero__content">
          <p className="mono">{site.hero.kicker}</p>
          <h1 className="hero__title">{site.hero.title[0]}<br />{site.hero.title[1]}</h1>
          <div className="hero__row">
            <p>{site.hero.text}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="btn btn--light" href="/loja?tag=novo">Comprar novidades</Link>
              <Link className="btn btn--ghost" style={{ color: '#fff', borderColor: '#fff' }} href="/lookbook">Ver lookbook</Link>
            </div>
          </div>
        </div>
      </section>

      <ul className="perks" aria-label="Vantagens">
        <li><b>{shopConfig.pixDiscountPercent}% off no Pix</b><span>desconto na hora</span></li>
        <li><b>Até {shopConfig.maxInstallments}x sem juros</b><span>no cartão de crédito</span></li>
        <li><b>Frete grátis</b><span>acima de {money(shopConfig.freeShippingCents)}</span></li>
        <li><b>Troca grátis</b><span>em até 30 dias</span></li>
      </ul>

      {bf.phase === 'teaser' && <BlackFridayBanner bf={bf} />}

      {drop && (
        <section className="drop-banner">
          <div className="drop-banner__info">
            <span className="mono">Próximo drop · {drop.at.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</span>
            <h2 className="drop-banner__title">{site.dropName}</h2>
            <Countdown to={drop.at.toISOString()} />
            <div><Link className="btn" href="/drop">Ver prévia do drop</Link></div>
          </div>
          <div className="drop-banner__grid">
            {drop.items.slice(0, 4).map((p) => (
              <div key={p.id}><ProductArt product={p} blur /><div className="lock"><span>EM BREVE</span></div></div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__head"><h2 className="section__title">Novidades</h2><Link className="link-arrow" href="/loja?tag=novo">Ver tudo →</Link></div>
        <div className="grid">{newIn.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {best.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Mais vendidos</h2><Link className="link-arrow" href="/loja">Ver tudo →</Link></div>
          <div className="grid">{best.map((p, i) => <div key={p.id} className="ranked"><span className="ranked__n">{i + 1}</span><ProductCard p={p} /></div>)}</div>
        </section>
      )}

      <section className="cats">
        {Object.entries(CATEGORIES).map(([k, label]) => {
          const p = catArt.find((x) => x.slug === site.categoryArt[k]);
          return (
            <Link key={k} className="cat" href={`/loja?cat=${k}`}>
              {p && <ProductArt product={p} />}
              <span className="cat__label">{label}</span>
            </Link>
          );
        })}
      </section>

      {collab && (
        <section className="collab">
          <div className="collab__art"><ProductArt product={collab} view={1} /></div>
          <div className="collab__info">
            <span className="mono" style={{ color: '#c8102e' }}>{site.collab.kicker}</span>
            <h2 className="collab__title">{site.collab.title[0]} <em>×</em><br />{site.collab.title[1]}</h2>
            <p style={{ maxWidth: 420, color: '#bbb' }}>{site.collab.text}</p>
            <div><Link className="btn btn--light" href="/collabs">Comprar a collab</Link></div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__head"><h2 className="section__title">Blog</h2><Link className="link-arrow" href="/blog">Ver blog →</Link></div>
        <div className="journal">
          {site.journal.map((j) => (
            <Link key={j.slug} className="post" href={`/blog/${j.slug}`}>
              <div className="post__img" style={{ background: j.bg, color: j.ink }}>{j.kicker}</div>
              <span className="mono muted">{j.kicker}</span><h3>{j.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="section newsletter">
        <div>
          <h2 className="section__title" style={{ color: 'var(--paper)' }}>Entra na lista.</h2>
          <p style={{ color: '#bbb', marginTop: 8 }}>Aviso de drop 1h antes de todo mundo.</p>
        </div>
        <EmailForm source="newsletter" placeholder="seu@email.com" button="Assinar" />
      </section>
    </>
  );
}
