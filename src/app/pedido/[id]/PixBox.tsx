'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Consulta o status a cada 5s e recarrega a página quando o pagamento for confirmado */
export function StatusWatcher({ id, token }: { id: string; token: string }) {
  const router = useRouter();
  useEffect(() => {
    const iv = setInterval(async () => {
      const r = await fetch(`/api/orders/${id}?t=${encodeURIComponent(token)}`, { cache: 'no-store' }).catch(() => null);
      const j = r?.ok ? await r.json() : null;
      if (j && j.status !== 'PENDING') { clearInterval(iv); router.refresh(); }
    }, 5000);
    return () => clearInterval(iv);
  }, [id, token, router]);
  return null;
}

/** QR ilustrativo para o modo demonstração */
function DemoQR({ seed }: { seed: string }) {
  let x = 0;
  for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => (x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const N = 25;
  const finder = (r: number, c: number) => [[0, 0], [0, N - 7], [N - 7, 0]].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.5) cells.push([r, c]);
  const F = ({ r, c }: { r: number; c: number }) => (<><rect x={c} y={r} width="7" height="7" /><rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" /><rect x={c + 2} y={r + 2} width="3" height="3" /></>);
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} style={{ background: '#fff' }} shapeRendering="crispEdges">
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)}
      <F r={0} c={0} /><F r={0} c={N - 7} /><F r={N - 7} c={0} />
    </svg>
  );
}

export function PixBox({ id, token, code, base64, amount, expiresAt, demo, onlySimulate }: {
  id: string; token: string; code: string; base64: string | null; amount: string; expiresAt: string | null; demo: boolean; onlySimulate?: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const d = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setLeft(`${Math.floor(d / 60000)}:${String(Math.floor(d / 1000) % 60).padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  const simulate = demo && (
    <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={async () => {
      await fetch(`/api/orders/${id}?t=${encodeURIComponent(token)}`, { method: 'POST' });
      router.refresh();
    }}>Simular pagamento aprovado (modo demo)</button>
  );
  if (onlySimulate) return <div>{simulate}</div>;

  return (
    <div style={{ margin: '24px 0' }}>
      <p style={{ maxWidth: 560, marginBottom: 12 }}>Abra o app do seu banco, escolha <b>Pix &gt; Ler QR code</b> ou use o <b>copia e cola</b>. Esta página atualiza sozinha quando o pagamento cair.</p>
      <div className="pix-qr" style={{ maxWidth: 600 }}>
        {base64
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={`data:image/png;base64,${base64}`} alt="QR code Pix" width={180} height={180} />
          : <DemoQR seed={code || id} />}
        <div>
          <strong>Pix · {amount}</strong>{left && <span className="muted small"> · expira em {left}</span>}
          <code>{code}</code>
          <button className="btn" style={{ height: 40, marginTop: 8 }} onClick={async () => {
            try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* sem permissão */ }
          }}>{copied ? 'Copiado ✓' : 'Copiar código'}</button>
        </div>
      </div>
      {demo && <p className="small muted" style={{ marginTop: 8 }}>Modo demonstração: configure MP_ACCESS_TOKEN para gerar Pix de verdade.</p>}
      {simulate}
    </div>
  );
}
