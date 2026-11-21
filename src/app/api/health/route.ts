import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Usado pelo vigia da VPS (scripts/watchdog.sh): 200 se a loja e o banco respondem */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
