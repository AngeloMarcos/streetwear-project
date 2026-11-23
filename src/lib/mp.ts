// Integração Mercado Pago (SDK oficial v2).
// Pix: cobrança criada direto pela API (QR exibido na nossa página).
// Cartão e boleto: Checkout Pro (o cliente digita o cartão no ambiente do Mercado Pago — a loja nunca vê o cartão).
import crypto from 'node:crypto';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { siteUrl } from './config';

export const mpEnabled = () => Boolean(process.env.MP_ACCESS_TOKEN);

/** Modo demonstração (Pix falso + botão de simular pagamento): só sem Mercado Pago E fora de produção,
 *  ou com DEMO_PAYMENTS=1 explícito (testes locais). No ar, sem token, o checkout fica indisponível. */
export const demoPayments = () => !mpEnabled() && (process.env.NODE_ENV !== 'production' || process.env.DEMO_PAYMENTS === '1');

let client: MercadoPagoConfig | null = null;
const mp = () => {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado');
  client ??= new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, options: { timeout: 10000 } });
  return client;
};

/** MP só aceita notification_url pública em https */
const notificationUrl = () => {
  const base = siteUrl();
  return base.startsWith('https://') ? `${base}/api/webhooks/mercadopago` : undefined;
};

type Payer = { name: string; email: string; cpf: string };
const splitName = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(' ') || first };
};

export async function createPixPayment(o: { id: string; number: number; totalCents: number; expiresAt: Date; payer: Payer }) {
  const res = await new Payment(mp()).create({
    body: {
      transaction_amount: o.totalCents / 100,
      description: `Pedido #${o.number} — Street Dreams`,
      payment_method_id: 'pix',
      external_reference: o.id,
      notification_url: notificationUrl(),
      date_of_expiration: o.expiresAt.toISOString().replace('Z', '+00:00'),
      payer: { email: o.payer.email, ...splitName(o.payer.name), identification: { type: 'CPF', number: o.payer.cpf.replace(/\D/g, '') } },
    },
    requestOptions: { idempotencyKey: `pix-${o.id}` },
  });
  const td = res.point_of_interaction?.transaction_data;
  if (!res.id || !td?.qr_code) throw new Error('Mercado Pago não retornou o QR do Pix');
  return { paymentId: String(res.id), qr: td.qr_code, qrBase64: td.qr_code_base64 ?? null };
}

export async function createCheckoutPreference(o: {
  id: string; number: number; accessToken: string; method: 'CARD' | 'BOLETO'; maxInstallments: number;
  items: { id: string; title: string; qty: number; priceCents: number }[]; shippingCents: number; payer: Payer;
}) {
  const back = `${siteUrl()}/pedido/${o.id}?t=${o.accessToken}`;
  const items = o.items.map((i) => ({ id: i.id, title: i.title, quantity: i.qty, unit_price: i.priceCents / 100, currency_id: 'BRL' }));
  if (o.shippingCents > 0) items.push({ id: 'frete', title: 'Frete', quantity: 1, unit_price: o.shippingCents / 100, currency_id: 'BRL' });

  const excluded = o.method === 'CARD'
    ? [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }]
    : [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'bank_transfer' }, { id: 'prepaid_card' }];

  const res = await new Preference(mp()).create({
    body: {
      items,
      external_reference: o.id,
      notification_url: notificationUrl(),
      statement_descriptor: 'STREETDREAMS',
      back_urls: { success: back, pending: back, failure: back },
      auto_return: back.startsWith('https://') ? 'approved' : undefined,
      payer: { email: o.payer.email, name: splitName(o.payer.name).first_name, surname: splitName(o.payer.name).last_name, identification: { type: 'CPF', number: o.payer.cpf.replace(/\D/g, '') } },
      payment_methods: { excluded_payment_types: excluded, installments: o.method === 'CARD' ? o.maxInstallments : 1 },
    },
    requestOptions: { idempotencyKey: `pref-${o.id}` },
  });
  if (!res.id || !res.init_point) throw new Error('Mercado Pago não retornou o link de pagamento');
  return { preferenceId: res.id, url: res.init_point };
}

export async function getPayment(id: string) {
  return new Payment(mp()).get({ id });
}

/** Valida o cabeçalho x-signature do webhook (quando MP_WEBHOOK_SECRET está configurado) */
export function validWebhookSignature(headers: Headers, dataId: string | null) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado: confiamos só na consulta à API (o status é sempre buscado no MP)
  const sig = headers.get('x-signature') ?? '';
  const reqId = headers.get('x-request-id') ?? '';
  const parts = Object.fromEntries(sig.split(',').map((kv) => kv.trim().split('=') as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  let manifest = '';
  if (dataId) manifest += `id:${dataId.toLowerCase()};`;
  if (reqId) manifest += `request-id:${reqId};`;
  manifest += `ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
