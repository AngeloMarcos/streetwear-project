// Campanha de Black Friday — datas e desconto padrão vêm do .env (horário de Brasília).
// Fases: "teaser" (contagem regressiva antes de começar), "live" (descontos valendo) e "off".
const date = (v: string | undefined, d: string) => {
  const t = new Date(v || d);
  return Number.isNaN(t.getTime()) ? new Date(d) : t;
};
const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

export const blackFriday = {
  start: date(process.env.BF_START, '2026-11-27T00:00:00-03:00'),
  end: date(process.env.BF_END, '2026-11-30T23:59:59-03:00'),
  /** desconto padrão para produtos sem desconto próprio */
  percent: Math.min(90, Math.max(0, num(process.env.BF_PERCENT, 30))),
  /** quantos dias antes a loja já mostra a contagem regressiva */
  teaserDays: num(process.env.BF_TEASER_DAYS, 21),
};

export type BfPhase = 'off' | 'teaser' | 'live';

export function bfPhase(now = new Date()): BfPhase {
  const t = now.getTime();
  if (t >= blackFriday.start.getTime() && t <= blackFriday.end.getTime()) return 'live';
  if (t < blackFriday.start.getTime() && t >= blackFriday.start.getTime() - blackFriday.teaserDays * 864e5) return 'teaser';
  return 'off';
}

/** % de desconto que o produto teria na campanha (independe de estar valendo agora) */
export const bfPercentFor = (p: { bfPercent: number | null }) =>
  Math.min(90, Math.max(0, p.bfPercent ?? blackFriday.percent));

/** % de desconto valendo agora */
export const offPercentNow = (p: { bfPercent: number | null }, now = new Date()) =>
  bfPhase(now) === 'live' ? bfPercentFor(p) : 0;

/** Preço cobrado agora (centavos). Usado tanto na vitrine quanto no pedido. */
export const salePriceCents = (p: { priceCents: number; bfPercent: number | null }, now = new Date()) =>
  Math.round(p.priceCents * (1 - offPercentNow(p, now) / 100));

/** Info da campanha para a interface (serializável) */
export function bfInfo(maxPercent: number, now = new Date()) {
  const phase = bfPhase(now);
  return {
    phase,
    start: blackFriday.start.toISOString(),
    end: blackFriday.end.toISOString(),
    maxPercent,
    startLabel: blackFriday.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }),
    endLabel: blackFriday.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }),
  };
}
export type BfInfo = ReturnType<typeof bfInfo>;
