import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { TYPES } from '@/lib/config';
import { blackFriday } from '@/lib/promo';
import { ProductArt } from '@/components/ProductArt';
import { deleteProduct, saveProduct } from '../../actions';

/** Date → valor de <input type="datetime-local"> no horário de Brasília */
const toLocal = (d: Date | null) => (d ? new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 16) : '');

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  const [{ id }, { ok, e }] = await Promise.all([params, searchParams]);
  const isNew = id === 'novo';
  const p = isNew ? null : await db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sort: 'asc' } } } });
  if (!isNew && !p) notFound();
  const sizes = p ? p.variants.map((v) => `${v.size}:${v.stock}`).join(' ') : 'P:0 M:0 G:0 GG:0';
  const preview = p ?? { slug: '', type: 'tee', color: '#151515', bg: '#e9e6df', ink: '#ff4d00', print: 'BLOCO', images: [] as string[] };

  return (
    <>
      <p><Link href="/admin/produtos" className="link-arrow">← Produtos</Link></p>
      <h1 className="section__title" style={{ margin: '16px 0' }}>{isNew ? 'Novo produto' : p!.name}</h1>
      {ok && <p className="admin-ok">Salvo ✓ {p && <Link className="link-arrow" href={`/produto/${p.slug}`} target="_blank">ver na loja ↗</Link>}</p>}
      {e && <p className="form-error">{e}</p>}

      <form action={saveProduct.bind(null, isNew ? null : id)} className="admin-grid">
        <div className="panel">
          <h4 className="mono">Dados</h4>
          <div className="form">
            <label className="field full">Nome<input name="name" required defaultValue={p?.name} placeholder="Camiseta Bloco Logo" /></label>
            <label className="field">Cor (nome)<input name="colorName" required defaultValue={p?.colorName} placeholder="Preta" /></label>
            <label className="field">Preço (R$)<input name="price" required inputMode="decimal" defaultValue={p ? (p.priceCents / 100).toFixed(2) : ''} placeholder="149.90" /></label>
            <label className="field">Tipo
              <select name="type" defaultValue={p?.type ?? 'tee'}>
                {Object.entries(TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
            </label>
            <label className="field">Endereço (slug)<input name="slug" defaultValue={p?.slug} placeholder="gerado automaticamente" /></label>
            <label className="field full">Tamanhos e estoque<input name="sizes" defaultValue={sizes} placeholder="P:10 M:20 G:15 GG:5" /></label>
            <p className="small muted full">Formato <code>TAMANHO:QUANTIDADE</code> separados por espaço. Ex.: <code>38:5 40:8</code> ou <code>Único:30</code>. Remover um tamanho daqui apaga ele.</p>
            <label className="field full">Descrição<textarea name="description" rows={4} defaultValue={p?.description} /></label>
            <label className="check"><input type="checkbox" name="tag_novo" defaultChecked={p?.tags.includes('novo') ?? true} /> Novo</label>
            <label className="check"><input type="checkbox" name="tag_collab" defaultChecked={p?.tags.includes('collab')} /> Collab</label>
            <label className="check full"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} /> Ativo (visível na loja)</label>
            <label className="field">Lançar no drop em<input type="datetime-local" name="dropAt" defaultValue={toLocal(p?.dropAt ?? null)} /></label>
            <label className="field">Ordem<input type="number" name="sort" defaultValue={p?.sort ?? 0} /></label>
            <label className="field">Desconto Black Friday (%)<input type="number" name="bfPercent" min={0} max={90} defaultValue={p?.bfPercent ?? ''} placeholder={`padrão: ${blackFriday.percent}%`} /></label>
            <p className="small muted full">Black Friday de {blackFriday.start.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} a {blackFriday.end.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Deixe vazio para usar o desconto padrão ou coloque <code>0</code> para deixar o produto fora da promoção.</p>
            <p className="small muted full">Com data de drop no futuro, o produto aparece bloqueado na página Drop e entra na loja sozinho no horário (Brasília).</p>
          </div>
        </div>

        <div className="panel">
          <h4 className="mono">Fotos</h4>
          <p className="small muted">1ª = frente (capa), 2ª = costas (aparece ao passar o mouse), 3ª = detalhe. JPG/PNG/WEBP até 8 MB. Ideal: 1200×1500 (4:5).</p>
          <div className="photo-list">
            {p?.images.map((u, i) => (
              <div key={u} className="photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" />
                <label className="small"><input type="radio" name="mainImage" value={u} defaultChecked={i === 0} /> capa</label>
                <label className="small"><input type="checkbox" name="removeImage" value={u} /> remover</label>
              </div>
            ))}
          </div>
          <input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/avif" multiple />

          <h4 className="mono" style={{ marginTop: 20 }}>Placeholder (sem foto)</h4>
          <div className="form">
            <label className="field">Cor da peça<input type="color" name="color" defaultValue={preview.color} /></label>
            <label className="field">Fundo<input type="color" name="bg" defaultValue={preview.bg} /></label>
            <label className="field">Estampa<input type="color" name="ink" defaultValue={preview.ink} /></label>
            <label className="field">Texto da estampa<input name="print" defaultValue={preview.print} maxLength={20} /></label>
          </div>
          <div className="thumb-lg"><ProductArt product={{ ...preview, images: [] }} view={1} /></div>
        </div>

        <div className="panel" style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn">Salvar produto</button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteProduct.bind(null, id)} style={{ marginTop: 24 }}>
          <button className="btn btn--ghost">Excluir produto</button>
          <p className="small muted">Produtos que já tiveram vendas são apenas desativados.</p>
        </form>
      )}
    </>
  );
}
