import Link from 'next/link';
import type { BfInfo } from '@/lib/promo';
import type { ProductDTO } from '@/lib/products';
import { Countdown } from './Countdown';
import { EmailForm } from './Forms';
import { ProductArt } from './ProductArt';

/** Até 3 peças com o maior desconto, sem repetir o tipo (ficam soltas no palco do banner) */
export function bfPieces(products: ProductDTO[]) {
  const seen = new Set<string>();
  return [...products]
    .filter((p) => p.bfPercent > 0)
    .sort((a, b) => b.bfPercent - a.bfPercent)
    .filter((p) => (seen.has(p.type) ? false : (seen.add(p.type), true)))
    .slice(0, 3);
}

/** Banner da Black Friday (Verão 27): bloco na cor de promoção, título largo, % gigante e as peças em destaque */
export function BlackFridayBanner({ bf, compact = false, pieces = [] }: { bf: BfInfo; compact?: boolean; pieces?: ProductDTO[] }) {
  if (bf.phase === 'off') return null;
  const live = bf.phase === 'live';
  const tape = live
    ? ['VALENDO AGORA', `ATÉ ${bf.maxPercent}% OFF`, 'SEM CUPOM', `ACABA ${bf.endLabel}`]
    : ['BLACK FRIDAY', `ATÉ ${bf.maxPercent}% OFF`, 'SEM CUPOM', `ABRE ${bf.startLabel} À 0H`];

  return (
    <section className={`bfx ${live ? 'bfx--live' : ''} ${compact ? 'bfx--compact' : ''}`} aria-label="Black Friday">
      <div className="bfx__tape" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => <span key={i}>{tape.map((t) => <span key={t}>{t}<i>✦</i></span>)}</span>)}
      </div>
      <div className="bfx__inner">
        <div className="bfx__copy">
          <span className="bfx__kicker">{live ? <><b className="bfx__dot" />Valendo até {bf.endLabel} às 23h59</> : `Começa ${bf.startLabel} à 0h`}</span>
          <h2 className="bfx__title">Black<br />Friday</h2>
          <p className="bfx__text">{live
            ? 'Desconto na loja toda, já no preço. Sem cupom, e no Pix ainda sai mais barato.'
            : 'Desconto na loja toda, sem cupom. Entra na lista e recebe o aviso no minuto em que abrir.'}</p>
          <div className="bfx__clock">
            <span>{live ? 'Acaba em' : 'Abre em'}</span>
            <Countdown to={live ? bf.end : bf.start} />
          </div>
          <div className="bfx__cta">
            {live && <Link className="btn btn--light" href="/black-friday">Ver todas as ofertas</Link>}
            {!live && compact && <Link className="btn btn--light" href="/black-friday">Ver a prévia dos descontos</Link>}
            {!live && !compact && <EmailForm source="black-friday" placeholder="seu@email.com" button="Me avisa" className="bfx__form" />}
          </div>
        </div>

        <div className="bfx__stage">
          <p className="bfx__pct" aria-label={`Até ${bf.maxPercent}% off`}>
            <small>até</small><span>{bf.maxPercent}</span><sup>%</sup><small className="bfx__off">off</small>
          </p>
          {pieces.map((p, i) => (
            <Link key={p.id} href={`/produto/${p.slug}`} className={`bfx__piece bfx__piece--${i}`} aria-label={`${p.name}, ${p.bfPercent}% off`}>
              <ProductArt product={p} bare />
              <span className="bfx__sticker">−{p.bfPercent}%</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
