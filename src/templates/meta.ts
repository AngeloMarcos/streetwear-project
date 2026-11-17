// Templates de apresentação. Só visual: usam os mesmos dados, carrinho e checkout do site.
import type { ProductDTO } from '@/lib/products';
import { site } from '@/content/site';

export type TplN = 1 | 2 | 3;

export const TEMPLATES: { n: TplN; name: string; hint: string }[] = [
  { n: 1, name: 'Outlet direto', hint: 'muita opção, preço em destaque' },
  { n: 2, name: 'Drop / Lookbook', hint: 'premium, escuro, fotos grandes' },
  { n: 3, name: 'Comunidade', hint: 'feed, vídeos e grupo VIP' },
];

export const base = (n: TplN) => `/template-${n}`;
export const productHref = (n: TplN, slug: string) => `${base(n)}/produto/${slug}`;

/** "Marca" para o filtro: o catálogo não tem campo de marca, então usa a tag de collab */
export const brandOf = (p: ProductDTO) => (p.tags.includes('collab') ? `${site.name} × Estúdio X` : site.name);

/** Link de WhatsApp com mensagem pronta */
export const waLink = (text: string) => `${site.social.whatsapp}?text=${encodeURIComponent(text)}`;
export const vipLink = () => site.community.vipGroup || waLink(`Oi! Quero entrar no grupo VIP da ${site.name}.`);

/** Dados da empresa para o rodapé; mostra "a preencher" enquanto site.company estiver vazio */
export const companyInfo = () => {
  const c = site.company;
  return {
    name: c.legalName || site.fullName,
    cnpj: c.cnpj || '00.000.000/0001-00 (a preencher)',
    address: c.address || 'Endereço da empresa (a preencher)',
    email: c.email || 'contato@sualoja.com.br (a preencher)',
  };
};
