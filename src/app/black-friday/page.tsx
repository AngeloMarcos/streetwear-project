import Link from 'next/link';
import type { Metadata } from 'next';
import { getBf, listBlackFriday } from '@/lib/products';
import { BlackFridayBanner } from '@/components/BlackFridayBanner';
import { ShopGrid } from '@/components/ShopGrid';
import { ProductCard } from '@/components/ProductCard';
import { money } from '@/lib/pricing';

export const metadata: Metadata = { title: 'Black Friday', description: 'Black Friday BLOCO: descontos na loja toda, sem cupom.' };

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

  return (
    <>
      <BlackFridayBanner bf={bf} />
      {bf.phase === 'live' ? (
        <section className="section">
          <div className="section__head"><h1 className="section__title">Ofertas</h1><span className="mono muted">{products.length} produtos</span></div>
          <ShopGrid products={products} />
        </section>
      ) : (
        <section className="section">
          <div className="section__head"><h1 className="section__title">Prévia dos descontos</h1></div>
          <p className="muted" style={{ marginBottom: 24 }}>Os preços abaixo valem a partir de {bf.startLabel}. Até lá, tudo segue com o preço normal.</p>
          <div className="grid">
            {products.map((p) => (
              <div key={p.id} className="bf-preview">
                <ProductCard p={p} />
                <p className="bf-note">Na Black Friday: <b>{money(Math.round(p.fullPriceCents * (1 - p.bfPercent / 100)))}</b> ({p.bfPercent}% off)</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
