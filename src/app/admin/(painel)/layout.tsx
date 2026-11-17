import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { logout, requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

async function doLogout() {
  'use server';
  await logout();
  redirect('/admin/login');
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <nav className="admin__nav">
        <strong className="mono">Painel</strong>
        <Link href="/admin">Pedidos</Link>
        <Link href="/admin/produtos">Produtos</Link>
        <Link href="/admin/inscritos">Inscritos</Link>
        <Link href="/admin/avise-me">Avise-me</Link>
        <Link href="/" target="_blank">Ver loja ↗</Link>
        <form action={doLogout} style={{ marginLeft: 'auto' }}><button className="chip">Sair</button></form>
      </nav>
      <div className="admin__body">{children}</div>
    </div>
  );
}
