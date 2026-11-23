import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getUpcomingDrop, listProducts } from '@/lib/products';
import { money } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { Countdown } from '@/components/Countdown';
import { EmailForm } from '@/components/Forms';
import { Campaign } from '@/components/Campaign';
import { Dateline } from '@/components/Dateline';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = { title: 'Drop', description: 'Drop toda quinta às 11h. Tiragem curta, sem reposição.' };

/** Drop no estilo Supreme (preview): foto da campanha, contagem e um mosaico das peças bloqueadas */
export default async function DropPage() {
  const c = site.campaigns.drop;
  const drop = await getUpcomingDrop();

  if (!drop) {
    const last = await listProducts({ tags: { has: 'drop' } }, 12);
    return (
      <div className="ed-home">
        <Dateline />
        <Campaign first img={c.img} alt={c.alt} focus={c.focus} kicker={c.kicker} title="Sem drop agendado" text="O último drop já está na loja. Entra na lista e recebe o aviso do próximo 1h antes." actions={[{ href: '/loja?tag=novo', label: 'Ver novidades' }]} />
        <section className="drop-ed">
          <EmailForm className="drop-ed__form" source="drop" placeholder="seu@email.com" button="Me avisa" />
          {last.length > 0 && (
            <>
              <p className="drop-ed__label">Último drop</p>
              <div className="ed-grid">{last.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </>
          )}
        </section>
      </div>
    );
  }

  const tz = { timeZone: 'America/Sao_Paulo' } as const;
  const when = drop.at.toLocaleDateString('pt-BR', { ...tz, weekday: 'long', day: 'numeric', month: 'long' });
  const hour = drop.at.toLocaleTimeString('pt-BR', { ...tz, hour: '2-digit', minute: '2-digit' });

  return (
    <div className="ed-home">
      <Dateline />
      <Campaign
        first
        img={c.img}
        alt={c.alt}
        focus={c.focus}
        kicker={`Drop · ${when} · ${hour}`}
        title={site.dropName}
        text={`${drop.items.length} peças. ${c.text}`}
        extra={<div className="camp__clock"><span>Libera em</span><Countdown to={drop.at.toISOString()} /></div>}
      />

      <section className="drop-ed">
        <div className="drop-ed__head">
          <p className="drop-ed__label">Prévia · {when}, {hour}</p>
          <EmailForm className="drop-ed__form" source="drop" placeholder="seu@email.com" button="Me avisa quando abrir" />
        </div>

        {/* mosaico compacto, sem espaço entre as peças (Supreme preview) */}
        <div className="drop-ed__mosaic" style={{ '--cols': Math.min(drop.items.length, 6) } as React.CSSProperties}>
          {drop.items.map((p) => (
            <div key={p.id} className="drop-ed__tile" title={p.name}>
              <ProductArt product={p} blur />
              <span className="drop-ed__lock">{hour}</span>
            </div>
          ))}
        </div>

        {/* lista em letra de máquina (Supreme lookbook) */}
        <ol className="drop-ed__list">
          {drop.items.map((p, i) => (
            <li key={p.id}><span>{String(i + 1).padStart(2, '0')}</span>{p.name.toLowerCase()} — {p.colorName.toLowerCase()}<b>{money(p.priceCents)}</b></li>
          ))}
        </ol>
        <p className="drop-ed__note">quantidade limitada · sem reposição · máximo 2 por pessoa · <Link href="/ajuda">ajuda</Link></p>
      </section>
    </div>
  );
}
