import Link from 'next/link';
import type { ProductDTO } from '@/lib/products';
import { ProductCard } from './ProductCard';

type Action = { href: string; label: string };

/** Campanha em tela cheia (Kith / Noah / Aimé Leon Dore): foto, título pequeno no canto e botões finos.
 *  `extra` fica no canto direito (ex.: contagem regressiva). */
export function Campaign({ img, alt, focus = 'center', kicker, title, text, actions = [], extra, first = false, tone = 'dark' }: {
  img: string; alt: string; focus?: string; kicker?: string; title: string; text?: string;
  actions?: Action[]; extra?: React.ReactNode; first?: boolean; tone?: 'dark' | 'light';
}) {
  return (
    <section className={`camp ${first ? 'camp--first' : ''} camp--${tone}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="camp__img" src={img} alt={alt} style={{ objectPosition: focus }} loading={first ? 'eager' : 'lazy'} fetchPriority={first ? 'high' : 'auto'} />
      <div className="camp__body">
        <div className="camp__copy">
          {kicker && <p className="camp__kicker">{kicker}</p>}
          <h2 className="camp__title">{title}</h2>
          {text && <p className="camp__text">{text}</p>}
        </div>
        {(actions.length > 0 || extra) && (
          <div className="camp__side">
            {extra}
            <div className="camp__actions">
              {actions.map((a) => <Link key={a.href} href={a.href} className="camp__btn">{a.label}</Link>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Faixa de peças logo abaixo da campanha (Kith / Carhartt WIP) */
export function ProductStrip({ title, href, products }: { title: string; href: string; products: ProductDTO[] }) {
  if (!products.length) return null;
  return (
    <section className="strip">
      <div className="strip__head">
        <h3>{title}</h3>
        <Link href={href}>Ver tudo</Link>
      </div>
      <div className="strip__row">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  );
}
