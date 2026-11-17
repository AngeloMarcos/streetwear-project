import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getProductsBySlugs } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { dateBR } from '@/lib/dates';

type Params = Promise<{ slug: string }>;
const find = (slug: string) => site.journal.find((j) => j.slug === slug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = find((await params).slug);
  return post ? { title: post.title, description: post.intro } : { title: 'Matéria não encontrada' };
}

export default async function PostPage({ params }: { params: Params }) {
  const post = find((await params).slug);
  if (!post) notFound();
  const products = await getProductsBySlugs(post.products);
  const others = site.journal.filter((j) => j.slug !== post.slug).slice(0, 2);

  return (
    <article>
      <div className="post-hero" style={{ background: post.bg, color: post.ink }}>
        <span className="mono">{post.kicker} · {dateBR(post.date)}</span>
        <h1 className="section__title">{post.title}</h1>
      </div>
      <div className="post-body">
        <p className="post-body__intro">{post.intro}</p>
        {post.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {products.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Peças da matéria</h2></div>
          <div className="grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}
      {others.length > 0 && (
        <section className="section">
          <div className="section__head"><h2 className="section__title">Leia também</h2><Link className="link-arrow" href="/blog">Ver blog →</Link></div>
          <div className="journal">
            {others.map((j) => (
              <Link key={j.slug} className="post" href={`/blog/${j.slug}`}>
                <div className="post__img" style={{ background: j.bg, color: j.ink }}>{j.kicker}</div>
                <span className="mono muted">{j.kicker}</span><h3>{j.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
