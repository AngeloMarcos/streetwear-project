// Popula o banco com o catálogo inicial. Seguro rodar mais de uma vez (upsert por slug).
// Uso: npm run seed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CAT = { tee: 'roupas', hoodie: 'roupas', jacket: 'roupas', pants: 'roupas', shorts: 'roupas', cap: 'acessorios', beanie: 'acessorios', bag: 'acessorios', socks: 'acessorios', deck: 'skate' };

const DESC = {
  tee: 'Camiseta de modelagem boxy em algodão 300g, gola canelada reforçada e estampa em silk à base d’água.',
  hoodie: 'Moletom heavyweight 480g com felpa interna, capuz forrado sem cordão e bolso canguru.',
  jacket: 'Jaqueta em canvas 12oz, forro acolchoado, botões de pressão e bolsos frontais utilitários.',
  pants: 'Calça de caimento reto e solto, costuras triplas e bolsos reforçados pro dia a dia (e pro skate).',
  shorts: 'Bermuda em nylon leve com elástico e cordão na cintura, secagem rápida.',
  cap: 'Boné em sarja de algodão com bordado frontal, fecho ajustável em metal.',
  beanie: 'Gorro em malha canelada dupla com etiqueta tecida.',
  bag: 'Shoulder bag em nylon resistente, alça regulável e bolso interno com zíper.',
  socks: 'Pack com 3 pares em algodão penteado com cano alto e logo jacquard.',
  deck: 'Shape 7 lâminas de maple canadense, concave médio. Arte exclusiva.',
};

