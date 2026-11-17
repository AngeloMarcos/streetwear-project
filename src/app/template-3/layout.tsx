import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { TplShell } from '@/templates/Shell';
import '@/templates/base.css';
import '@/templates/t3.css';

const font = Bricolage_Grotesque({ subsets: ['latin'], variable: '--tpl-font' });

// Template 3 · Comunidade (só apresentação: fora do Google)
export const metadata: Metadata = { title: 'Template 3 · Comunidade', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TplShell n={3} className={font.variable}>{children}</TplShell>;
}
