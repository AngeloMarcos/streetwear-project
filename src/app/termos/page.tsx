import Link from 'next/link';
import type { Metadata } from 'next';
import { shopConfig } from '@/lib/config';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'Termos de uso' };

export default function Termos() {
  const c = site.company;
  return (
    <section className="section help">
      <h1 className="section__title">Termos de uso</h1>
      <p className="muted small">Texto modelo. Revise com um advogado antes de publicar.</p>
      <h2>Preços e estoque</h2>
      <p>Os preços valem para compras feitas no site e podem mudar sem aviso. O estoque é reservado só quando o pagamento é aprovado; em drops, peças podem esgotar enquanto você finaliza a compra.</p>
      <h2>Pagamento</h2>
      <p>Aceitamos Pix ({shopConfig.pixDiscountPercent}% de desconto), cartão de crédito em até {shopConfig.maxInstallments}x sem juros e boleto. Pedidos não pagos no prazo são cancelados automaticamente.</p>
      <h2>Promoções</h2>
      <p>Descontos não são cumulativos, exceto o desconto do Pix. Promoções como a Black Friday têm datas de início e fim informadas no site.</p>
      <h2>Arrependimento e trocas</h2>
      <p>Você pode desistir da compra em até 7 dias após receber o pedido (art. 49 do Código de Defesa do Consumidor). As regras de troca estão em <Link href="/ajuda#trocas">Ajuda</Link>.</p>
      <h2>Conteúdo</h2>
      <p>Marcas, estampas, fotos e textos do site pertencem à {site.fullName} e aos artistas parceiros. Não podem ser reproduzidos sem autorização.</p>
      {(c.legalName || c.cnpj || c.address) && (
        <p className="small muted">{[c.legalName, c.cnpj && `CNPJ ${c.cnpj}`, c.address].filter(Boolean).join(' · ')}</p>
      )}
    </section>
  );
}
