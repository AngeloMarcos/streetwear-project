import Link from 'next/link';
import { site } from '@/content/site';
import { getBf, getProductsBySlugs, getUpcomingDrop, listBestSellers, listBlackFriday, listProducts } from '@/lib/products';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { BlackFridayBanner, bfPieces } from '@/components/BlackFridayBanner';
import { ProductArt } from '@/components/ProductArt';
import { ProductCard } from '@/components/ProductCard';
import { Countdown } from '@/components/Countdown';
import { EmailForm } from '@/components/Forms';
import { ShopTheLook } from '@/components/ShopTheLook';

export default async function Home() {
  const [heroPicks, newIn, drop, trendArt, lookArr, collabArr, bf, best, bfList] = await Promise.all([
    getProductsBySlugs(site.hero.products),
    listProducts({ tags: { has: 'novo' }, NOT: { tags: { has: 'drop' } } }, 10),
    getUpcomingDrop(),
    getProductsBySlugs(site.trends.map((t) => t.slug)),
    getProductsBySlugs(site.look.slugs),
    getProductsBySlugs([site.collab.product]),
    getBf(),
    listBestSellers(4),
    listBlackFriday(),
  ]);
  const bfArt = bfPieces(bfList);
  const collab = collabArr[0];
  const pick = (slugs: string[]) => slugs.map((s) => heroPicks.find((p) => p.slug === s)).filter((p) => !!p);
  const look = site.look.slugs.map((s) => lookArr.find((p) => p.slug === s)).filter((p) => !!p);

  return (
    <>
      {bf.phase === 'live' && <BlackFridayBanner bf={bf} pieces={bfArt} compact />}

      {/* Capa: título gigante com as peças na frente (Palace/High: a peça é a campanha) */}
      <section className="cover">
        {site.hero.video ? (
          <video className="hero__video" src={site.hero.video} poster={site.hero.poster || undefined} autoPlay muted loop playsInline aria-hidden />
        ) : null}
        <h1 className="cover__title" aria-label={`${site.hero.title.join(' ')}`}>
          <span>{site.hero.title[0]}</span><span>{site.hero.title[1]}</span>
        </h1>
        {!site.hero.video && (
          <div className="cover__pieces" aria-hidden>
            {pick(site.hero.products).map((p, i) => (
              <Link key={p.id} href={`/produto/${p.slug}`} tabIndex={-1} className={`cover__piece cover__piece--${i}`}><ProductArt product={p} bare /></Link>
            ))}
          </div>
        )}
        <div className="cover__foot">
          <p>{site.hero.text}</p>
          <div className="cover__ctas">
            <Link className="btn btn--light" href="/loja?tag=novo">Comprar Verão 27</Link>
            <Link className="btn btn--line" href="/lookbook">Ver o lookbook</Link>
          </div>
        </div>
      </section>

      <ul className="perks" aria-label="Vantagens">
        <li><b>{shopConfig.pixDiscountPercent}% off no Pix</b><span>desconto na hora</span></li>
        <li><b>Até {shopConfig.maxInstallments}x sem juros</b><span>no cartão de crédito</span></li>
        <li><b>Frete grátis</b><span>acima de {money(shopConfig.freeShippingCents)}</span></li>
        <li><b>Troca grátis</b><span>em até 30 dias</span></li>
      </ul>

      {bf.phase === 'teaser' && <BlackFridayBanner bf={bf} pieces={bfArt} compact />}

      {/* Novidades em trilho (Kith / Stüssy) */}
      <section className="section">
        <div className="section__head"><h2 className="section__title">Chegou agora</h2><Link className="link-arrow" href="/loja?tag=novo">Ver todas</Link></div>
        <div className="rail">{newIn.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {/* Atalhos por tendência (Carhartt WIP) */}
      <section className="trends" aria-label="Comprar por tendência">
        {site.trends.map((t) => {
          const p = trendArt.find((x) => x.slug === t.slug);
          return (
            <Link key={t.label} href={t.href} className="trend">
              <span className="trend__img">{p && <ProductArt product={p} />}</span>
              <span className="trend__label">{t.label}</span>
            </Link>
          );
        })}
      </section>

      {look.length > 0 && <ShopTheLook title={site.look.title} text={site.look.text} bg={site.look.bg} products={look} />}

      {/* Drop de quinta (Supreme / Palace) */}
      {drop && (
        <section className="drop-banner">
          <div className="drop-banner__info">
            <span className="small">Próximo drop · {drop.at.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</span>
            <h2 className="drop-banner__title">{site.dropName}</h2>
            <Countdown to={drop.at.toISOString()} />
            <div><Link className="btn" href="/drop">Ver a prévia</Link></div>
          </div>
          <div className="drop-banner__grid">
            {drop.items.slice(0, 4).map((p) => (
              <div key={p.id}><ProductArt product={p} blur /><div className="lock"><span>Quinta, 11h</span></div></div>
            ))}
          </div>
        </section>
      )}

      {best.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Mais vendidos</h2><Link className="link-arrow" href="/loja">Ver tudo</Link></div>
          <div className="grid">{best.map((p, i) => <div key={p.id} className="ranked"><span className="ranked__n">{i + 1}</span><ProductCard p={p} /></div>)}</div>
        </section>
      )}

      {collab && (
        <section className="collab">
          <div className="collab__art"><ProductArt product={collab} view={1} /></div>
          <div className="collab__info">
            <span className="small" style={{ color: '#ff6b6b' }}>{site.collab.kicker}</span>
            <h2 className="collab__title">{site.collab.title[0]} <em>×</em><br />{site.collab.title[1]}</h2>
            <p style={{ maxWidth: 420, color: '#bbb' }}>{site.collab.text}</p>
            <div><Link className="btn btn--light" href="/collabs">Comprar a collab</Link></div>
          </div>
        </section>
      )}

      {/* Valores (Noah) */}
      <section className="values" aria-label="Como a gente faz">
        <div><b>Algodão 300g</b><p>Camisetas e moletons com quase o dobro do peso comum. Duram anos.</p></div>
        <div><b>Feito em São Paulo</b><p>Costura, estampa e lavagem em oficinas da cidade, com nome e endereço.</p></div>
        <div><b>Tiragem curta</b><p>Drop toda quinta. Quando acaba, acaba. Sem estoque parado.</p></div>
        <div><b>Troca sem drama</b><p>30 dias pra trocar, frete grátis na primeira troca e tudo pelo WhatsApp.</p></div>
      </section>

      <section className="section">
        <div className="section__head"><h2 className="section__title">Blog</h2><Link className="link-arrow" href="/blog">Ver o blog</Link></div>
        <div className="journal">
          {site.journal.map((j) => (
            <Link key={j.slug} className="post" href={`/blog/${j.slug}`}>
              <div className="post__img" style={{ background: j.bg, color: j.ink }}>{j.kicker}</div>
              <span className="small muted">{j.kicker}</span><h3>{j.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="section newsletter">
        <div>
          <h2 className="section__title" style={{ color: '#fff' }}>Entra na lista.</h2>
          <p style={{ color: '#c9ccff', marginTop: 8 }}>Aviso de drop 1h antes de todo mundo.</p>
        </div>
        <EmailForm source="newsletter" placeholder="seu@email.com" button="Assinar" />
      </section>
    </>
  );
}
