import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(120), source: z.enum(['newsletter', 'drop', 'black-friday', 'popup']).default('newsletter') });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  await db.subscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: parsed.data });
  return NextResponse.json({ ok: true });
}
