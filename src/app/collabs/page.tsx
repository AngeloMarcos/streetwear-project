import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { listProducts } from '@/lib/products';
import { Campaign } from '@/components/Campaign';
import { Dateline } from '@/components/Dateline';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = { title: 'Collabs', description: 'Edições limitadas da Street Dreams com artistas e estúdios. Tiragem única, sem reposição.' };

/** Collab no estilo Kith: campanha em tela cheia, texto editorial e as peças em grade */
export default async function CollabsPage() {
  const c = site.campaigns.collab;
  const products = await listProducts({ tags: { has: 'collab' } });
  const post = site.journal.find((j) => j.kicker === 'Collab');
  const title = `${site.collab.title[0]} × ${site.collab.title[1]}`;

  return (
    <div className="ed-home">
      <Dateline />
      <Campaign
        first
        img={c.img}
        alt={c.alt}
        focus={c.focus}
        kicker={site.collab.kicker}
        title={title}
        actions={[{ href: '#pecas', label: 'Comprar' }, ...(post ? [{ href: `/blog/${post.slug}`, label: 'Bastidores' }] : [])]}
      />

      <section className="ed-story">
        <p className="ed-story__kicker">{site.collab.kicker}</p>
        <h1 className="ed-story__title">{title}</h1>
        <div className="ed-story__text">
          <p>{site.collab.text}</p>
          {post && <p>{post.intro}</p>}
          {post && <Link href={`/blog/${post.slug}`} className="ed-story__link">Ler os bastidores</Link>}
        </div>
      </section>

      <section className="ed-shop" id="pecas">
        <div className="strip__head"><h3>Peças da collab</h3><span className="muted small">{products.length} {products.length === 1 ? 'peça' : 'peças'}</span></div>
        {products.length
          ? <div className="ed-grid ed-grid--wide">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          : <p className="muted" style={{ padding: '0 var(--gutter)' }}>A próxima collab está chegando. Entre na lista pra saber primeiro.</p>}
      </section>
    </div>
  );
}
