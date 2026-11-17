import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';
import { site } from '@/content/site';
import { listProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ['', '/loja', '/drop', '/collabs', '/lookbook', '/blog', '/black-friday', '/sobre', '/ajuda', '/privacidade', '/termos'];
  const products = await listProducts().catch(() => []);
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 })),
    ...site.journal.map((j) => ({ url: `${base}/blog/${j.slug}`, lastModified: new Date(`${j.date}T12:00:00-03:00`), priority: 0.5 })),
    ...products.map((p) => ({ url: `${base}/produto/${p.slug}`, changeFrequency: 'daily' as const, priority: 0.8 })),
  ];
}
