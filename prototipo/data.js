/* Catálogo demonstrativo da BLOCO Supply Co.
   Troque por dados reais (ou por uma API / Shopify / Nuvemshop / VTEX) quando for pra produção. */

const CATEGORIES = {
  roupas: { label: 'Roupas', types: ['tee', 'hoodie', 'jacket', 'pants', 'shorts'] },
  acessorios: { label: 'Acessórios', types: ['cap', 'beanie', 'bag', 'socks'] },
  skate: { label: 'Skate', types: ['deck'] },
};

const TYPE_LABEL = {
  tee: 'Camiseta', hoodie: 'Moletom', jacket: 'Jaqueta', pants: 'Calça', shorts: 'Bermuda',
  cap: 'Boné', beanie: 'Gorro', bag: 'Bolsa', socks: 'Meia', deck: 'Shape',
};

// cor: cor da peça · bg: fundo da "foto" · ink: cor da estampa
const PRODUCTS = [
  { id: 'tee-bloco-logo-preta', name: 'Camiseta Bloco Logo', type: 'tee', price: 149.9, color: '#151515', bg: '#e9e6df', ink: '#ff4d00', colorName: 'Preta', print: 'BLOCO', tags: ['novo'], sizes: ['P','M','G','GG','XG'], soldOut: [] },
  { id: 'tee-bloco-logo-branca', name: 'Camiseta Bloco Logo', type: 'tee', price: 149.9, color: '#f4f2ec', bg: '#1d1d1d', ink: '#111', colorName: 'Branca', print: 'BLOCO', tags: ['novo'], sizes: ['P','M','G','GG','XG'], soldOut: ['P'] },
  { id: 'tee-quebrada-tour', name: 'Camiseta Quebrada Tour', type: 'tee', price: 169.9, color: '#3a5a40', bg: '#f1e9d2', ink: '#f1e9d2', colorName: 'Verde Musgo', print: 'TOUR', tags: [], sizes: ['P','M','G','GG'], soldOut: ['GG'] },
  { id: 'tee-collab-estudio-x', name: 'Camiseta BLOCO × Estúdio X', type: 'tee', price: 199.9, color: '#c8102e', bg: '#111', ink: '#fff', colorName: 'Vermelha', print: '× X', tags: ['collab', 'novo'], sizes: ['P','M','G','GG'], soldOut: [] },
  { id: 'hoodie-heavy-cinza', name: 'Moletom Heavyweight', type: 'hoodie', price: 399.9, color: '#9a9a96', bg: '#f3f1ea', ink: '#151515', colorName: 'Cinza Mescla', print: 'BLOCO', tags: ['novo'], sizes: ['P','M','G','GG','XG'], soldOut: [] },
  { id: 'hoodie-heavy-marrom', name: 'Moletom Heavyweight', type: 'hoodie', price: 399.9, color: '#5b3a29', bg: '#e6dccb', ink: '#e6dccb', colorName: 'Café', print: 'BLOCO', tags: [], sizes: ['P','M','G','GG'], soldOut: ['P','M'] },
  { id: 'hoodie-collab-estudio-x', name: 'Moletom BLOCO × Estúdio X', type: 'hoodie', price: 449.9, color: '#111', bg: '#c8102e', ink: '#c8102e', colorName: 'Preto', print: '× X', tags: ['collab'], sizes: ['M','G','GG'], soldOut: [] },
  { id: 'jacket-work-caramelo', name: 'Jaqueta Work Canvas', type: 'jacket', price: 599.9, color: '#b07a3b', bg: '#20201e', ink: '#20201e', colorName: 'Caramelo', print: '', tags: ['novo'], sizes: ['P','M','G','GG'], soldOut: [] },
  { id: 'pants-cargo-preta', name: 'Calça Cargo Ripstop', type: 'pants', price: 349.9, color: '#232323', bg: '#d9d4c7', ink: '#ff4d00', colorName: 'Preta', print: '', tags: [], sizes: ['38','40','42','44','46'], soldOut: ['46'] },
  { id: 'pants-double-knee-bege', name: 'Calça Double Knee', type: 'pants', price: 379.9, color: '#cbb894', bg: '#2b2b2b', ink: '#2b2b2b', colorName: 'Bege', print: '', tags: ['novo'], sizes: ['38','40','42','44'], soldOut: [] },
  { id: 'shorts-nylon-azul', name: 'Bermuda Nylon', type: 'shorts', price: 219.9, color: '#1f3b73', bg: '#efe9dc', ink: '#fff', colorName: 'Azul Royal', print: '', tags: [], sizes: ['P','M','G','GG'], soldOut: [] },
  { id: 'cap-6panel-preto', name: 'Boné 6 Panel Bloco', type: 'cap', price: 179.9, color: '#151515', bg: '#ff4d00', ink: '#ff4d00', colorName: 'Preto', print: 'B', tags: ['novo'], sizes: ['Único'], soldOut: [] },
  { id: 'cap-5panel-creme', name: 'Boné 5 Panel Camp', type: 'cap', price: 169.9, color: '#efe6cf', bg: '#3a5a40', ink: '#3a5a40', colorName: 'Creme', print: 'B', tags: [], sizes: ['Único'], soldOut: [] },
  { id: 'beanie-laranja', name: 'Gorro Watch', type: 'beanie', price: 129.9, color: '#ff4d00', bg: '#151515', ink: '#151515', colorName: 'Laranja', print: '', tags: [], sizes: ['Único'], soldOut: [] },
  { id: 'bag-shoulder-preta', name: 'Shoulder Bag Utility', type: 'bag', price: 199.9, color: '#202020', bg: '#e9e6df', ink: '#ff4d00', colorName: 'Preta', print: '', tags: ['novo'], sizes: ['Único'], soldOut: [] },
  { id: 'socks-pack-3', name: 'Meias Pack c/ 3', type: 'socks', price: 89.9, color: '#f4f2ec', bg: '#1f3b73', ink: '#ff4d00', colorName: 'Branca', print: '', tags: [], sizes: ['34-38','39-43'], soldOut: [] },
  { id: 'deck-bloco-82', name: 'Shape Bloco Team 8.25"', type: 'deck', price: 289.9, color: '#ff4d00', bg: '#e9e6df', ink: '#111', colorName: 'Laranja', print: 'BLOCO', tags: ['novo'], sizes: ['8.0"','8.25"','8.5"'], soldOut: [] },
  { id: 'deck-collab-estudio-x', name: 'Shape BLOCO × Estúdio X', type: 'deck', price: 329.9, color: '#111', bg: '#c8102e', ink: '#c8102e', colorName: 'Preto', print: '× X', tags: ['collab'], sizes: ['8.25"','8.5"'], soldOut: [] },
];

