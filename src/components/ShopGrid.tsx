'use client';

import { useMemo, useState } from 'react';
import type { ProductDTO } from '@/lib/products';
import { TYPES } from '@/lib/config';
import { ProductCard } from './ProductCard';

type Sort = 'relevancia' | 'novos' | 'menor' | 'maior';

export function ShopGrid({ products }: { products: ProductDTO[] }) {
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [sizes, setSizes] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>('relevancia');
  const [showFilters, setShowFilters] = useState(false);

  const allTypes = useMemo(() => [...new Set(products.map((p) => p.type))], [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))], [products]);
  const allColors = useMemo(() => [...new Map(products.map((p) => [p.color, p.colorName])).entries()], [products]);

  const toggle = (set: Set<string>, fn: (s: Set<string>) => void, v: string) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    fn(n);
  };

  const list = useMemo(() => {
    let l = products;
    if (types.size) l = l.filter((p) => types.has(p.type));
    if (sizes.size) l = l.filter((p) => p.sizes.some((s) => sizes.has(s.size) && s.available));
    if (colors.size) l = l.filter((p) => colors.has(p.color));
    const sorters: Record<Sort, (a: ProductDTO, b: ProductDTO) => number> = {
      relevancia: () => 0,
      novos: (a, b) => Number(b.tags.includes('novo')) - Number(a.tags.includes('novo')),
      menor: (a, b) => a.priceCents - b.priceCents,
      maior: (a, b) => b.priceCents - a.priceCents,
    };
    return [...l].sort(sorters[sort]);
  }, [products, types, sizes, colors, sort]);

  return (
    <>
      <div className="shop-toolbar">
        <button className="chip filters-toggle" onClick={() => setShowFilters(!showFilters)}>Filtros</button>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar">
          <option value="relevancia">Relevância</option>
          <option value="novos">Novos primeiro</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </div>
      <div className="shop">
        <aside className={`filters ${showFilters ? 'is-open' : ''}`}>
          {allTypes.length > 1 && (
            <div><h4>Tipo</h4>
              {allTypes.map((t) => (
                <label key={t}><input type="checkbox" checked={types.has(t)} onChange={() => toggle(types, setTypes, t)} /> {TYPES[t]?.label ?? t}</label>
              ))}
            </div>
          )}
          <div><h4>Tamanho</h4>
            {allSizes.map((s) => (
              <label key={s}><input type="checkbox" checked={sizes.has(s)} onChange={() => toggle(sizes, setSizes, s)} /> {s}</label>
            ))}
          </div>
          <div><h4>Cor</h4>
            <div className="swatches">
              {allColors.map(([hex, name]) => (
                <button key={hex} className={`swatch ${colors.has(hex) ? 'is-active' : ''}`} style={{ background: hex }} title={name} aria-label={name} aria-pressed={colors.has(hex)} onClick={() => toggle(colors, setColors, hex)} />
              ))}
            </div>
          </div>
          <button className="link-arrow" style={{ alignSelf: 'start' }} onClick={() => { setTypes(new Set()); setSizes(new Set()); setColors(new Set()); }}>Limpar filtros</button>
        </aside>
        <div>
          <p className="result-count">{list.length} {list.length === 1 ? 'produto' : 'produtos'}</p><br />
          <div className="grid">
            {list.length ? list.map((p) => <ProductCard key={p.id} p={p} />) : (
              <div className="empty" style={{ gridColumn: '1/-1' }}>
                <p className="section__title" style={{ fontSize: 40 }}>Nada por aqui.</p>
                <p className="muted">Tenta limpar os filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
