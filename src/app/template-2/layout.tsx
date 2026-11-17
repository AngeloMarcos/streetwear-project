import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import { TplShell } from '@/templates/Shell';
import '@/templates/base.css';
import '@/templates/t2.css';

const font = Inter_Tight({ subsets: ['latin'], weight: ['400', '600'], variable: '--tpl-font' });

// Template 2 · Drop / Lookbook (só apresentação: fora do Google)
export const metadata: Metadata = { title: 'Template 2 · Drop / Lookbook', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TplShell n={2} className={font.variable}>{children}</TplShell>;
}
