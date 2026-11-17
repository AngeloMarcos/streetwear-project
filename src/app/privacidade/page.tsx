import type { Metadata } from 'next';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'Política de privacidade' };

export default function Privacidade() {
  const c = site.company;
  return (
    <section className="section help">
      <h1 className="section__title">Política de privacidade</h1>
      <p className="muted small">Texto modelo. Revise com um advogado antes de publicar.</p>
      <h2>Quais dados coletamos</h2>
      <p>Para entregar seu pedido, pedimos nome, e-mail, CPF, telefone e endereço. Se você entra na nossa lista ou pede aviso de reposição, guardamos só o e-mail.</p>
      <h2>Para que usamos</h2>
      <p>Processar e entregar pedidos, emitir nota fiscal, falar com você sobre a compra e, se você autorizar, avisar sobre drops e promoções. Não vendemos seus dados.</p>
      <h2>Pagamento</h2>
      <p>Os pagamentos são processados pelo Mercado Pago. A loja não recebe nem armazena dados de cartão.</p>
      <h2>Com quem compartilhamos</h2>
      <p>Somente com quem precisa para concluir a compra: processador de pagamento, transportadora e órgãos fiscais quando exigido por lei.</p>
      <h2>Armazenamento local</h2>
      <p>Usamos o armazenamento do seu navegador para lembrar o carrinho e os produtos vistos. Não usamos cookies de publicidade.</p>
      <h2>Seus direitos (LGPD)</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento{c.email ? <> pelo e-mail <a href={`mailto:${c.email}`}>{c.email}</a></> : ' pelo nosso WhatsApp'}. Para sair da lista de e-mails, use o link no rodapé das mensagens.</p>
      {c.legalName && <p className="small muted">Controlador dos dados: {c.legalName}{c.cnpj && ` · CNPJ ${c.cnpj}`}</p>}
    </section>
  );
}
