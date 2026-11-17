// Tabelas de medidas por tipo de peça (cm). Edite aqui com as medidas reais.
export type SizeGuideData = { title: string; cols: string[]; rows: [string, ...number[]][]; fit: string };

export const GUIDES: Record<'top' | 'jacket' | 'bottom' | 'shorts', SizeGuideData> = {
  top: {
    title: 'Camisetas e moletons',
    cols: ['Tamanho', 'Peito (cm)', 'Comprimento (cm)', 'Manga (cm)'],
    rows: [['P', 52, 70, 21], ['M', 55, 72, 22], ['G', 58, 74, 23], ['GG', 61, 76, 24], ['XG', 64, 78, 25]],
    fit: 'Caimento amplo (oversized). Se prefere mais justo, pegue um tamanho abaixo.',
  },
  jacket: {
    title: 'Jaquetas',
    cols: ['Tamanho', 'Peito (cm)', 'Comprimento (cm)', 'Manga (cm)'],
    rows: [['P', 56, 68, 62], ['M', 59, 70, 63], ['G', 62, 72, 64], ['GG', 65, 74, 65], ['XG', 68, 76, 66]],
    fit: 'Caimento reto e curto, pensado pra usar com moletom por baixo.',
  },
  bottom: {
    title: 'Calças',
    cols: ['Tamanho', 'Cintura (cm)', 'Quadril (cm)', 'Comprimento (cm)'],
    rows: [['38', 76, 104, 102], ['40', 80, 108, 103], ['42', 84, 112, 104], ['44', 88, 116, 105], ['46', 92, 120, 106]],
    fit: 'Perna larga e reta. Na dúvida, pegue o seu número de sempre.',
  },
  shorts: {
    title: 'Bermudas',
    cols: ['Tamanho', 'Cintura (cm)', 'Quadril (cm)', 'Comprimento (cm)'],
    rows: [['P', 76, 106, 50], ['M', 80, 110, 51], ['G', 86, 114, 52], ['GG', 92, 120, 53], ['XG', 98, 126, 54]],
    fit: 'Comprimento no joelho, cintura com elástico e cordão.',
  },
};

export const guideFor = (type: string) =>
  GUIDES[type === 'jacket' ? 'jacket' : type === 'pants' ? 'bottom' : type === 'shorts' ? 'shorts' : 'top'];