// Drop da semana (estilo Supreme): itens bloqueados até a data de lançamento
const DROP = {
  name: 'DROP 07 — "CONCRETO"',
  // Toda quinta-feira às 11h (horário local)
  items: [
    { name: 'Jaqueta Puffer Concreto', type: 'jacket', color: '#6b6b66', bg: '#151515', ink: '#ff4d00', price: 749.9 },
    { name: 'Camiseta Concreto', type: 'tee', color: '#d8d3c6', bg: '#ff4d00', ink: '#151515', print: 'CONCRETO', price: 169.9 },
    { name: 'Moletom Concreto', type: 'hoodie', color: '#2b2b2b', bg: '#d8d3c6', ink: '#d8d3c6', print: 'C', price: 429.9 },
    { name: 'Shape Concreto', type: 'deck', color: '#9a9a96', bg: '#1f3b73', ink: '#fff', print: 'CONCRETO', price: 299.9 },
  ],
};

const LOOKBOOK = [
  { title: 'Centro, 06h', caption: 'Moletom Heavyweight + Calça Double Knee', ids: ['hoodie-heavy-cinza', 'pants-double-knee-bege'], bg: '#d9d4c7' },
  { title: 'Minhocão', caption: 'Jaqueta Work Canvas + Boné 6 Panel', ids: ['jacket-work-caramelo', 'cap-6panel-preto'], bg: '#20201e' },
  { title: 'Praça Roosevelt', caption: 'Camiseta Quebrada Tour + Bermuda Nylon', ids: ['tee-quebrada-tour', 'shorts-nylon-azul'], bg: '#f1e9d2' },
  { title: 'Estúdio X', caption: 'Collab completa', ids: ['hoodie-collab-estudio-x', 'deck-collab-estudio-x'], bg: '#c8102e' },
];

const JOURNAL = [
  { title: 'Bastidores da collab com o Estúdio X', kicker: 'Collab', bg: '#c8102e', ink: '#fff' },
  { title: 'Time Bloco: uma sessão no centro', kicker: 'Skate', bg: '#151515', ink: '#ff4d00' },
  { title: 'Como a gente escolheu o algodão 300g', kicker: 'Produto', bg: '#e9e6df', ink: '#151515' },
];
