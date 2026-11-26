import fs from 'node:fs/promises';
import path from 'node:path';
import { MIME, uploadDir } from '@/lib/uploads';

// Serve as fotos enviadas pelo admin (ficam num volume fora do build)
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = path.basename(file);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!MIME[ext] || name !== file) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(uploadDir(), name));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': MIME[ext], 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
