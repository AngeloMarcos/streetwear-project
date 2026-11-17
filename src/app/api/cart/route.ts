import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { salePriceCents } from '@/lib/promo';

const schema = z.object({ ids: z.array(z.string().min(1).max(40)).max(30) });

/** Preço e estoque atuais dos itens do carrinho (o carrinho fica no navegador e pode estar desatualizado) */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  const now = new Date();
  const rows = await db.variant.findMany({ where: { id: { in: parsed.data.ids } }, include: { product: true } });
  const items: Record<string, { priceCents: number; fullPriceCents: number; stock: number }> = {};
  for (const v of rows) {
    const live = v.product.active && (!v.product.dropAt || v.product.dropAt <= now);
    items[v.id] = { priceCents: salePriceCents(v.product, now), fullPriceCents: v.product.priceCents, stock: live ? v.stock : 0 };
  }
  return NextResponse.json({ items });
}
