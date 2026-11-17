import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(120), variantId: z.string().min(1).max(40) });

/** Cliente pede aviso quando um tamanho esgotado voltar */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  const { email, variantId } = parsed.data;
  const v = await db.variant.findUnique({ where: { id: variantId }, select: { id: true } });
  if (!v) return NextResponse.json({ error: 'Tamanho não encontrado' }, { status: 404 });
  await db.stockAlert.upsert({ where: { variantId_email: { variantId, email } }, update: { notifiedAt: null }, create: { variantId, email } });
  return NextResponse.json({ ok: true });
}
