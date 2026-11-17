import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  if (!(await isAdmin())) return new Response('Não autorizado', { status: 401 });
  const subs = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  const csv = ['email,origem,data', ...subs.map((s) => `${s.email},${s.source},${s.createdAt.toISOString()}`)].join('\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="inscritos.csv"' } });
}
