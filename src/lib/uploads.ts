import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const uploadDir = () => path.resolve(process.env.UPLOAD_DIR || './uploads');

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
export const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const MAX = 8 * 1024 * 1024;

/** Salva uma foto enviada pelo admin e devolve a URL pública (/uploads/arquivo) */
export async function saveImage(file: File, prefix: string) {
  const ext = TYPES[file.type];
  if (!ext) throw new Error(`Formato não suportado (${file.type || 'desconhecido'}). Use JPG, PNG, WEBP ou AVIF.`);
  if (file.size > MAX) throw new Error('Foto acima de 8 MB.');
  const safe = prefix.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'img';
  const name = `${safe}-${crypto.randomBytes(5).toString('hex')}.${ext}`;
  await fs.mkdir(uploadDir(), { recursive: true });
  await fs.writeFile(path.join(uploadDir(), name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string) {
  if (!url.startsWith('/uploads/')) return;
  const name = path.basename(url);
  await fs.unlink(path.join(uploadDir(), name)).catch(() => {});
}
