import { useId } from 'react';
import { art, type ArtInput } from '@/lib/art';

type Props = { product: ArtInput & { images?: string[]; name?: string }; view?: 0 | 1 | 2; label?: boolean; blur?: boolean; bare?: boolean };

/** Mostra a foto real (se cadastrada no admin) ou o placeholder SVG.
 *  Fotos: images[0] = frente, images[1] = costas, images[2] = detalhe (cai na principal se faltar). */
export function ProductArt({ product, view = 0, label = false, blur = false, bare = false }: Props) {
  const uid = useId();
  const img = product.images?.[view] ?? product.images?.[0];
  const style = blur ? { filter: 'blur(8px) grayscale(.4)' } : undefined;
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <span className="art" style={style}><img src={img} alt={product.name ?? ''} loading="lazy" /></span>;
  }
  return <span className="art" style={style} dangerouslySetInnerHTML={{ __html: art(product, view, label, bare, uid) }} />;
}
