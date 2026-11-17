import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import { TplShell } from '@/templates/Shell';
import '@/templates/base.css';
import '@/templates/t1.css';

const font = Archivo({ subsets: ['latin'], weight: ['400', '600', '800', '900'], variable: '--tpl-font' });

// Template 1 · Outlet direto (só apresentação: fora do Google)
export const metadata: Metadata = { title: 'Template 1 · Outlet direto', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TplShell n={1} className={font.variable}>{children}</TplShell>;
}
