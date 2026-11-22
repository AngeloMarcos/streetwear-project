import Link from 'next/link';
import { site } from '@/content/site';
import { getBf, listBestSellers, listBlackFriday, listProducts } from '@/lib/products';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { BlackFridayBanner, bfPieces } from '@/components/BlackFridayBanner';
import { ProductCard } from '@/components/ProductCard';
import { ShopGrid } from '@/components/ShopGrid';
import { EmailForm } from '@/components/Forms';

/** Home "Outlet direto" (escolhida a partir do Template 1): oferta e vitrine primeiro, no visual Verão 27 */
export default async function Home() {
  const [bf, all, deals, top] = await Promise.all([getBf(), listProducts(), listBlackFriday(), listBestSellers(5)]);
  const live = bf.phase === 'live';
  const teaser = bf.phase === 'teaser';

  return (
    <>
      {bf.phase !== 'off' && <BlackFridayBanner bf={bf} pieces={bfPieces(deals)} compact />}

      <ul className="perks" aria-label="Vantagens">
        <li><b>{shopConfig.pixDiscountPercent}% off no Pix</b><span>desconto na hora</span></li>
        <li><b>Até {shopConfig.maxInstallments}x sem juros</b><span>no cartão de crédito</span></li>
        <li><b>Frete grátis</b><span>acima de {money(shopConfig.freeShippingCents)}</span></li>
        <li><b>Troca grátis</b><span>em até 30 dias</span></li>
      </ul>

      {/* Ofertas: valendo = preço já com desconto; prévia = mostra o preço de sexta */}
      {(live || teaser) && deals.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">{live ? 'Ofertas do dia' : 'Preço de Black Friday'}</h2>
            <Link className="link-arrow" href="/black-friday">{live ? 'Ver todas as ofertas' : 'Ver a prévia completa'}</Link>
          </div>
          <div className="grid">
            {deals.slice(0, 4).map((p) => (
              <div key={p.id} className="bf-preview">
                <ProductCard p={p} />
                {teaser && <p className="bf-note">Sexta: <b>{money(Math.round(p.fullPriceCents * (1 - p.bfPercent / 100)))}</b><span>−{p.bfPercent}%</span></p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top 5 com número grande (Approve / Baw) */}
      {top.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Top 5 da semana</h2></div>
          <ol className="top5">
            {top.map((p, i) => <li key={p.id}><span className="top5__n" aria-hidden>{i + 1}</span><ProductCard p={p} /></li>)}
          </ol>
        </section>
      )}

      {/* Vitrine completa com atalhos por tendência (Carhartt WIP) e filtros */}
      <section className="section" id="vitrine">
        <div className="section__head"><h2 className="section__title">Todos os produtos</h2></div>
        <nav className="home-trends" aria-label="Comprar por tendência">
          {site.trends.map((t) => <Link key={t.label} href={t.href}>{t.label}</Link>)}
          <Link href="/loja?tag=novo">Verão 27</Link>
          <Link href="/loja?tag=collab">Collabs</Link>
        </nav>
        <ShopGrid products={all} />
      </section>

      <section className="section newsletter">
        <div>
          <h2 className="section__title" style={{ color: '#fff' }}>Entra na lista.</h2>
          <p style={{ color: '#c9ccff', marginTop: 8 }}>Aviso de drop e de promoção 1h antes de todo mundo.</p>
        </div>
        <EmailForm source="newsletter" placeholder="seu@email.com" button="Assinar" />
      </section>
    </>
  );
}
