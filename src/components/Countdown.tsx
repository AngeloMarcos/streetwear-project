'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Countdown({ to }: { to: string }) {
  const router = useRouter();
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= target) { clearInterval(id); router.refresh(); } // drop liberado: recarrega os dados
    }, 1000);
    return () => clearInterval(id);
  }, [target, router]);

  const diff = now === null ? 0 : Math.max(0, target - now);
  const parts = [
    [Math.floor(diff / 864e5), 'DIAS'],
    [Math.floor(diff / 36e5) % 24, 'HORAS'],
    [Math.floor(diff / 6e4) % 60, 'MIN'],
    [Math.floor(diff / 1e3) % 60, 'SEG'],
  ] as const;
  return (
    <div className="countdown" suppressHydrationWarning>
      {parts.map(([v, l]) => <div key={l}><b>{now === null ? '--' : String(v).padStart(2, '0')}</b><span>{l}</span></div>)}
    </div>
  );
}
