'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ShopConfig } from '@/lib/config';
import { totals } from '@/lib/pricing';
import type { ProductDTO } from '@/lib/products';

export type CartLine = {
  variantId: string;
  slug: string;
  name: string;
  colorName: string;
  size: string;
  priceCents: number; // apenas exibição — o servidor recalcula no checkout
  fullPriceCents?: number; // preço cheio (riscado quando há desconto)
  qty: number;
  art: { slug: string; type: string; color: string; bg: string; ink: string; print: string; images: string[] };
};

type Ctx = {
  lines: CartLine[];
  count: number;
  totals: ReturnType<typeof totals>;
  config: ShopConfig;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: ProductDTO, variantId: string, qty?: number, opts?: { silent?: boolean }) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  toast: (msg: string) => void;
  sync: () => Promise<void>;
};

const CartCtx = createContext<Ctx | null>(null);
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart fora do CartProvider');
  return c;
};

const KEY = 'bloco.cart.v1';

export function CartProvider({ config, children }: { config: ShopConfig; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* sem storage */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* sem storage */ }
  }, [lines]);

  // atualiza preços (ex.: começou/acabou a Black Friday) e estoque ao abrir a loja e o carrinho
  const syncing = useRef(false);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const sync = useCallback(async () => {
    if (syncing.current) return;
    const ids = linesRef.current.map((l) => l.variantId);
    if (!ids.length) return;
    syncing.current = true;
    try {
      const r = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      if (!r.ok) return;
      const { items } = (await r.json()) as { items: Record<string, { priceCents: number; fullPriceCents: number; stock: number }> };
      setLines((prev) => prev.flatMap((l) => {
        const it = items[l.variantId];
        if (!it || it.stock <= 0) return [];
        return [{ ...l, priceCents: it.priceCents, fullPriceCents: it.fullPriceCents, qty: Math.min(l.qty, it.stock) }];
      }));
    } catch { /* offline: mantém o carrinho */ } finally { syncing.current = false; }
  }, []);
  useEffect(() => { if (open) sync(); }, [open, sync]);
  useEffect(() => { const id = setTimeout(sync, 400); return () => clearTimeout(id); }, [sync]); // depois de ler o localStorage

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastOn(false), 2400);
  }, []);

  const add = useCallback<Ctx['add']>((p, variantId, qty = 1, opts) => {
    const v = p.sizes.find((s) => s.id === variantId);
    if (!v || v.stock <= 0) return;
    setLines((prev) => {
      const ex = prev.find((l) => l.variantId === variantId);
      const max = v.stock;
      if (ex) return prev.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(max, l.qty + qty) } : l));
      return [...prev, {
        variantId, slug: p.slug, name: p.name, colorName: p.colorName, size: v.size, priceCents: p.priceCents, fullPriceCents: p.fullPriceCents, qty: Math.min(max, qty),
        art: { slug: p.slug, type: p.type, color: p.color, bg: p.bg, ink: p.ink, print: p.print, images: p.images },
      }];
    });
    if (!opts?.silent) toast(`${p.name} (${v.size}) no carrinho`);
  }, [toast]);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l))));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => {
    const subtotal = lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
    return {
      lines, count: lines.reduce((s, l) => s + l.qty, 0), totals: totals(subtotal, config), config,
      open, setOpen, add, setQty, clear, toast, sync,
    };
  }, [lines, config, open, add, setQty, clear, toast, sync]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className={`toast ${toastOn ? 'is-show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </CartCtx.Provider>
  );
}
