import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { CATEGORIES, TYPES, shopConfig } from '@/lib/config';
import { getBf, getProduct, listProducts } from '@/lib/products';
import { installments, money, pixPrice } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { ProductCard } from '@/components/ProductCard';
import { AddToCart } from '@/components/AddToCart';
import { ShippingCalc } from '@/components/Forms';
import { RecentlyViewed, ShareButton } from '@/components/Extras';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: 'Produto não encontrado' };
  return {
    title: `${p.name} ${p.colorName}`,
    description: `${p.name} (${p.colorName}) por ${money(p.priceCents)} — ${money(pixPrice(p.priceCents, shopConfig))} no Pix.`,
    openGraph: p.images[0] ? { images: [p.images[0]] } : undefined,
  };
}

function care(type: string) {
  if (type === 'deck') return ['7 lâminas de maple canadense', 'Lixa não inclusa'];
  if (['bag', 'cap'].includes(type)) return ['Lavar à mão', 'Não usar alvejante', 'Secar à sombra'];
  return ['Lavar do avesso em água fria', 'Não usar secadora', 'Não passar sobre a estampa'];
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const full = await db.product.findUnique({ where: { slug }, select: { description: true } });

  const [variants, related, bf] = await Promise.all([
    listProducts({ name: p.name }),
    listProducts({ category: p.category, NOT: { name: p.name } }, 4),
    getBf(),
  ]);
  const n = installments(p.priceCents, shopConfig);

  return (
    <>
      <section className="pdp">
        <div className="pdp__gallery">
          <div><ProductArt product={p} label /></div>
          <div><ProductArt product={p} view={1} label /></div>
          <div><ProductArt product={p} view={2} label /></div>
        </div>
        <div className="pdp__info">
          <div className="crumbs">
            <Link href="/">Início</Link> / <Link href={`/loja?cat=${p.category}`}>{CATEGORIES[p.category]}</Link> / {TYPES[p.type]?.label}
          </div>
          <div>
            {p.tags.includes('collab') && <span className="badge badge--dark">Collab</span>}{' '}
            {p.tags.includes('novo') && <span className="badge badge--accent">Novo</span>}
            <h1 className="pdp__title" style={{ marginTop: 8 }}>{p.name}</h1>
            <p className="muted pdp__sub"><span>{p.colorName}</span><ShareButton title={`${p.name} ${p.colorName}`} /></p>
          </div>
          <div className="pdp__price">
            {p.offPercent > 0 && <><s className="price-old">{money(p.fullPriceCents)}</s>{' '}</>}
            <span className={p.offPercent > 0 ? 'price--bf' : ''}>{money(p.priceCents)}</span>
            {p.offPercent > 0 && <>{' '}<span className="badge badge--bf">Black Friday −{p.offPercent}%</span></>}
          </div>
          {bf.phase === 'teaser' && p.bfPercent > 0 && (
            <p className="bf-note">Na Black Friday ({bf.startLabel}) esta peça sai com <b>{p.bfPercent}% off</b>. <Link href="/black-friday">Saiba mais →</Link></p>
          )}
          <div className="pay-box">
            <span><b>{money(pixPrice(p.priceCents, shopConfig))}</b> no Pix ({shopConfig.pixDiscountPercent}% off)</span>
            <span>ou {n}x de {money(Math.round(p.priceCents / n))} sem juros no cartão</span>
          </div>
          {variants.length > 1 && (
            <div>
              <div className="label-row"><span>Cor: {p.colorName}</span></div>
              <div className="variants">
                {variants.map((v) => (
                  <Link key={v.id} className={`variant ${v.id === p.id ? 'is-active' : ''}`} href={`/produto/${v.slug}`} title={v.colorName}>
                    <ProductArt product={v} />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <AddToCart p={p} apparel={p.category === 'roupas'} />
          <ul className="trust">
            <li>Envio em até 2 dias úteis</li>
            <li>Troca grátis em 30 dias</li>
            <li>Pagamento seguro via Mercado Pago</li>
          </ul>
          <div>
            <details open><summary>Descrição</summary><p>{full?.description}</p></details>
            <details><summary>Composição e cuidados</summary><ul>{care(p.type).map((c) => <li key={c}>{c}</li>)}</ul></details>
            <details>
              <summary>Frete e trocas</summary>
              <p>Frete grátis acima de {money(shopConfig.freeShippingCents)}. Primeira troca grátis em até 30 dias.</p>
              <ShippingCalc />
            </details>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Combina com</h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
      <RecentlyViewed slug={p.slug} />
    </>
  );
}
