// Funções puras de preço — usadas no servidor (valor oficial) e no cliente (exibição).
import type { ShopConfig } from './config';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const money = (cents: number) => BRL.format(cents / 100);

export const pixPrice = (cents: number, cfg: ShopConfig) => Math.round(cents * (1 - cfg.pixDiscountPercent / 100));

export const installments = (cents: number, cfg: ShopConfig) =>
  Math.max(1, Math.min(cfg.maxInstallments, Math.floor(cents / cfg.minInstallmentCents)));

export function totals(subtotalCents: number, cfg: ShopConfig) {
  const shipping = subtotalCents === 0 || subtotalCents >= cfg.freeShippingCents ? 0 : cfg.shippingCents;
  const pixDiscount = subtotalCents - pixPrice(subtotalCents, cfg);
  return {
    subtotal: subtotalCents,
    shipping,
    total: subtotalCents + shipping,
    pixDiscount,
    pixTotal: subtotalCents - pixDiscount + shipping,
  };
}
