import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdmin, login } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

async function doLogin(formData: FormData) {
  'use server';
  const err = await login(String(formData.get('password') ?? ''));
  if (err) redirect(`/admin/login?e=${encodeURIComponent(err)}`);
  redirect('/admin');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect('/admin');
  const { e } = await searchParams;
  return (
    <section className="section" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 className="section__title">Admin</h1>
      <form action={doLogin} className="form" style={{ gridTemplateColumns: '1fr', marginTop: 24 }}>
        <label className="field">Senha<input type="password" name="password" required autoFocus autoComplete="current-password" /></label>
        {e && <p className="form-error" role="alert">{e}</p>}
        <button className="btn btn--block">Entrar</button>
      </form>
    </section>
  );
}
