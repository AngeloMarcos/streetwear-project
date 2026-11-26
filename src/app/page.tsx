import Link from 'next/link';
import { site } from '@/content/site';
import { getBf, getProductsBySlugs, getUpcomingDrop, listBestSellers, listBlackFriday, listProducts } from '@/lib/products';
import { Campaign, ProductStrip } from '@/components/Campaign';
import { Countdown } from '@/components/Countdown';
import { Dateline } from '@/components/Dateline';
import { ProductCard } from '@/components/ProductCard';
import { EmailForm } from '@/components/Forms';

/** Home editorial (Kith / Noah / Aimé Leon Dore / Palace): campanhas em tela cheia, cada uma com a sua faixa de peças */
export default async function Home() {
  const c = site.campaigns;
  const [bf, newIn, deals, drop, collab, best, all] = await Promise.all([
    getBf(),
    listProducts({ tags: { has: 'novo' }, NOT: { tags: { has: 'drop' } } }, 10),
    listBlackFriday(),
    getUpcomingDrop(),
    listProducts({ tags: { has: 'collab' } }, 6),
    listBestSellers(6),
    listProducts(undefined, 18),
  ]);
  const bfOn = bf.phase !== 'off';
  const live = bf.phase === 'live';

  return (
    <div className="ed-home">
      <Dateline />

      {bfOn && (
        <>
          <Campaign
            first
            img={c.blackFriday.img}
            focus={c.blackFriday.focus}
            alt={c.blackFriday.alt}
            kicker={live ? `Valendo até ${bf.endLabel} às 23h59` : `${bf.startLabel} a ${bf.endLabel}`}
            title="Black Friday"
            text={`Até ${bf.maxPercent}% off na loja toda, sem cupom. ${live ? 'O desconto já está no preço.' : 'Os preços caem na sexta à 0h.'}`}
            extra={<div className="camp__clock"><span>{live ? 'Acaba em' : 'Começa em'}</span><Countdown to={live ? bf.end : bf.start} /></div>}
            actions={[{ href: '/black-friday', label: live ? 'Ver as ofertas' : 'Ver a prévia' }]}
          />
          <ProductStrip title={live ? 'Ofertas' : 'Na Black Friday'} href="/black-friday" products={deals.slice(0, 6)} />
        </>
      )}

      <Campaign
        first={!bfOn}
        img={c.verao.img}
        focus={c.verao.focus}
        alt={c.verao.alt}
        kicker={c.verao.kicker}
        title={c.verao.title}
        text={c.verao.text}
        actions={[{ href: '/loja?tag=novo', label: 'Comprar' }, { href: '/lookbook', label: 'Lookbook' }]}
      />
      <ProductStrip title="Chegou agora" href="/loja?tag=novo" products={newIn} />

      <Campaign
        img={c.drop.img}
        focus={c.drop.focus}
        alt={c.drop.alt}
        kicker={drop ? `Próximo drop · ${drop.at.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}` : c.drop.kicker}
        title={site.dropName}
        text={c.drop.text}
        extra={drop ? <div className="camp__clock"><span>Libera em</span><Countdown to={drop.at.toISOString()} /></div> : undefined}
        actions={[{ href: '/drop', label: drop ? 'Ver a prévia' : 'Ver o drop' }]}
      />

      <Campaign
        img={c.collab.img}
        focus={c.collab.focus}
        alt={c.collab.alt}
        kicker={site.collab.kicker}
        title={`${site.collab.title[0]} × ${site.collab.title[1]}`}
        text={site.collab.text}
        actions={[{ href: '/collabs', label: 'Comprar a collab' }, { href: '/blog/bastidores-collab-estudio-x', label: 'Bastidores' }]}
      />
      <ProductStrip title="A collab" href="/collabs" products={collab} />

      <Campaign
        img={c.lookbook.img}
        focus={c.lookbook.focus}
        alt={c.lookbook.alt}
        kicker={c.lookbook.kicker}
        title={c.lookbook.title}
        text={c.lookbook.text}
        actions={[{ href: '/lookbook', label: 'Ver o lookbook' }]}
      />
      <ProductStrip title="Mais vendidos" href="/loja" products={best} />

      {/* Loja em grade densa (Palace) */}
      <section className="ed-shop">
        <div className="strip__head"><h3>Loja</h3><Link href="/loja">Ver tudo</Link></div>
        <div className="ed-grid">{all.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {/* Valores (Noah), em texto pequeno */}
      <section className="ed-values" aria-label="Como a gente faz">
        <h2 className="ed-values__title">Como a gente faz</h2>
        <div><span>01</span><b>Algodão 300g</b><p>Camisetas e moletons com quase o dobro do peso comum.</p></div>
        <div><span>02</span><b>Feito em São Paulo</b><p>Costura, estampa e lavagem em oficinas da cidade.</p></div>
        <div><span>03</span><b>Tiragem curta</b><p>Drop toda quinta. Quando acaba, acaba.</p></div>
        <div><span>04</span><b>Troca sem drama</b><p>30 dias pra trocar, tudo pelo WhatsApp.</p></div>
      </section>

      <section className="ed-news">
        <div>
          <span className="ed-news__kicker">Lista Street Dreams</span>
          <h2 className="ed-news__title">Drop toda quinta.<br />Fica sabendo antes.</h2>
          <p>Aviso de drop 1h antes de todo mundo. Sem spam.</p>
        </div>
        <EmailForm source="newsletter" placeholder="seu@email.com" button="Assinar" />
      </section>
    </div>
  );
}
