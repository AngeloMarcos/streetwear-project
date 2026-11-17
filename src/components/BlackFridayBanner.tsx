import Link from 'next/link';
import type { BfInfo } from '@/lib/promo';
import { Countdown } from './Countdown';
import { EmailForm } from './Forms';

/** Banner da Black Friday: contagem até começar (prévia) ou até acabar (valendo) */
export function BlackFridayBanner({ bf, compact = false }: { bf: BfInfo; compact?: boolean }) {
  if (bf.phase === 'off') return null;
  const live = bf.phase === 'live';
  return (
    <section className={`bf ${compact ? 'bf--compact' : ''}`}>
      <div className="bf__marquee" aria-hidden>{Array.from({ length: 8 }, (_, i) => <span key={i}>BLACK FRIDAY</span>)}</div>
      <div className="bf__body">
        <div>
          <span className="mono bf__kicker">{live ? `Valendo até ${bf.endLabel} às 23h59` : `Começa ${bf.startLabel} à 0h`}</span>
          <h2 className="bf__title">Black<br />Friday</h2>
          <p className="bf__off">Até <b>{bf.maxPercent}%</b> off</p>
          <p className="bf__text">{live
            ? 'Descontos na loja toda, sem cupom. E ainda tem desconto a mais no Pix.'
            : 'Desconto na loja toda, sem cupom. Entra na lista e recebe o aviso assim que abrir.'}</p>
        </div>
        <div className="bf__side">
          <span className="mono">{live ? 'Acaba em' : 'Começa em'}</span>
          <Countdown to={live ? bf.end : bf.start} />
          {live && <Link className="btn btn--accent" href="/black-friday">Ver ofertas</Link>}
          {!live && compact && <Link className="btn btn--accent" href="/black-friday">Ver prévia dos descontos</Link>}
          {!live && !compact && <EmailForm source="black-friday" placeholder="seu@email.com" button="Me avisa" className="bf__form" />}
        </div>
      </div>
    </section>
  );
}
