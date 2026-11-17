import Link from 'next/link';
import { shopConfig } from '@/lib/config';
import { money } from '@/lib/pricing';
import { site } from '@/content/site';
import { TplHeader, TplSwitcher } from './client';
import { base, companyInfo, vipLink, waLink, type TplN } from './meta';

/** Selo "100% original" (obrigatório nos 3 templates) */
export function Seal({ light = false }: { light?: boolean }) {
  return (
    <span className={`tpl-seal ${light ? 'tpl-seal--light' : ''}`} title="Produto original, com nota fiscal">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path fill="currentColor" d="M12 1l2.6 2.2 3.4-.4.9 3.3 3 1.7-1.2 3.2 1.2 3.2-3 1.7-.9 3.3-3.4-.4L12 23l-2.6-2.2-3.4.4-.9-3.3-3-1.7L3.3 13 2.1 9.8l3-1.7.9-3.3 3.4.4zM10.6 15.6l6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4z" /></svg>
      100% original
    </span>
  );
}

const LINKS: Record<TplN, (b: string) => [string, string][]> = {
  1: (b) => [[`${b}#ofertas`, 'Ofertas do dia'], [`${b}#vitrine`, 'Todos os produtos'], [`${b}/outlet`, 'Outlet'], [`${b}#black-friday`, 'Black Friday']],
  2: (b) => [[`${b}#drop`, 'Drop'], [`${b}#looks`, 'Lookbook'], [`${b}#vitrine`, 'Loja'], [`${b}/outlet`, 'Outlet']],
  3: (b) => [[`${b}#feed`, 'Feed'], [`${b}#videos`, 'Vídeos'], [`${b}#avaliacoes`, 'Avaliações'], [`${b}#vitrine`, 'Loja'], [`${b}/outlet`, 'Outlet']],
};

function TplFooter({ n }: { n: TplN }) {
  const c = companyInfo();
  return (
    <footer className="tpl-foot">
      <div className="tpl-foot__grid">
        <div>
          <p className="tpl-foot__brand">{site.fullName}</p>
          <Seal light={n === 2} />
          <p className="tpl-foot__small">{c.name}<br />CNPJ {c.cnpj}<br />{c.address}</p>
        </div>
        <div>
          <h4>Contato</h4>
          <a href={waLink(`Oi! Vim pelo site da ${site.name}.`)} target="_blank" rel="noopener">WhatsApp (11) 91677-2455</a>
          <a href={`mailto:${c.email}`}>{c.email}</a>
          {n === 3 && <a href={vipLink()} target="_blank" rel="noopener">Grupo VIP no WhatsApp</a>}
        </div>
        <div>
          <h4>Trocas e devoluções</h4>
          <p className="tpl-foot__small">Primeira troca grátis em até 30 dias. Arrependimento em até 7 dias após o recebimento, com reembolso integral (CDC, art. 49).</p>
          <Link href="/ajuda#trocas">Política de trocas completa</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </div>
        <div>
          <h4>Pagamento</h4>
          <p className="tpl-foot__small">{shopConfig.pixDiscountPercent}% off no Pix · até {shopConfig.maxInstallments}x sem juros · frete grátis acima de {money(shopConfig.freeShippingCents)}</p>
          <Link href={`${base(n)}/outlet`}>Outlet</Link>
        </div>
      </div>
    </footer>
  );
}

/** Moldura de cada template: barra de apresentação, topo, conteúdo e rodapé */
export function TplShell({ n, className, children }: { n: TplN; className: string; children: React.ReactNode }) {
  return (
    <div className={`tpl t${n} ${className}`}>
      <TplSwitcher n={n} />
      <TplHeader n={n} links={LINKS[n](base(n))} />
      <main>{children}</main>
      <TplFooter n={n} />
    </div>
  );
}
