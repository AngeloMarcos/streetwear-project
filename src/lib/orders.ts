import crypto from 'node:crypto';
import { Prisma, type PaymentMethod } from '@prisma/client';
import { db } from './db';
import { shopConfig } from './config';
import { pixPrice, totals } from './pricing';
import { salePriceCents } from './promo';

export class CheckoutError extends Error {}

const HOLD_MIN = Number(process.env.ORDER_HOLD_MINUTES || 120);
export const PIX_MIN = Number(process.env.PIX_EXPIRATION_MINUTES || 30);

export type CheckoutInput = {
  items: { variantId: string; qty: number }[];
  method: PaymentMethod;
  customer: { name: string; email: string; cpf: string; phone: string; cep: string; street: string; addressNumber: string; complement: string; district: string; city: string; uf: string };
};

/** Cria o pedido reservando o estoque (tudo ou nada). Preços sempre vêm do banco. */
export async function createOrder(input: CheckoutInput) {
  await releaseExpiredOrders();

  // agrupa variantes repetidas
  const qtyBy = new Map<string, number>();
  for (const i of input.items) qtyBy.set(i.variantId, (qtyBy.get(i.variantId) ?? 0) + i.qty);

  return db.$transaction(async (tx) => {
    const variants = await tx.variant.findMany({ where: { id: { in: [...qtyBy.keys()] } }, include: { product: true } });
    const now = new Date();
    const lines = [];
    for (const [variantId, qty] of qtyBy) {
      const v = variants.find((x) => x.id === variantId);
      if (!v || !v.product.active || (v.product.dropAt && v.product.dropAt > now)) throw new CheckoutError('Um dos produtos do carrinho não está mais disponível.');
      const r = await tx.variant.updateMany({ where: { id: variantId, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
      if (r.count === 0) throw new CheckoutError(`Sem estoque suficiente de ${v.product.name} (${v.size}). Ajuste o carrinho.`);
      lines.push({ v, qty });
    }

    const subtotal = lines.reduce((s, l) => s + salePriceCents(l.v.product, now) * l.qty, 0);
    const t = totals(subtotal, shopConfig);
    const isPix = input.method === 'PIX';
    const discount = isPix ? subtotal - pixPrice(subtotal, shopConfig) : 0;

    return tx.order.create({
      data: {
        accessToken: crypto.randomBytes(18).toString('base64url'),
        paymentMethod: input.method,
        subtotalCents: subtotal,
        shippingCents: t.shipping,
        discountCents: discount,
        totalCents: subtotal - discount + t.shipping,
        ...input.customer,
        items: {
          create: lines.map(({ v, qty }) => ({
            productId: v.productId, variantId: v.id, name: v.product.name, colorName: v.product.colorName, size: v.size, priceCents: salePriceCents(v.product, now), qty,
          })),
        },
      },
      include: { items: true },
    });
  }); // a baixa condicional (stock >= qty) já trava a linha e impede vender além do estoque
}

/** Devolve o estoque de um pedido (uma única vez) */
async function releaseStock(tx: Prisma.TransactionClient, orderId: string) {
  const o = await tx.order.updateMany({ where: { id: orderId, stockReleased: false }, data: { stockReleased: true } });
  if (o.count === 0) return;
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const i of items) {
    if (i.variantId) await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: i.qty } } });
  }
}

export async function cancelOrder(orderId: string, note?: string) {
  await db.$transaction(async (tx) => {
    const o = await tx.order.findUnique({ where: { id: orderId } });
    if (!o || o.status === 'CANCELED') return;
    await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELED', notes: note ? `${o.notes}\n${note}`.trim() : o.notes } });
    await releaseStock(tx, orderId);
  });
}

export async function markPaid(orderId: string, mpPaymentId?: string) {
  await db.$transaction(async (tx) => {
    const o = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!o || o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED') return;
    let notes = o.notes;
    if (o.status === 'CANCELED' && o.stockReleased) {
      // pagou depois de expirar: baixa o estoque de novo e avisa o admin
      for (const i of o.items) if (i.variantId) await tx.variant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.qty } } });
      notes = `${notes}\n⚠️ Pago após expirar — confira o estoque antes de enviar.`.trim();
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date(), stockReleased: false, notes, mpPaymentId: mpPaymentId ?? o.mpPaymentId },
    });
  });
}

/** Pedidos pendentes há muito tempo liberam o estoque reservado */
export async function releaseExpiredOrders() {
  const pixCut = new Date(Date.now() - (PIX_MIN + 5) * 60_000);
  const otherCut = new Date(Date.now() - HOLD_MIN * 60_000);
  const expired = await db.order.findMany({
    where: { status: 'PENDING', OR: [{ paymentMethod: 'PIX', createdAt: { lt: pixCut } }, { paymentMethod: { not: 'PIX' }, createdAt: { lt: otherCut } }] },
    select: { id: true },
    take: 50,
  });
  for (const o of expired) await cancelOrder(o.id, 'Expirado sem pagamento.');
}

export function tokenMatches(a: string, b: string | undefined | null) {
  if (!b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago — preparando envio',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};
export const METHOD_LABEL: Record<string, string> = { PIX: 'Pix', CARD: 'Cartão de crédito', BOLETO: 'Boleto' };
