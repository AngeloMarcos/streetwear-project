// Login do painel admin: senha única (ADMIN_PASSWORD) + cookie assinado com HMAC (ADMIN_SECRET).
import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'bloco_admin';
const TTL_MS = 1000 * 60 * 60 * 12; // 12h

const secret = () => {
  const s = process.env.ADMIN_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== 'production') return 'dev-secret-somente-local';
  return null; // produção sem segredo: admin desativado
};

const sign = (payload: string, s: string) => crypto.createHmac('sha256', s).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function isAdmin() {
  const s = secret();
  if (!s) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sign(exp, s), sig);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

// Limite simples de tentativas por IP (memória do processo)
const attempts = new Map<string, { n: number; until: number }>();

export async function login(password: string): Promise<string | null> {
  const s = secret();
  const pass = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'admin' : '');
  if (!s || !pass) return 'Admin desativado: configure ADMIN_PASSWORD e ADMIN_SECRET no .env.';

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local';
  const a = attempts.get(ip);
  if (a && a.n >= 8 && a.until > Date.now()) return 'Muitas tentativas. Aguarde 15 minutos.';

  const ok = safeEqual(crypto.createHash('sha256').update(password).digest('hex'), crypto.createHash('sha256').update(pass).digest('hex'));
  if (!ok) {
    const cur = a && a.until > Date.now() ? a : { n: 0, until: Date.now() + 15 * 60_000 };
    attempts.set(ip, { n: cur.n + 1, until: cur.until });
    return 'Senha incorreta.';
  }
  attempts.delete(ip);
  const exp = String(Date.now() + TTL_MS);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp, s)}`, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: TTL_MS / 1000,
  });
  return null;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
