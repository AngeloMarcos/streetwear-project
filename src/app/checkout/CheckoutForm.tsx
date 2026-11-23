'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { ProductArt } from '@/components/ProductArt';
import { installments, money } from '@/lib/pricing';

const maskCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskCEP = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');

type Method = 'PIX' | 'CARD' | 'BOLETO';

export function CheckoutForm() {
  const { lines, totals: t, config, count, clear, sync } = useCart();
  useEffect(() => { sync(); }, [sync]);
  const saved = lines.reduce((s, l) => s + Math.max(0, (l.fullPriceCents ?? l.priceCents) - l.priceCents) * l.qty, 0); // confere preço e estoque antes de pagar
  const [method, setMethod] = useState<Method>('PIX');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [addr, setAddr] = useState({ street: '', district: '', city: '', uf: '' });
  const n = installments(t.total, config);

  if (!lines.length) {
    return (
      <section className="section">
        <h1 className="empty__title">Seu carrinho está vazio.</h1>
        <p className="muted" style={{ margin: '8px 0 20px' }}>Escolha suas peças e volte aqui para finalizar.</p>
        <Link className="btn" href="/loja">Ir pra loja</Link>
      </section>
    );
  }

  async function lookupCEP(cep: string) {
    const d = cep.replace(/\D/g, '');
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (!j.erro) setAddr({ street: j.logradouro ?? '', district: j.bairro ?? '', city: j.localidade ?? '', uf: j.uf ?? '' });
    } catch { /* preenchimento manual */ }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        items: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
        customer: {
          name: f.name, email: f.email, cpf: f.cpf, phone: f.phone, cep: f.cep, street: f.street, addressNumber: f.addressNumber,
          complement: f.complement, district: f.district, city: f.city, uf: f.uf,
        },
      }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !j.redirect) {
      setBusy(false);
      setError(j.error ?? 'Falha de conexão. Tente de novo.');
      return;
    }
    clear();
    window.location.href = j.redirect;
  }

  return (
    <section className="checkout">
      <form onSubmit={submit}>
        <nav className="co-steps" aria-label="Etapas"><Link href="/loja">Carrinho</Link><span>›</span><b>Dados e entrega</b><span>›</span><span>Pagamento</span></nav>
        <h1 className="co-title">Finalizar compra</h1>
        <h2 className="co-h">Contato</h2>
        <div className="form">
          <label className="field full">Nome completo<input required name="name" autoComplete="name" /></label>
          <label className="field">E-mail<input required type="email" name="email" autoComplete="email" /></label>
          <label className="field">Celular<input name="phone" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" onChange={(e) => (e.target.value = maskPhone(e.target.value))} /></label>
          <label className="field full">CPF<input required name="cpf" inputMode="numeric" placeholder="000.000.000-00" maxLength={14} onChange={(e) => (e.target.value = maskCPF(e.target.value))} /></label>
        </div>

        <h2 className="co-h">Entrega</h2>
        <div className="form">
          <label className="field">CEP<input required name="cep" inputMode="numeric" placeholder="00000-000" maxLength={9} autoComplete="postal-code"
            onChange={(e) => { e.target.value = maskCEP(e.target.value); lookupCEP(e.target.value); }} /></label>
          <label className="field">Número<input required name="addressNumber" /></label>
          <label className="field full">Endereço<input required name="street" autoComplete="address-line1" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} /></label>
          <label className="field">Complemento<input name="complement" autoComplete="address-line2" /></label>
          <label className="field">Bairro<input name="district" value={addr.district} onChange={(e) => setAddr({ ...addr, district: e.target.value })} /></label>
          <label className="field">Cidade<input required name="city" autoComplete="address-level2" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></label>
          <label className="field">UF<input required name="uf" maxLength={2} autoComplete="address-level1" value={addr.uf} onChange={(e) => setAddr({ ...addr, uf: e.target.value.toUpperCase() })} /></label>
        </div>

        <h2 className="co-h">Pagamento</h2>
        <p className="co-sub">Você paga no ambiente seguro do Mercado Pago.</p>
        <div className="pay-options">
          <label className="pay-opt"><input type="radio" name="pay" checked={method === 'PIX'} onChange={() => setMethod('PIX')} />
            <div><strong>Pix — {money(t.pixTotal)}</strong><small>{config.pixDiscountPercent}% de desconto · aprovação na hora</small></div></label>
          <label className="pay-opt"><input type="radio" name="pay" checked={method === 'CARD'} onChange={() => setMethod('CARD')} />
            <div><strong>Cartão de crédito — até {n}x de {money(Math.round(t.total / n))}</strong><small>Sem juros · você digita o cartão no ambiente seguro do Mercado Pago</small></div></label>
          <label className="pay-opt"><input type="radio" name="pay" checked={method === 'BOLETO'} onChange={() => setMethod('BOLETO')} />
            <div><strong>Boleto — {money(t.total)}</strong><small>Compensação em até 2 dias úteis</small></div></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn--block co-pay" disabled={busy}>{busy ? 'Processando…' : method === 'PIX' ? `Gerar Pix · ${money(t.pixTotal)}` : `Ir para pagamento · ${money(t.total)}`}</button>
        <p className="co-legal">Ao finalizar você concorda com a política de trocas. Seus dados são usados só para entrega e nota fiscal.</p>
      </form>

      <aside className="summary">
        <h2 className="co-h co-h--sum">Resumo · {count} {count === 1 ? 'item' : 'itens'}</h2>
        {lines.map((l) => (
          <div className="line" key={l.variantId} style={{ gridTemplateColumns: '56px 1fr auto' }}>
            <div className="line__img"><ProductArt product={l.art} /><span className="co-qty">{l.qty}</span></div>
            <div><div className="line__name">{l.name}</div><div className="muted small">{l.colorName} · {l.size}</div></div>
            <div className="price">
              {l.fullPriceCents && l.fullPriceCents > l.priceCents && <s className="price-old">{money(l.fullPriceCents * l.qty)}</s>}
              {money(l.priceCents * l.qty)}
            </div>
          </div>
        ))}
        <div className="totals">
          {saved > 0 && <div className="bf-saved"><span>Economia Black Friday</span><span>−{money(saved)}</span></div>}
          <div><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
          <div><span>Frete</span><span>{t.shipping ? money(t.shipping) : 'Grátis'}</span></div>
          {method === 'PIX' && <div className="pix"><span>Desconto Pix</span><span>−{money(t.pixDiscount)}</span></div>}
          <div className="grand"><span>Total</span><span>{money(method === 'PIX' ? t.pixTotal : t.total)}</span></div>
        </div>
      </aside>
    </section>
  );
}
