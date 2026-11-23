'use client';

import { usePathname } from 'next/navigation';

/** Checkout e página do pedido usam um topo e um rodapé enxutos (estilo checkout Shopify das referências):
 *  sem menu, sem faixa de avisos e sem popup, para o cliente não sair no meio da compra. */
export const isFocusRoute = (pathname: string) => /^\/(checkout|pedido)(\/|$)/.test(pathname);

export function SiteChrome({ children, focus = null }: { children: React.ReactNode; focus?: React.ReactNode }) {
  const pathname = usePathname();
  return <>{isFocusRoute(pathname) ? focus : children}</>;
}
