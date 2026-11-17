// Conteúdo editorial da loja. Edite aqui textos da home, nome do drop, lookbook e journal.
export const site = {
  name: 'STREET DREAMS',
  fullName: 'Street Dreams',
  tagline: 'Streetwear, skate e drops semanais.',
  announcements: ['FRETE GRÁTIS ACIMA DE R$ 299', '5% OFF NO PIX', 'ATÉ 6X SEM JUROS', 'DROP TODA QUINTA 11H', 'TROCA GRÁTIS EM 30 DIAS'],
  hero: {
    kicker: 'Inverno 26 — Coleção 02',
    title: ['Feito', 'na rua.'],
    text: 'Algodão 300g, modelagem larga e estampas que duram. Peças pensadas pra andar de skate, pegar busão e virar a noite.',
    products: ['hoodie-heavy-cinza', 'tee-bloco-logo-preta', 'jacket-work-caramelo'],
    // Vídeo de fundo (opcional). Ex.: '/uploads/hero.mp4' ou um link .mp4. Vazio = usa as fotos dos produtos.
    video: '',
    poster: '',
  },
  dropName: 'DROP 07 — "CONCRETO"',
  collab: {
    title: ['Street Dreams', 'Estúdio X'],
    kicker: 'Collab · edição limitada',
    text: 'Uma cápsula de 4 peças com o estúdio de design que desenha as nossas estampas desde o início. Tiragem única, sem reposição.',
    product: 'hoodie-collab-estudio-x',
  },
  categoryArt: { roupas: 'hoodie-heavy-marrom', acessorios: 'cap-6panel-preto', skate: 'deck-bloco-82' } as Record<string, string>,
  lookbook: {
    title: ['Centro', 'de SP.'],
    season: 'Lookbook · Inverno 26',
    looks: [
      { title: 'Centro, 06h', caption: 'Moletom Heavyweight + Calça Double Knee', slugs: ['hoodie-heavy-cinza', 'pants-double-knee-bege'], bg: '#d9d4c7' },
      { title: 'Minhocão', caption: 'Jaqueta Work Canvas + Boné 6 Panel', slugs: ['jacket-work-caramelo', 'cap-6panel-preto'], bg: '#20201e' },
      { title: 'Praça Roosevelt', caption: 'Camiseta Quebrada Tour + Bermuda Nylon', slugs: ['tee-quebrada-tour', 'shorts-nylon-azul'], bg: '#f1e9d2' },
      { title: 'Estúdio X', caption: 'Collab completa', slugs: ['hoodie-collab-estudio-x', 'deck-collab-estudio-x'], bg: '#c8102e' },
    ],
  },
  // Blog: cada matéria vira uma página em /blog/<slug>, com as peças citadas para comprar no final.
  journal: [
    {
      slug: 'bastidores-collab-estudio-x',
      title: 'Bastidores da collab com o Estúdio X',
      kicker: 'Collab', date: '2026-11-06', bg: '#c8102e', ink: '#fff',
      intro: 'Quatro peças, seis meses de troca de arquivo e uma regra só: nada de reposição.',
      body: [
        'O Estúdio X desenha as estampas da Street Dreams desde a primeira camiseta. Dessa vez a ideia foi inverter: eles escolheram as peças, a gente só abriu a fábrica.',
        'O vermelho veio de uma placa de rua apagada no centro. Levou onze provas de cor até chegar no tom certo no moletom e no shape.',
        'A tiragem é única. Quando acabar, acabou — e o arquivo fica guardado.',
      ],
      products: ['hoodie-collab-estudio-x', 'tee-collab-estudio-x', 'deck-collab-estudio-x'],
    },
    {
      slug: 'time-bloco-sessao-no-centro',
      title: 'Time Street Dreams: uma sessão no centro',
      kicker: 'Skate', date: '2026-10-23', bg: '#151515', ink: '#ff4d00',
      intro: 'Seis da manhã, Anhangabaú vazio e três horas antes da cidade acordar.',
      body: [
        'A gente saiu com o time pra testar as peças novas no lugar onde elas foram pensadas: no chão, caindo e levantando.',
        'A calça double knee aguentou o dia inteiro sem abrir no joelho. O boné voltou sujo, como tem que ser.',
        'O vídeo completo sai no nosso Instagram na próxima quinta, junto com o drop.',
      ],
      products: ['pants-double-knee-bege', 'cap-6panel-preto', 'deck-bloco-82'],
    },
    {
      slug: 'algodao-300g',
      title: 'Como a gente escolheu o algodão 300g',
      kicker: 'Produto', date: '2026-10-09', bg: '#e9e6df', ink: '#151515',
      intro: 'Por que nossas camisetas e moletons são mais pesados que o normal.',
      body: [
        'Camiseta comum fica entre 140 e 160 g/m². A nossa tem quase o dobro. Isso muda o caimento, a durabilidade e como a estampa envelhece.',
        'Testamos cinco malharias em São Paulo e Santa Catarina. Ficamos com a que aguentou 30 lavagens sem torcer a costura lateral.',
        'Resultado: peça que dura anos e fica melhor com o tempo.',
      ],
      products: ['tee-bloco-logo-preta', 'hoodie-heavy-cinza', 'hoodie-heavy-marrom'],
    },
  ],
  about: {
    title: ['Feito', 'na rua.'],
    text: [
      'A Street Dreams nasceu no centro de São Paulo, entre uma sessão de skate e outra. A ideia sempre foi simples: fazer roupa que aguenta o dia inteiro na rua e ainda fica bonita.',
      'Toda quinta, às 11h, sai um drop novo. Tiragens curtas, algodão pesado e estampas feitas com artistas e estúdios daqui.',
      'Sem coleção eterna, sem estoque parado. Quando acaba, acaba.',
    ],
    facts: [['2026', 'ano em que começou'], ['300g', 'algodão das camisetas e moletons'], ['Quinta 11h', 'drop novo toda semana'], ['100%', 'produzido no Brasil']],
  },
  // Template 3 (Comunidade). Tudo marcado como example: true aparece com a etiqueta "exemplo".
  // Troque por fotos, vídeos e depoimentos reais e mude para example: false.
  community: {
    vipGroup: '', // link do grupo VIP do WhatsApp (chat.whatsapp.com/...). Vazio = abre conversa no número da loja
    feed: [
      { handle: '@cliente.sd', caption: 'Moletom cinza no frio do centro', slug: 'hoodie-heavy-cinza', photo: '', example: true },
      { handle: '@time.streetdreams', caption: 'Sessão no Anhangabaú', slug: 'pants-double-knee-bege', photo: '', example: true },
      { handle: '@cliente.sd', caption: 'Collab chegou!', slug: 'hoodie-collab-estudio-x', photo: '', example: true },
      { handle: '@time.streetdreams', caption: 'Jaqueta pra virar a noite', slug: 'jacket-work-caramelo', photo: '', example: true },
      { handle: '@cliente.sd', caption: 'Boné que não sai da cabeça', slug: 'cap-6panel-preto', photo: '', example: true },
      { handle: '@time.streetdreams', caption: 'Shape novo, mesma praça', slug: 'deck-bloco-82', photo: '', example: true },
    ],
    videos: [
      { src: '', poster: '', caption: 'Provador: moletom heavyweight', slug: 'hoodie-heavy-cinza', example: true },
      { src: '', poster: '', caption: 'Unboxing da collab', slug: 'hoodie-collab-estudio-x', example: true },
      { src: '', poster: '', caption: 'Teste da double knee no skate', slug: 'pants-double-knee-bege', example: true },
    ],
    reviews: [
      { name: 'Cliente 1', city: 'São Paulo, SP', rating: 5, text: 'Algodão grosso de verdade, caimento largo do jeito que eu queria.', slug: 'hoodie-heavy-cinza', example: true },
      { name: 'Cliente 2', city: 'Curitiba, PR', rating: 5, text: 'Chegou em 3 dias e a troca de tamanho foi rápida pelo WhatsApp.', slug: 'tee-bloco-logo-preta', example: true },
      { name: 'Cliente 3', city: 'Belo Horizonte, MG', rating: 4, text: 'Calça resistente, já andei de skate várias vezes e nada de rasgar.', slug: 'pants-double-knee-bege', example: true },
    ],
  },
  // Dados da empresa (obrigatórios por lei em loja online). Preencha antes de publicar; vazios não aparecem.
  company: { legalName: '', cnpj: '', address: '', email: '' },
  social: { instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/', whatsapp: 'https://wa.me/5511916772455' },
};
