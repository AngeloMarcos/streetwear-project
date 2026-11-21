import Link from 'next/link';
import { site } from '@/content/site';
import { getProductsBySlugs, listProducts } from '@/lib/products';
import { ProductArt } from '@/components/ProductArt';
import { ShopTheLook } from '@/components/ShopTheLook';
import { TplGrid } from './client';
import { Seal } from './Shell';
import { base, productHref, vipLink } from './meta';

/** TEMPLATE 3 · COMUNIDADE: feed de looks, vídeos curtos, avaliações e grupo VIP */
export async function Home3() {
  const c = site.community;
  const [refs, all, lookArr] = await Promise.all([
    getProductsBySlugs([...new Set([...c.feed, ...c.videos].map((x) => x.slug))]),
    listProducts(),
    getProductsBySlugs(site.look.slugs),
  ]);
  const look = site.look.slugs.map((s) => lookArr.find((p) => p.slug === s)).filter((p) => !!p);
  const byslug = (s: string) => refs.find((p) => p.slug === s);
  const Vip = ({ label }: { label: string }) => <a className="t3-vip-btn" href={vipLink()} target="_blank" rel="noopener">{label}</a>;

  return (
    <>
      <section className="t3-hero">
        <Seal />
        <h1>Feito por quem usa.</h1>
        <p>Looks de quem compra, vídeo de quem testa e aviso de drop direto no seu WhatsApp.</p>
        <Vip label="Entrar no grupo VIP" />
      </section>

      <section id="feed" className="tpl-section">
        <div className="t3-head"><h2 className="tpl-h2">#VistoNaRua</h2><span>Marque @streetdreams pra aparecer aqui</span></div>
        <div className="t3-feed">
          {c.feed.map((f, i) => {
            const p = byslug(f.slug);
            if (!p) return null;
            return (
              <Link key={i} href={productHref(3, p.slug)} className="t3-post">
                {f.photo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={f.photo} alt={f.caption} loading="lazy" />
                  : <ProductArt product={p} view={(i % 3) as 0 | 1 | 2} />}
                {f.example && <span className="tpl-example">foto de exemplo</span>}
                <span className="t3-post__cap"><b>{f.handle}</b> {f.caption}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Look montado por cliente, comprável de uma vez (Kith "shop the look") */}
      {look.length > 0 && (
        <ShopTheLook base={base(3)} note="look de exemplo" bg="#ffe9d6"
          title={`Look do ${c.feed[0]?.handle ?? '@cliente'}`}
          text="Quem é da comunidade monta, a gente coloca aqui. Escolha o tamanho de cada peça e leve o look inteiro."
          products={look} />
      )}

      <section id="videos" className="tpl-section">
        <h2 className="tpl-h2">Vídeos curtos</h2>
        <div className="t3-videos">
          {c.videos.map((v, i) => {
            const p = byslug(v.slug);
            return (
              <figure key={i} className="t3-video">
                {v.src
                  ? <video src={v.src} poster={v.poster || undefined} controls playsInline preload="none" />
                  : <div className="t3-video__ph">{p && <ProductArt product={p} view={1} />}<span>▶</span></div>}
                {v.example && <span className="tpl-example">vídeo de exemplo</span>}
                <figcaption>{v.caption}{p && <> · <Link href={productHref(3, p.slug)}>ver peça</Link></>}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section id="avaliacoes" className="tpl-section">
        <h2 className="tpl-h2">Quem comprou diz</h2>
        <div className="tpl-reviews">
          {c.reviews.map((r) => (
            <figure key={r.name} className="tpl-review">
              {r.example && <span className="tpl-example">exemplo</span>}
              <p className="tpl-stars" aria-label={`${r.rating} de 5 estrelas`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              <blockquote>{r.text}</blockquote>
              <figcaption>{r.name} · {r.city}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="t3-vip">
        <p className="tpl-kicker">Grupo VIP</p>
        <h2>Drop 1 hora antes de todo mundo.</h2>
        <p>Aviso de drop, reposição e cupom só pra quem está no grupo. Sem spam, só coisa boa.</p>
        <Vip label="Quero entrar no grupo" />
      </section>

      <section id="vitrine" className="tpl-section">
        <h2 className="tpl-h2">Loja</h2>
        <TplGrid products={all} n={3} filters={false} chips />
      </section>
    </>
  );
}
