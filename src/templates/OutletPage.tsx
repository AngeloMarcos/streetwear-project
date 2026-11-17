import { getBf, listBlackFriday } from '@/lib/products';
import { Countdown } from '@/components/Countdown';
import { TplGrid } from './client';
import type { TplN } from './meta';

/** Outlet: seção separada da vitrine principal. Usa as peças com desconto cadastrado
 *  (campo "Desconto Black Friday" no admin); não cria nenhuma regra de preço nova. */
export async function TplOutletPage({ n }: { n: TplN }) {
  const [bf, products] = await Promise.all([getBf(), listBlackFriday()]);
  return (
    <div className="tpl-outlet">
      <section className="tpl-outlet__head">
        <p className="tpl-kicker">Outlet</p>
        <h1 className="tpl-outlet__title">Preço baixo,<br />peça original.</h1>
        {bf.phase === 'live' && <p>Descontos de até {bf.maxPercent}% valendo agora, até {bf.endLabel}.</p>}
        {bf.phase === 'teaser' && (
          <>
            <p>Os descontos de até {bf.maxPercent}% começam em {bf.startLabel}. Veja a prévia de cada peça.</p>
            <Countdown to={bf.start} />
          </>
        )}
        {bf.phase === 'off' && <p>Peças com desconto cadastrado. Novas ofertas toda semana.</p>}
      </section>
      <TplGrid products={products} n={n} />
    </div>
  );
}
