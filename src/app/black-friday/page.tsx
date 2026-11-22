import Link from 'next/link';
import type { Metadata } from 'next';
import { getBf, listBlackFriday } from '@/lib/products';
import { BlackFridayBanner, bfPieces } from '@/components/BlackFridayBanner';
import { ShopGrid } from '@/components/ShopGrid';
import { ProductCard } from '@/components/ProductCard';
import { money } from '@/lib/pricing';
import { shopConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Black Friday', description: 'Black Friday Street Dreams: descontos na loja toda, sem cupom.' };

export default async function BlackFridayPage() {
  const [bf, products] = await Promise.all([getBf(), listBlackFriday()]);

  if (bf.phase === 'off') {
    return (
      <section className="section" style={{ textAlign: 'center', padding: '80px 16px' }}>
        <h1 className="section__title">A Black Friday acabou.</h1>
        <p className="muted" style={{ margin: '12px 0 24px' }}>Valeu por colar. Os próximos drops saem toda quinta às 11h.</p>
        <Link className="btn" href="/loja">Ver a loja</Link>
      </section>
    );
  }

  // prévia em 2 faixas: as peças acima do desconto padrão ("maiores descontos") e o resto da loja
  const base = Math.min(...products.map((p) => p.bfPercent));
  const top = products.filter((p) => p.bfPercent > base);
  const tiers = [
    { id: 'off-top', chip: `Até ${top[0]?.bfPercent ?? base}% off`, big: `até −${top[0]?.bfPercent ?? base}%`, label: 'Maiores descontos', items: top },
    { id: `off-${base}`, chip: `${base}% off`, big: `−${base}%`, label: 'na loja toda', items: products.filter((p) => p.bfPercent === base) },
  ].filter((t) => t.items.length);

  return (
    <>
      <BlackFridayBanner bf={bf} pieces={bfPieces(products)} />

      <ul className="perks" aria-label="Como funciona">
        <li><b>Sem cupom</b><span>o desconto já sai no preço</span></li>
        <li><b>+{shopConfig.pixDiscountPercent}% no Pix</b><span>em cima do preço da Black</span></li>
        <li><b>Até {shopConfig.maxInstallments}x sem juros</b><span>no cartão</span></li>
        <li><b>Troca grátis</b><span>em até 30 dias</span></li>
      </ul>

      {bf.phase === 'live' ? (
        <section className="section">
          <div className="section__head"><h1 className="section__title">Ofertas</h1><span className="muted">{products.length} peças</span></div>
          <ShopGrid products={products} />
        </section>
      ) : (
        <section className="section">
          <div className="section__head">
            <h1 className="section__title">Prévia dos descontos</h1>
            <nav className="bfx-tiers" aria-label="Faixas de desconto">
              {tiers.map((t) => <a key={t.id} href={`#${t.id}`}>{t.chip} <span>{t.items.length}</span></a>)}
            </nav>
          </div>
          <p className="muted bfx-lead">Estes preços valem a partir de {bf.startLabel} à 0h. Até lá, tudo segue com o preço normal.</p>
          {tiers.map((t) => (
            <div key={t.id} id={t.id} className="bfx-tier">
              <h2 className="bfx-tier__title"><span>{t.big}</span>{t.label} · {t.items.length} {t.items.length === 1 ? 'peça' : 'peças'}</h2>
              <div className="grid">
                {t.items.map((p) => (
                  <div key={p.id} className="bf-preview">
                    <ProductCard p={p} />
                    <p className="bf-note">Sexta: <b>{money(Math.round(p.fullPriceCents * (1 - p.bfPercent / 100)))}</b><span>−{p.bfPercent}%</span></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
