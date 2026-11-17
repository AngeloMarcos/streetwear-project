import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { CATEGORIES, TYPES } from '@/lib/config';
import { listProducts } from '@/lib/products';
import { ShopGrid } from '@/components/ShopGrid';

type SP = Promise<{ cat?: string; tag?: string; q?: string; tipo?: string }>;

const titleFor = ({ cat, tag, q, tipo }: Awaited<SP>) =>
  q ? `“${q}”` : tipo && TYPES[tipo] ? TYPES[tipo].plural : tag === 'novo' ? 'Novidades' : tag === 'collab' ? 'Collabs' : cat && CATEGORIES[cat] ? CATEGORIES[cat] : 'Tudo';

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return { title: titleFor(await searchParams) };
}

export default async function Shop({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput[] = [];
  if (sp.cat && CATEGORIES[sp.cat]) where.push({ category: sp.cat });
  if (sp.tag) where.push({ tags: { has: sp.tag } });
  if (sp.tipo && TYPES[sp.tipo]) where.push({ type: sp.tipo });
  if (sp.q) {
    const q = sp.q.slice(0, 60);
    where.push({ OR: [{ name: { contains: q, mode: 'insensitive' } }, { colorName: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] });
  }
  const products = await listProducts({ AND: where });
  const chip = (href: string, label: string, active: boolean) => <Link key={href} className={`chip ${active ? 'is-active' : ''}`} href={href}>{label}</Link>;

  return (
    <>
      <section className="shop-head">
        <h1>{titleFor(sp)}</h1>
        <div className="shop-head__bar">
          <div className="chips">
            {chip('/loja', 'Tudo', !sp.cat && !sp.tag && !sp.q && !sp.tipo)}
            {chip('/loja?tag=novo', 'Novidades', sp.tag === 'novo')}
            {Object.entries(CATEGORIES).map(([k, l]) => chip(`/loja?cat=${k}`, l, sp.cat === k))}
            {chip('/loja?tag=collab', 'Collabs', sp.tag === 'collab')}
          </div>
        </div>
      </section>
      {/* key força reset dos filtros ao trocar de categoria */}
      <ShopGrid key={JSON.stringify(sp)} products={products} />
    </>
  );
}
