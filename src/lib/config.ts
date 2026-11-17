// Regras comerciais — lidas do .env no servidor e repassadas ao cliente quando necessário.
const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

export const shopConfig = {
  freeShippingCents: num(process.env.FREE_SHIPPING_CENTS, 29900),
  shippingCents: num(process.env.SHIPPING_CENTS, 2490),
  pixDiscountPercent: num(process.env.PIX_DISCOUNT_PERCENT, 5),
  maxInstallments: num(process.env.MAX_INSTALLMENTS, 6),
  minInstallmentCents: 3000,
};
export type ShopConfig = typeof shopConfig;

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const CATEGORIES: Record<string, string> = {
  roupas: 'Roupas',
  acessorios: 'Acessórios',
  skate: 'Skate',
};

export const TYPES: Record<string, { label: string; plural: string; category: string }> = {
  tee: { label: 'Camiseta', plural: 'Camisetas', category: 'roupas' },
  hoodie: { label: 'Moletom', plural: 'Moletons', category: 'roupas' },
  jacket: { label: 'Jaqueta', plural: 'Jaquetas', category: 'roupas' },
  pants: { label: 'Calça', plural: 'Calças', category: 'roupas' },
  shorts: { label: 'Bermuda', plural: 'Bermudas', category: 'roupas' },
  cap: { label: 'Boné', plural: 'Bonés', category: 'acessorios' },
  beanie: { label: 'Gorro', plural: 'Gorros', category: 'acessorios' },
  bag: { label: 'Bolsa', plural: 'Bolsas', category: 'acessorios' },
  socks: { label: 'Meia', plural: 'Meias', category: 'acessorios' },
  deck: { label: 'Shape', plural: 'Shapes', category: 'skate' },
};
