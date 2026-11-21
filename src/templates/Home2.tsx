import Link from 'next/link';
import { site } from '@/content/site';
import { getProductsBySlugs, getUpcomingDrop, listProducts } from '@/lib/products';
import { ProductArt } from '@/components/ProductArt';
import { Countdown } from '@/components/Countdown';
import { TplGrid } from './client';
import { productHref } from './meta';

/** TEMPLATE 2 · DROP / LOOKBOOK: escuro, fotos em tela cheia, pouco texto, caixa alta */
export async function Home2() {
  const [drop, looksProducts, all] = await Promise.all([
    getUpcomingDrop(),
    getProductsBySlugs(site.lookbook.looks.flatMap((l) => l.slugs)),
    listProducts(),
  ]);
  const heroArt = drop?.items[0] ?? looksProducts[0];

  return (
    <>
      <section id="drop" className="t2-hero">
        {heroArt && <div className="t2-hero__art"><ProductArt product={heroArt} view={1} blur={!!drop} /></div>}
        <div className="t2-hero__txt">
          <p className="tpl-kicker">{drop ? 'Próximo drop' : site.hero.kicker}</p>
          <h1>{drop ? site.dropName : `${site.hero.title[0]} ${site.hero.title[1]}`}</h1>
          {drop ? (
            <>
              <Countdown to={drop.at.toISOString()} />
              <p className="t2-hero__sub">{drop.items.length} peças · quinta, 11h · sem reposição</p>
            </>
          ) : (
            <Link className="t2-btn" href="#vitrine">Ver coleção</Link>
          )}
        </div>
      </section>

      {/* Lista do drop da semana (Supreme: o que sai quinta, peça por peça) */}
      {drop && (
        <section className="tpl-section t2-droplist">
          <div className="t2-droplist__head">
            <h2 className="tpl-h2">Esta semana</h2>
            <p>{drop.at.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} · {drop.items.length} peças</p>
          </div>
          <ul>
            {drop.items.map((p) => (
              <li key={p.id}>
                <span className="t2-droplist__img" data-when={drop.at.toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}><ProductArt product={p} blur /></span>
                <b>{p.name}</b>
                <span>{p.colorName} · {p.sizes.map((x) => x.size).join(' / ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div id="looks">
        {site.lookbook.looks.map((l, i) => {
          const items = l.slugs.map((s) => looksProducts.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
          if (!items.length) return null;
          return (
            <section key={l.title} className="t2-look" style={{ background: l.bg }}>
              <div className="t2-look__art">{items.map((p) => <ProductArt key={p.id} product={{ ...p, bg: l.bg }} view={(i % 2) as 0 | 1} />)}</div>
              <div className="t2-look__cap">
                <span>{site.lookbook.season} · {i + 1}/{site.lookbook.looks.length}</span>
                <h2>{l.title}</h2>
                <div>{items.map((p) => <Link key={p.id} href={productHref(2, p.slug)}>{p.name} →</Link>)}</div>
              </div>
            </section>
          );
        })}
      </div>

      <section id="vitrine" className="tpl-section">
        <h2 className="tpl-h2">Coleção {site.hero.title.join(' ')}</h2>
        <TplGrid products={all} n={2} filters={false} />
      </section>
    </>
  );
}
