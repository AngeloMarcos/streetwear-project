import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { shopConfig } from '@/lib/config';
import { isValidCPF } from '@/lib/cpf';
import { CheckoutError, PIX_MIN, cancelOrder, createOrder } from '@/lib/orders';
import { createCheckoutPreference, createPixPayment, mpEnabled } from '@/lib/mp';

const schema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1).max(40), qty: z.number().int().min(1).max(10) })).min(1).max(30),
  method: z.enum(['PIX', 'CARD', 'BOLETO']),
  customer: z.object({
    name: z.string().trim().min(3).max(100).refine((v) => v.includes(' '), 'Informe nome e sobrenome'),
    email: z.string().trim().email().max(120),
    cpf: z.string().refine(isValidCPF, 'CPF inválido'),
    phone: z.string().trim().max(20).default(''),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    street: z.string().trim().min(3).max(120),
    addressNumber: z.string().trim().min(1).max(10),
    complement: z.string().trim().max(60).default(''),
    district: z.string().trim().max(60).default(''),
    city: z.string().trim().min(2).max(60),
    uf: z.string().trim().length(2).transform((v) => v.toUpperCase()),
  }),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first ? `${first.path.at(-1) ?? 'dados'}: ${first.message}` : 'Dados inválidos' }, { status: 400 });
  }
  const input = parsed.data;

  let order;
  try {
    order = await createOrder(input);
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error('checkout:createOrder', e);
    return NextResponse.json({ error: 'Não foi possível criar o pedido. Tente de novo.' }, { status: 500 });
  }

  const orderUrl = `/pedido/${order.id}?t=${order.accessToken}`;

  // Sem Mercado Pago configurado: modo demonstração (para testes locais)
  if (!mpEnabled()) {
    if (order.paymentMethod === 'PIX') {
      await db.order.update({ where: { id: order.id }, data: { pixQr: `DEMO-PIX-${order.number}`, pixExpiresAt: new Date(Date.now() + PIX_MIN * 60_000) } });
    }
    return NextResponse.json({ redirect: orderUrl });
  }

  const payer = { name: order.name, email: order.email, cpf: order.cpf };
  try {
    if (order.paymentMethod === 'PIX') {
      const expiresAt = new Date(Date.now() + PIX_MIN * 60_000);
      const pix = await createPixPayment({ id: order.id, number: order.number, totalCents: order.totalCents, expiresAt, payer });
      await db.order.update({ where: { id: order.id }, data: { mpPaymentId: pix.paymentId, pixQr: pix.qr, pixQrBase64: pix.qrBase64, pixExpiresAt: expiresAt } });
      return NextResponse.json({ redirect: orderUrl });
    }
    const pref = await createCheckoutPreference({
      id: order.id, number: order.number, accessToken: order.accessToken, method: order.paymentMethod, maxInstallments: shopConfig.maxInstallments,
      items: order.items.map((i) => ({ id: i.variantId ?? i.id, title: `${i.name} ${i.colorName} (${i.size})`, qty: i.qty, priceCents: i.priceCents })),
      shippingCents: order.shippingCents, payer,
    });
    await db.order.update({ where: { id: order.id }, data: { mpPreferenceId: pref.preferenceId, mpCheckoutUrl: pref.url } });
    return NextResponse.json({ redirect: pref.url });
  } catch (e) {
    console.error('checkout:mercadopago', e);
    await cancelOrder(order.id, 'Falha ao gerar pagamento no Mercado Pago.');
    return NextResponse.json({ error: 'O pagamento não pôde ser iniciado. Tente outro método ou tente de novo.' }, { status: 502 });
  }
}
