import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { shopConfig, siteUrl } from '@/lib/config';
import { getBf, getProduct, listProducts } from '@/lib/products';
import { installments, money, pixPrice } from '@/lib/pricing';
import { site } from '@/content/site';
import { ProductArt } from '@/components/ProductArt';
import { AddToCart } from '@/components/AddToCart';
import { TplCard } from './client';
import { Seal } from './Shell';
import { base, waLink, type TplN } from './meta';

export async function tplProductMetadata(slug: string): Promise<Metadata> {
  const p = await getProduct(slug);
  // Templates são só para apresentação: não aparecem no Google
  return { title: p ? `${p.name} ${p.colorName}` : 'Produto não encontrado', robots: { index: false } };
}

/** Página de produto dos 3 templates (mesmos dados e mesmo botão de compra do site) */
export async function TplProductPage({ n, slug }: { n: TplN; slug: string }) {
  const p = await getProduct(slug);
  if (!p) notFound();
  const [full, related, bf] = await Promise.all([
    db.product.findUnique({ where: { slug }, select: { description: true } }),
    listProducts({ category: p.category, NOT: { name: p.name } }, 4),
    getBf(),
  ]);
  const inst = installments(p.priceCents, shopConfig);
  const apparel = p.category === 'roupas';
  const reviews = site.community.reviews.filter((r) => r.slug === p.slug);
  const ask = waLink(`Oi! Tenho uma dúvida sobre ${p.name} (${p.colorName}): ${siteUrl()}/produto/${p.slug}`);

  return (
    <>
      <section className="tpl-pdp">
        <div className="tpl-pdp__gallery">
          {[0, 1, 2].map((v) => <div key={v}><ProductArt product={p} view={v as 0 | 1 | 2} label={v === 0} /></div>)}
        </div>
        <div className="tpl-pdp__info">
          <div className="tpl-pdp__top">
            <Link href={base(n)} className="tpl-back">← Voltar</Link>
            <Seal light={n === 2} />
          </div>
          <h1 className="tpl-pdp__title">{p.name}</h1>
          <p className="tpl-pdp__color">{p.colorName}</p>

          <div className="tpl-price">
            {p.offPercent > 0 && (
              <p className="tpl-price__from">De <s>{money(p.fullPriceCents)}</s> <span className="tpl-off tpl-off--inline">−{p.offPercent}%</span></p>
            )}
            <p className="tpl-price__now">{p.offPercent > 0 && <small>Por </small>}{money(p.priceCents)}</p>
            <p className="tpl-price__pix"><b>{money(pixPrice(p.priceCents, shopConfig))}</b> no Pix ({shopConfig.pixDiscountPercent}% off)</p>
            <p className="tpl-price__inst">ou {inst}x de {money(Math.round(p.priceCents / inst))} sem juros</p>
            {bf.phase === 'teaser' && p.bfPercent > 0 && (
              <p className="tpl-price__soon">Na Black Friday ({bf.startLabel}): <b>{money(Math.round(p.fullPriceCents * (1 - p.bfPercent / 100)))}</b> (−{p.bfPercent}%)</p>
            )}
          </div>

          <div className="tpl-stock">
            <p className="tpl-label">Estoque por tamanho</p>
            <ul>
              {p.sizes.map((s) => (
                <li key={s.id} className={s.available ? '' : 'is-out'}>
                  <b>{s.size}</b>
                  <span>{s.available ? (s.stock <= 3 ? `últimas ${s.stock}` : `${s.stock} un.`) : 'esgotado'}</span>
                </li>
              ))}
            </ul>
            {!apparel && <p className="tpl-note">Tamanho único. Medidas na descrição.</p>}
          </div>

          <AddToCart p={p} apparel={apparel} />
          <a className="tpl-ask" href={ask} target="_blank" rel="noopener">Tirar dúvida no WhatsApp</a>

          <ul className="tpl-trust">
            <li>Envio em até 2 dias úteis</li>
            <li>Primeira troca grátis em 30 dias</li>
            <li>Pagamento seguro via Mercado Pago</li>
          </ul>
          <details open><summary>Descrição</summary><p>{full?.description}</p></details>
        </div>
      </section>

      {n === 3 && reviews.length > 0 && (
        <section className="tpl-section">
          <h2 className="tpl-h2">Quem comprou diz</h2>
          <div className="tpl-reviews">
            {reviews.map((r) => (
              <figure key={r.name} className="tpl-review">
                {r.example && <span className="tpl-example">exemplo</span>}
                <p className="tpl-stars" aria-label={`${r.rating} de 5 estrelas`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.name} · {r.city}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="tpl-section">
          <h2 className="tpl-h2">Combina com</h2>
          <div className="tpl-grid">{related.map((r) => <TplCard key={r.id} p={r} n={n} />)}</div>
        </section>
      )}
    </>
  );
}
