'use client';

import { useEffect, useState } from 'react';

/** Linha de data e hora ao vivo sob o menu (Aimé Leon Dore / Supreme) */
export function Dateline({ place = 'São Paulo, SP' }: { place?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const tz = { timeZone: 'America/Sao_Paulo' } as const;
  return (
    <p className="dateline" suppressHydrationWarning>
      {place}
      {now && <> | {now.toLocaleDateString('pt-BR', { ...tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | {now.toLocaleTimeString('pt-BR', { ...tz, hour: '2-digit', minute: '2-digit' })}</>}
    </p>
  );
}
