/** '2026-11-06' → '06 de novembro de 2026' */
export const dateBR = (d: string) =>
  new Date(`${d}T12:00:00-03:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
