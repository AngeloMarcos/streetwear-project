import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { dateBR } from '@/lib/dates';

export const metadata: Metadata = { title: 'Blog', description: 'Bastidores, skate e produto: o que acontece na Street Dreams.' };

export default function BlogPage() {
  const [first, ...rest] = site.journal;
  return (
    <>
      <section className="lookbook-hero">
        <span className="mono muted">Bastidores · Skate · Produto</span>
        <h1 className="section__title" style={{ fontSize: 'clamp(56px,11vw,160px)' }}>Blog</h1>
      </section>
      {first && (
        <Link href={`/blog/${first.slug}`} className="post-lead">
          <div className="post__img" style={{ background: first.bg, color: first.ink }}>{first.kicker}</div>
          <div className="post-lead__info">
            <span className="mono muted">{first.kicker} · {dateBR(first.date)}</span>
            <h2 className="section__title">{first.title}</h2>
            <p className="muted">{first.intro}</p>
            <span className="link-arrow">Ler matéria →</span>
          </div>
        </Link>
      )}
      <section className="section">
        <div className="journal">
          {rest.map((j) => (
            <Link key={j.slug} className="post" href={`/blog/${j.slug}`}>
              <div className="post__img" style={{ background: j.bg, color: j.ink }}>{j.kicker}</div>
              <span className="mono muted">{j.kicker} · {dateBR(j.date)}</span><h3>{j.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
