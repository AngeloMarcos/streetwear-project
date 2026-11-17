import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProductsBySlugs, listProducts } from '@/lib/products';
import { ProductArt } from '@/components/ProductArt';
import { ShopGrid } from '@/components/ShopGrid';

export const metadata: Metadata = { title: 'Collabs', description: 'Edições limitadas da BLOCO com artistas e estúdios. Tiragem única, sem reposição.' };

export default async function CollabsPage() {
  const [products, [hero]] = await Promise.all([
    listProducts({ tags: { has: 'collab' } }),
    getProductsBySlugs([site.collab.product]),
  ]);
  const post = site.journal.find((j) => j.kicker === 'Collab');

  return (
    <>
      <section className="collab">
        <div className="collab__art">{hero && <ProductArt product={hero} view={1} />}</div>
        <div className="collab__info">
          <span className="mono" style={{ color: '#c8102e' }}>{site.collab.kicker}</span>
          <h1 className="collab__title">{site.collab.title[0]} <em>×</em><br />{site.collab.title[1]}</h1>
          <p style={{ maxWidth: 420, color: '#bbb' }}>{site.collab.text}</p>
          {post && <div><Link className="btn btn--light" href={`/blog/${post.slug}`}>Ler os bastidores</Link></div>}
        </div>
      </section>
      <section className="section">
        <div className="section__head"><h2 className="section__title">Peças da collab</h2><span className="mono muted">{products.length} produtos</span></div>
        {products.length ? <ShopGrid products={products} /> : <p className="muted">A próxima collab está chegando. Entre na lista pra saber primeiro.</p>}
      </section>
    </>
  );
}