function nextThursday11h() {
  const now = new Date();
  const d = new Date(now);
  d.setHours(11, 0, 0, 0);
  let add = (4 - d.getDay() + 7) % 7;
  if (add === 0 && now >= d) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

// [slug, nome, tipo, preço, corNome, cor, bg, ink, estampa, tags, tamanhos (tamanho:estoque)]
const P = [
  ['tee-bloco-logo-preta', 'Camiseta Street Dreams Logo', 'tee', 149.9, 'Preta', '#151515', '#e9e6df', '#ff4d00', 'STREET DREAMS', ['novo'], 'P:10 M:20 G:20 GG:12 XG:6'],
  ['tee-bloco-logo-branca', 'Camiseta Street Dreams Logo', 'tee', 149.9, 'Branca', '#f4f2ec', '#1d1d1d', '#111111', 'STREET DREAMS', ['novo'], 'P:0 M:15 G:15 GG:8 XG:4'],
  ['tee-quebrada-tour', 'Camiseta Quebrada Tour', 'tee', 169.9, 'Verde Musgo', '#3a5a40', '#f1e9d2', '#f1e9d2', 'TOUR', [], 'P:6 M:10 G:10 GG:0'],
  ['tee-collab-estudio-x', 'Camiseta Street Dreams × Estúdio X', 'tee', 199.9, 'Vermelha', '#c8102e', '#111111', '#ffffff', '× X', ['collab', 'novo'], 'P:5 M:10 G:10 GG:5'],
  ['hoodie-heavy-cinza', 'Moletom Heavyweight', 'hoodie', 399.9, 'Cinza Mescla', '#9a9a96', '#f3f1ea', '#151515', 'STREET DREAMS', ['novo'], 'P:6 M:12 G:12 GG:8 XG:4'],
  ['hoodie-heavy-marrom', 'Moletom Heavyweight', 'hoodie', 399.9, 'Café', '#5b3a29', '#e6dccb', '#e6dccb', 'STREET DREAMS', [], 'P:0 M:0 G:6 GG:4'],
  ['hoodie-collab-estudio-x', 'Moletom Street Dreams × Estúdio X', 'hoodie', 449.9, 'Preto', '#111111', '#c8102e', '#c8102e', '× X', ['collab'], 'M:6 G:6 GG:4'],
  ['jacket-work-caramelo', 'Jaqueta Work Canvas', 'jacket', 599.9, 'Caramelo', '#b07a3b', '#20201e', '#20201e', '', ['novo'], 'P:4 M:8 G:8 GG:4'],
  ['pants-cargo-preta', 'Calça Cargo Ripstop', 'pants', 349.9, 'Preta', '#232323', '#d9d4c7', '#ff4d00', '', [], '38:6 40:10 42:10 44:6 46:0'],
  ['pants-double-knee-bege', 'Calça Double Knee', 'pants', 379.9, 'Bege', '#cbb894', '#2b2b2b', '#2b2b2b', '', ['novo'], '38:5 40:8 42:8 44:5'],
  ['shorts-nylon-azul', 'Bermuda Nylon', 'shorts', 219.9, 'Azul Royal', '#1f3b73', '#efe9dc', '#ffffff', '', [], 'P:8 M:12 G:12 GG:6'],
  ['cap-6panel-preto', 'Boné 6 Panel Street Dreams', 'cap', 179.9, 'Preto', '#151515', '#ff4d00', '#ff4d00', 'SD', ['novo'], 'Único:30'],
  ['cap-5panel-creme', 'Boné 5 Panel Camp', 'cap', 169.9, 'Creme', '#efe6cf', '#3a5a40', '#3a5a40', 'B', [], 'Único:20'],
  ['beanie-laranja', 'Gorro Watch', 'beanie', 129.9, 'Laranja', '#ff4d00', '#151515', '#151515', '', [], 'Único:25'],
  ['bag-shoulder-preta', 'Shoulder Bag Utility', 'bag', 199.9, 'Preta', '#202020', '#e9e6df', '#ff4d00', '', ['novo'], 'Único:15'],
  ['socks-pack-3', 'Meias Pack c/ 3', 'socks', 89.9, 'Branca', '#f4f2ec', '#1f3b73', '#ff4d00', '', [], '34-38:20 39-43:20'],
  ['deck-bloco-82', 'Shape Street Dreams Team', 'deck', 289.9, 'Laranja', '#ff4d00', '#e9e6df', '#111111', 'STREET DREAMS', ['novo'], '8.0":6 8.25":10 8.5":6'],
  ['deck-collab-estudio-x', 'Shape Street Dreams × Estúdio X', 'deck', 329.9, 'Preto', '#111111', '#c8102e', '#c8102e', '× X', ['collab'], '8.25":5 8.5":5'],
];

// Drop da semana: ficam bloqueados até quinta 11h
const DROP = [
  ['drop-jaqueta-puffer-concreto', 'Jaqueta Puffer Concreto', 'jacket', 749.9, 'Cinza', '#6b6b66', '#151515', '#ff4d00', '', ['novo', 'drop'], 'M:5 G:5 GG:3'],
  ['drop-camiseta-concreto', 'Camiseta Concreto', 'tee', 169.9, 'Concreto', '#d8d3c6', '#ff4d00', '#151515', 'CONCRETO', ['novo', 'drop'], 'P:8 M:12 G:12 GG:6'],
  ['drop-moletom-concreto', 'Moletom Concreto', 'hoodie', 429.9, 'Grafite', '#2b2b2b', '#d8d3c6', '#d8d3c6', 'C', ['novo', 'drop'], 'M:6 G:6 GG:4'],
  ['drop-shape-concreto', 'Shape Concreto', 'deck', 299.9, 'Cinza', '#9a9a96', '#1f3b73', '#ffffff', 'CONCRETO', ['novo', 'drop'], '8.25":6 8.5":6'],
];

// Black Friday: desconto específico por produto (sem entrada = desconto padrão da campanha; 0 = fora)
const BF = {
  'jacket-work-caramelo': 40,
  'hoodie-heavy-marrom': 50,
  'pants-cargo-preta': 40,
  'tee-collab-estudio-x': 0,
  'hoodie-collab-estudio-x': 0,
  'deck-collab-estudio-x': 0,
};

async function upsert(row, sort, dropAt = null) {
  const [slug, name, type, price, colorName, color, bg, ink, print, tags, sizes] = row;
  const variants = sizes.split(' ').map((s, i) => {
    const idx = s.lastIndexOf(':');
    return { size: s.slice(0, idx), stock: Number(s.slice(idx + 1)), sort: i };
  });
  const data = { name, type, category: CAT[type], description: DESC[type], priceCents: Math.round(price * 100), colorName, color, bg, ink, print, tags, sort, dropAt, bfPercent: BF[slug] ?? null };
  const product = await prisma.product.upsert({ where: { slug }, update: data, create: { slug, ...data } });
  for (const v of variants) {
    await prisma.variant.upsert({
      where: { productId_size: { productId: product.id, size: v.size } },
      update: {},
      create: { productId: product.id, ...v },
    });
  }
}

const dropAt = nextThursday11h();
let i = 0;
for (const row of P) await upsert(row, i++);
for (const row of DROP) await upsert(row, i++, dropAt);
console.log(`Seed ok: ${P.length + DROP.length} produtos. Drop em ${dropAt.toLocaleString('pt-BR')}.`);
await prisma.$disconnect();
