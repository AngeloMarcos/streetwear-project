'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { TYPES } from '@/lib/config';
import { cancelOrder, markPaid } from '@/lib/orders';
import { deleteImage, saveImage } from '@/lib/uploads';

const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export async function updateOrder(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get('status')) as OrderStatus;
  const trackingCode = String(formData.get('trackingCode') ?? '').trim().toUpperCase().slice(0, 40);
  const notes = String(formData.get('notes') ?? '').slice(0, 2000);
  if (!STATUSES.includes(status)) throw new Error('Status inválido');

  const o = await db.order.findUniqueOrThrow({ where: { id } });
  if (status !== o.status) {
    if (status === 'CANCELED') await cancelOrder(id, 'Cancelado pelo admin.');
    else if (status === 'PAID' && (o.status === 'PENDING' || o.status === 'CANCELED')) await markPaid(id);
    else await db.order.update({ where: { id }, data: { status } });
  }
  // status SHIPPED com rastreio vazio é permitido, mas avisamos na tela
  await db.order.update({ where: { id }, data: { trackingCode, notes } });
  revalidatePath(`/admin/pedidos/${id}`);
  redirect(`/admin/pedidos/${id}?ok=1`);
}

/** "P:10 M:20 G:5" → [{size, stock}] */
function parseSizes(raw: string) {
  return raw.split(/[\n,;]+|\s+(?=[^\s:]+:)/).map((s) => s.trim()).filter(Boolean).map((s, i) => {
    const idx = s.lastIndexOf(':');
    const size = (idx > 0 ? s.slice(0, idx) : s).trim();
    const stock = idx > 0 ? Math.max(0, Math.floor(Number(s.slice(idx + 1)) || 0)) : 0;
    return { size, stock, sort: i };
  });
}

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const hex = (v: FormDataEntryValue | null, d: string) => (/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : d);

/** campo de % da Black Friday: vazio = padrão (null), senão 0–90 */
const bfField = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim();
  if (!s || Number.isNaN(Number(s))) return null;
  return Math.min(90, Math.max(0, Math.round(Number(s))));
};

/** datetime-local (horário de Brasília) → Date */
const parseLocal = (v: string) => (v ? new Date(`${v}:00-03:00`) : null);

export async function saveProduct(id: string | null, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const colorName = String(formData.get('colorName') ?? '').trim();
  const type = String(formData.get('type'));
  const price = Number(String(formData.get('price') ?? '').replace(',', '.'));
  if (!name || !colorName || !TYPES[type] || !(price > 0)) {
    redirect(`/admin/produtos/${id ?? 'novo'}?e=${encodeURIComponent('Preencha nome, cor, tipo e preço.')}`);
  }
  const slug = slugify(String(formData.get('slug') || `${name}-${colorName}`));
  const clash = await db.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) redirect(`/admin/produtos/${id ?? 'novo'}?e=${encodeURIComponent(`Já existe um produto com o endereço "${slug}".`)}`);

  const tags = ['novo', 'collab'].filter((t) => formData.get(`tag_${t}`) === 'on');
  const data = {
    slug, name, colorName, type, category: TYPES[type].category,
    priceCents: Math.round(price * 100),
    description: String(formData.get('description') ?? '').slice(0, 3000),
    color: hex(formData.get('color'), '#151515'),
    bg: hex(formData.get('bg'), '#e9e6df'),
    ink: hex(formData.get('ink'), '#ff4d00'),
    print: String(formData.get('print') ?? '').slice(0, 20),
    tags,
    active: formData.get('active') === 'on',
    dropAt: parseLocal(String(formData.get('dropAt') ?? '')),
    sort: Number(formData.get('sort')) || 0,
    bfPercent: bfField(formData.get('bfPercent')),
  };

  const product = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data });

  // fotos: remover marcadas + reordenar + adicionar novas
  const remove = new Set(formData.getAll('removeImage').map(String));
  let images = product.images.filter((u) => !remove.has(u));
  for (const u of remove) await deleteImage(u);
  const errors: string[] = [];
  for (const f of formData.getAll('images')) {
    if (f instanceof File && f.size > 0) {
      try { images.push(await saveImage(f, slug)); } catch (e) { errors.push((e as Error).message); }
    }
  }
  const main = String(formData.get('mainImage') ?? '');
  if (main && images.includes(main)) images = [main, ...images.filter((u) => u !== main)];
  await db.product.update({ where: { id: product.id }, data: { images } });

  // tamanhos e estoque
  const sizes = parseSizes(String(formData.get('sizes') ?? ''));
  const existing = await db.variant.findMany({ where: { productId: product.id } });
  for (const s of sizes) {
    await db.variant.upsert({
      where: { productId_size: { productId: product.id, size: s.size } },
      update: { stock: s.stock, sort: s.sort },
      create: { productId: product.id, ...s },
    });
  }
  const keep = new Set(sizes.map((s) => s.size));
  const gone = existing.filter((v) => !keep.has(v.size)).map((v) => v.id);
  if (gone.length) await db.variant.deleteMany({ where: { id: { in: gone } } });

  revalidatePath('/', 'layout');
  const q = errors.length ? `?e=${encodeURIComponent(errors.join(' '))}` : '?ok=1';
  redirect(`/admin/produtos/${product.id}${q}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const sold = await db.orderItem.count({ where: { productId: id } });
  if (sold > 0) {
    // produto com vendas: só desativa, para manter o histórico
    await db.product.update({ where: { id }, data: { active: false } });
  } else {
    const p = await db.product.delete({ where: { id } });
    for (const u of p.images) await deleteImage(u);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/produtos');
}

export async function markAlertsNotified(variantId: string) {
  await requireAdmin();
  await db.stockAlert.updateMany({ where: { variantId, notifiedAt: null }, data: { notifiedAt: new Date() } });
  revalidatePath('/admin/avise-me');
}
