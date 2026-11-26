import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { CATEGORIES, TYPES, shopConfig } from '@/lib/config';
import { getBf, getProduct, listProducts } from '@/lib/products';
import { installments, money, pixPrice } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { ProductStrip } from '@/components/Campaign';
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
    listProducts({ category: p.category, NOT: { name: p.name } }, 8),
    getBf(),
  ]);
  const n = installments(p.priceCents, shopConfig);

  return (
    <>
      {/* Página de produto no estilo Carhartt WIP (fotos em grade, cinza) + Kith (painel fixo, linhas finas) */}
      <section className="pdp pdp--ed">
        {/* com fotos: uma por quadro, sem repetir; sem fotos: as 3 vistas do desenho */}
        <div className={`pdp__gallery ${p.images.length === 1 ? 'pdp__gallery--1' : ''}`}>
          <div><ProductArt product={p} /></div>
          {(p.images.length === 0 || p.images.length > 1) && <div><ProductArt product={p} view={1} /></div>}
          {(p.images.length === 0 || p.images.length > 2) && <div className="pdp__wide"><ProductArt product={p} view={2} /></div>}
        </div>
        <div className="pdp__info">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span>›</span><Link href={`/loja?cat=${p.category}`}>{CATEGORIES[p.category]}</Link><span>›</span><Link href={`/loja?tipo=${p.type}`}>{TYPES[p.type]?.plural ?? TYPES[p.type]?.label}</Link>
          </nav>

          <div className="pdp__head">
            <h1 className="pdp__title">
              {p.name}
              {p.tags.includes('novo') && <span className="card__new"> Novo</span>}
              {p.tags.includes('collab') && <span className="card__new card__new--collab"> Collab</span>}
            </h1>
            <p className="pdp__price">
              {p.offPercent > 0 && <><s className="price-old">{money(p.fullPriceCents)}</s>{' '}</>}
              <span className={p.offPercent > 0 ? 'price--bf' : ''}>{money(p.priceCents)}</span>
              {p.offPercent > 0 && <span className="pdp__off"> −{p.offPercent}% Black Friday</span>}
            </p>
            <p className="pdp__pay">
              {money(pixPrice(p.priceCents, shopConfig))} no Pix ({shopConfig.pixDiscountPercent}% off) · ou {n}x de {money(Math.round(p.priceCents / n))} sem juros
            </p>
          </div>

          {bf.phase === 'teaser' && p.bfPercent > 0 && (
            <p className="bf-note">Na Black Friday ({bf.startLabel}) esta peça sai por <b>{money(Math.round(p.fullPriceCents * (1 - p.bfPercent / 100)))}</b> ({p.bfPercent}% off). <Link href="/black-friday">Ver a prévia</Link></p>
          )}

          <div className="pdp__colors">
            {variants.length > 1 && (
              <div className="variants">
                {variants.map((v) => (
                  <Link key={v.id} className={`variant ${v.id === p.id ? 'is-active' : ''}`} href={`/produto/${v.slug}`} title={v.colorName} aria-label={`Cor ${v.colorName}`}>
                    <ProductArt product={v} />
                  </Link>
                ))}
              </div>
            )}
            <p className="pdp__color"><span>Cor:</span> {p.colorName} <ShareButton title={`${p.name} ${p.colorName}`} /></p>
          </div>

          <AddToCart p={p} apparel={p.category === 'roupas'} />

          <ul className="trust">
            <li>Troca grátis em até 30 dias</li>
            <li>Frete grátis acima de {money(shopConfig.freeShippingCents)}</li>
            <li>Envio em até 2 dias úteis</li>
            <li>Pagamento seguro via Mercado Pago</li>
          </ul>

          <div className="pdp__details">
            <details open><summary>Detalhes</summary><p>{full?.description}</p></details>
            <details><summary>Composição e cuidados</summary><ul>{care(p.type).map((c) => <li key={c}>{c}</li>)}</ul></details>
            <details>
              <summary>Envio e trocas</summary>
              <p>Frete grátis acima de {money(shopConfig.freeShippingCents)}. Primeira troca grátis em até 30 dias, tudo pelo WhatsApp.</p>
              <ShippingCalc />
            </details>
          </div>
        </div>
      </section>
      <ProductStrip title="Combina com" href={`/loja?cat=${p.category}`} products={related} />
      <RecentlyViewed slug={p.slug} />
    </>
  );
}
