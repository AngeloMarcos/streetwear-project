import { NextResponse } from 'next/server';
import { getProductsBySlugs, listProducts, searchProducts, type ProductDTO } from '@/lib/products';

/**
 * Lista enxuta de produtos para componentes do navegador:
 *  ?q=moletom              → busca instantânea (até 6)
 *  ?slugs=a,b,c            → vistos recentemente (na ordem pedida)
 *  ?leva=1&exclude=a,b     → sugestões baratas para o carrinho ("leva junto")
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get('q');
  const slugs = u.searchParams.get('slugs');
  let products: ProductDTO[];
  if (q !== null) products = await searchProducts(q, 6);
  else if (slugs) products = await getProductsBySlugs(slugs.split(',').slice(0, 12));
  else if (u.searchParams.get('leva')) {
    const exclude = (u.searchParams.get('exclude') ?? '').split(',').filter(Boolean).slice(0, 30);
    const all = await listProducts({ category: 'acessorios', slug: { notIn: exclude } });
    products = all.filter((p) => p.sizes.some((s) => s.available)).sort((a, b) => a.priceCents - b.priceCents).slice(0, 3);
  } else products = [];
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'no-store' } });
}
