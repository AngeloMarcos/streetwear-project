import Link from 'next/link';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { getBf, listBlackFriday, listProducts } from '@/lib/products';
import { Countdown } from '@/components/Countdown';
import { TplCard, TplGrid } from './client';
import { Seal } from './Shell';

/** TEMPLATE 1 · OUTLET DIRETO: fundo claro, grade densa, preço grande, busca e filtros no topo */
export async function Home1() {
  const [bf, all, deals] = await Promise.all([getBf(), listProducts(), listBlackFriday()]);
  return (
    <>
      {bf.phase !== 'off' && (
        <section id="black-friday" className="t1-bf">
          <div>
            <p className="t1-bf__k">Black Friday {bf.phase === 'live' ? 'valendo agora' : `começa ${bf.startLabel}`}</p>
            <p className="t1-bf__big">Até <b>{bf.maxPercent}%</b> off</p>
          </div>
          <Countdown to={bf.phase === 'live' ? bf.end : bf.start} />
        </section>
      )}

      <ul className="t1-perks">
        <li><Seal /></li>
        <li><b>{shopConfig.pixDiscountPercent}% off</b> no Pix</li>
        <li><b>{shopConfig.maxInstallments}x</b> sem juros</li>
        <li>Frete grátis acima de <b>{money(shopConfig.freeShippingCents)}</b></li>
      </ul>

      {deals.length > 0 && (
        <section id="ofertas" className="tpl-section">
          <div className="t1-head">
            <h2 className="tpl-h2">Ofertas do dia</h2>
            <Link href="/template-1/outlet">Ver outlet →</Link>
          </div>
          <div className="t1-deals">{deals.slice(0, 4).map((p) => <TplCard key={p.id} p={p} n={1} big />)}</div>
        </section>
      )}

      <section id="vitrine" className="tpl-section">
        <h2 className="tpl-h2">Todos os produtos</h2>
        <TplGrid products={all} n={1} />
      </section>
    </>
  );
}
