import { db } from './db';
import type { Prisma } from '@prisma/client';
import { cache } from 'react';
import { TYPES } from './config';
import { bfInfo, bfPercentFor, blackFriday, offPercentNow, salePriceCents } from './promo';

const withVariants = { variants: { orderBy: { sort: 'asc' } } } satisfies Prisma.ProductInclude;
export type ProductFull = Prisma.ProductGetPayload<{ include: typeof withVariants }>;

/** Formato enxuto e serializável que vai para os componentes de cliente */
export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string;
  /** preço cobrado agora (já com Black Friday, se valendo) */
  priceCents: number;
  /** preço cheio, para mostrar riscado */
  fullPriceCents: number;
  /** % de desconto valendo agora (0 = sem desconto) */
  offPercent: number;
  /** % que o produto terá na Black Friday (para a prévia) */
  bfPercent: number;
  colorName: string;
  color: string;
  bg: string;
  ink: string;
  print: string;
  tags: string[];
  images: string[];
  sizes: { id: string; size: string; available: boolean; stock: number }[];
};

export const toDTO = (p: ProductFull): ProductDTO => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  type: p.type,
  category: p.category,
  priceCents: salePriceCents(p),
  fullPriceCents: p.priceCents,
  offPercent: offPercentNow(p),
  bfPercent: bfPercentFor(p),
  colorName: p.colorName,
  color: p.color,
  bg: p.bg,
  ink: p.ink,
  print: p.print,
  tags: p.tags,
  images: p.images,
  sizes: p.variants.map((v) => ({ id: v.id, size: v.size, available: v.stock > 0, stock: v.stock })),
});

/** Produtos à venda agora (ativos e com drop já liberado) */
const live = (): Prisma.ProductWhereInput => ({
  active: true,
  OR: [{ dropAt: null }, { dropAt: { lte: new Date() } }],
});

export async function listProducts(where: Prisma.ProductWhereInput = {}, take?: number) {
  const rows = await db.product.findMany({
    where: { AND: [live(), where] },
    include: withVariants,
    orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
    take,
  });
  return rows.map(toDTO);
}

export async function getProduct(slug: string) {
  const p = await db.product.findFirst({ where: { slug, ...live() }, include: withVariants });
  return p ? toDTO(p) : null;
}

export async function getProductsBySlugs(slugs: string[]) {
  const rows = await listProducts({ slug: { in: slugs } });
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter(Boolean) as ProductDTO[];
}

/** Próximo drop: produtos com dropAt no futuro, agrupados pela data mais próxima */
export async function getUpcomingDrop() {
  const first = await db.product.findFirst({
    where: { active: true, dropAt: { gt: new Date() } },
    orderBy: { dropAt: 'asc' },
    select: { dropAt: true },
  });
  if (!first?.dropAt) return null;
  const items = await db.product.findMany({
    where: { active: true, dropAt: first.dropAt },
    include: withVariants,
    orderBy: { sort: 'asc' },
  });
  return { at: first.dropAt, items: items.map(toDTO) };
}

/** Produtos que entram na Black Friday, maiores descontos primeiro */
export async function listBlackFriday() {
  const all = await listProducts();
  return all.filter((p) => p.bfPercent > 0).sort((a, b) => b.bfPercent - a.bfPercent);
}

/** Dados da campanha + maior desconto do catálogo ("até X% off"). Uma consulta por requisição. */
export const getBf = cache(async () => {
  const rows = await db.product.findMany({ where: { active: true }, select: { bfPercent: true } });
  const max = rows.reduce((m, r) => Math.max(m, bfPercentFor(r)), 0) || blackFriday.percent;
  return bfInfo(max);
});

/** Mais vendidos: soma das peças em pedidos pagos; completa com novidades se ainda houver poucas vendas */
export async function listBestSellers(take = 8) {
  const sold = await db.orderItem.groupBy({
    by: ['productId'],
    where: { productId: { not: null }, order: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
    _sum: { qty: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: take * 2,
  });
  const ids = sold.map((s) => s.productId!).filter(Boolean);
  const ranked = ids.length ? await listProducts({ id: { in: ids } }) : [];
  ranked.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  const inStock = ranked.filter((p) => p.sizes.some((s) => s.available));
  if (inStock.length >= take) return inStock.slice(0, take);
  // completa com a coleção anterior primeiro (as novidades já têm seção própria na home)
  const fill = await listProducts({ id: { notIn: inStock.map((p) => p.id) }, NOT: { tags: { has: 'novo' } } }, take * 2);
  return [...inStock, ...fill.filter((p) => p.sizes.some((s) => s.available))].slice(0, take);
}

/** Busca simples por nome, cor, tipo ou descrição */
export async function searchProducts(q: string, take?: number) {
  const term = q.trim().slice(0, 60);
  if (!term) return [];
  const typeKeys = Object.entries(TYPES).filter(([, t]) => t.label.toLowerCase().startsWith(term.toLowerCase().slice(0, 5))).map(([k]) => k);
  return listProducts({
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { colorName: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      ...(typeKeys.length ? [{ type: { in: typeKeys } }] : []),
    ],
  }, take);
}
