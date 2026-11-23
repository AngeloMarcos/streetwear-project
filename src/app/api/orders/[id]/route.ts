import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { markPaid, tokenMatches } from '@/lib/orders';
import { demoPayments } from '@/lib/mp';

type Ctx = { params: Promise<{ id: string }> };

async function load(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const t = new URL(req.url).searchParams.get('t');
  const o = await db.order.findUnique({ where: { id }, select: { id: true, status: true, accessToken: true } });
  return o && tokenMatches(o.accessToken, t) ? o : null;
}

/** Status do pedido (a página do Pix consulta a cada poucos segundos) */
export async function GET(req: Request, ctx: Ctx) {
  const o = await load(req, ctx);
  if (!o) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return NextResponse.json({ status: o.status }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Só no modo demonstração (sem Mercado Pago): simula o pagamento aprovado */
export async function POST(req: Request, ctx: Ctx) {
  if (!demoPayments()) return NextResponse.json({ error: 'indisponível' }, { status: 403 });
  const o = await load(req, ctx);
  if (!o) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  if (o.status === 'PENDING') await markPaid(o.id);
  return NextResponse.json({ ok: true });
}
