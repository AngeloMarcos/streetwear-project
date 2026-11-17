'use client';

import { usePathname } from 'next/navigation';

/** Esconde o topo e o rodapé do site principal nas rotas de apresentação /template-1, -2, -3
 *  (cada template tem o seu próprio). Não muda nada nas outras páginas. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (/^\/template-\d/.test(pathname)) return null;
  return <>{children}</>;
}
