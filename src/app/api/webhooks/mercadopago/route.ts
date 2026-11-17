import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cancelOrder, markPaid } from '@/lib/orders';
import { getPayment, mpEnabled, validWebhookSignature } from '@/lib/mp';

// Mercado Pago avisa aqui quando um pagamento muda de status.
// Nunca confiamos no corpo da notificação: buscamos o pagamento na API do MP pelo id.
export async function POST(req: Request) {
  if (!mpEnabled()) return NextResponse.json({ ok: true });
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };
  const type = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
  const dataId = String(body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? '');

  if (type !== 'payment' || !dataId) return NextResponse.json({ ignored: true });
  if (!validWebhookSignature(req.headers, url.searchParams.get('data.id') ?? dataId)) {
    return NextResponse.json({ error: 'assinatura inválida' }, { status: 401 });
  }

  try {
    const pay = await getPayment(dataId);
    const orderId = pay.external_reference;
    if (!orderId) return NextResponse.json({ ignored: true });
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ ignored: true });

    // o valor pago precisa bater com o pedido
    const paidCents = Math.round(Number(pay.transaction_amount ?? 0) * 100);
    switch (pay.status) {
      case 'approved':
        if (paidCents + 1 < order.totalCents) {
          await db.order.update({ where: { id: order.id }, data: { notes: `${order.notes}\n⚠️ Pagamento ${dataId} aprovado com valor menor (${paidCents}).`.trim() } });
          break;
        }
        await markPaid(order.id, String(pay.id));
        break;
      case 'rejected':
      case 'cancelled':
        // Pix expirado ou cartão recusado: no Checkout Pro o cliente pode tentar de novo, então só cancelamos Pix
        if (order.status === 'PENDING' && order.paymentMethod === 'PIX') await cancelOrder(order.id, `Pagamento ${pay.status}.`);
        break;
      case 'refunded':
      case 'charged_back':
        await cancelOrder(order.id, `Pagamento ${pay.status} (${dataId}).`);
        break;
      default:
        await db.order.update({ where: { id: order.id }, data: { mpPaymentId: String(pay.id) } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('webhook:mercadopago', e);
    return NextResponse.json({ error: 'erro' }, { status: 500 }); // MP tenta de novo
  }
}
