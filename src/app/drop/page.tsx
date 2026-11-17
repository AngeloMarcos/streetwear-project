import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getUpcomingDrop } from '@/lib/products';
import { money } from '@/lib/pricing';
import { ProductArt } from '@/components/ProductArt';
import { Countdown } from '@/components/Countdown';
import { EmailForm } from '@/components/Forms';

export const metadata: Metadata = { title: 'Drop' };

export default async function DropPage() {
  const drop = await getUpcomingDrop();
  if (!drop) {
    return (
      <section className="section drop-page">
        <h1 className="section__title" style={{ fontSize: 'clamp(56px,11vw,160px)' }}>Sem drop<br />agendado.</h1>
        <p style={{ margin: '16px 0', color: '#bbb' }}>O último drop já está na loja. Entra na lista pra saber do próximo.</p>
        <EmailForm className="notify" source="drop" placeholder="Me avisa do próximo" button="Avisar" light />
        <br /><Link className="btn btn--light" href="/loja?tag=novo">Ver novidades</Link>
      </section>
    );
  }
  const when = drop.at.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' });
  const hour = drop.at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  return (
    <section className="section drop-page">
      <span className="mono" style={{ color: '#888' }}>Drop · {when} às {hour}</span>
      <h1 className="section__title" style={{ fontSize: 'clamp(56px,11vw,160px)', margin: '8px 0 24px' }}>{site.dropName}</h1>
      <Countdown to={drop.at.toISOString()} />
      <EmailForm className="notify" source="drop" placeholder="Me avisa quando abrir" button="Avisar" light />
      <p className="small" style={{ color: '#888', marginTop: 8 }}>Quantidade limitada. Sem reposição.</p>
      <br /><br />
      <div className="drop-grid">
        {drop.items.map((p) => (
          <div key={p.id}>
            <div className="img"><ProductArt product={p} blur /><div className="lock"><span>🔒 {when.split(',')[0].toUpperCase()}</span></div></div>
            <strong>{p.name}</strong><span className="muted">{money(p.priceCents)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
