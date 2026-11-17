'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { money } from '@/lib/pricing';

/** Newsletter e "me avisa do drop" — gravam o e-mail na tabela Subscriber */
export function EmailForm({ source, placeholder, button, className, light }: { source: string; placeholder: string; button: string; className?: string; light?: boolean }) {
  const { toast } = useCart();
  const [busy, setBusy] = useState(false);
  return (
    <form className={className} onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      setBusy(true);
      const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source }) }).catch(() => null);
      setBusy(false);
      if (r?.ok) { toast(source === 'newsletter' ? 'Bem-vindo à lista ✓' : 'Fechou! A gente te avisa antes de abrir.'); form.reset(); }
      else toast('Não deu pra cadastrar. Confere o e-mail.');
    }}>
      <input name="email" type="email" required placeholder={placeholder} aria-label="E-mail" />
      <button className={light ? 'btn btn--light' : undefined} disabled={busy}>{button}</button>
    </form>
  );
}

/** Estimativa de frete na página do produto (regra simples por região do CEP) */
export function ShippingCalc() {
  const { config } = useCart();
  const [cep, setCep] = useState('');
  const [result, setResult] = useState<React.ReactNode>(null);
  return (
    <>
      <form className="shipping-calc" onSubmit={(e) => {
        e.preventDefault();
        const d = cep.replace(/\D/g, '');
        if (d.length !== 8) { setResult('CEP inválido.'); return; }
        const near = d.startsWith('0') || d.startsWith('1');
        setResult(<>PAC: {near ? '3–5' : '6–10'} dias úteis · {money(config.shippingCents)}<br />SEDEX: {near ? '1–2' : '3–5'} dias úteis · {money(Math.round(config.shippingCents * 1.8))}<br /><b>Grátis acima de {money(config.freeShippingCents)}</b></>);
      }}>
        <input inputMode="numeric" maxLength={9} placeholder="Seu CEP" aria-label="CEP" value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'))} />
        <button className="btn" style={{ height: 40 }}>Calcular</button>
      </form>
      {result && <p className="small" style={{ marginTop: 8 }}>{result}</p>}
    </>
  );
}
