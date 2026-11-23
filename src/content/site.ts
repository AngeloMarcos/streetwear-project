// Conteúdo editorial da loja. Edite aqui textos da home, nome do drop, lookbook e journal.
export const site = {
  name: 'STREET DREAMS',
  fullName: 'Street Dreams',
  tagline: 'Streetwear, skate e drops semanais.',
  announcements: ['VERÃO 27 NO AR', 'FRETE GRÁTIS ACIMA DE R$ 299', '5% OFF NO PIX', 'ATÉ 6X SEM JUROS', 'DROP TODA QUINTA 11H', 'TROCA GRÁTIS EM 30 DIAS'],
  hero: {
    kicker: 'Coleção Verão 27',
    // Título gigante da capa (uma palavra por linha no celular)
    title: ['Verão', '27'],
    text: 'Jaqueta track, jorts baggy e jeans de perna larga. A coleção nova chegou com 17 peças.',
    // Peças que aparecem na frente do título (sem fundo)
    products: ['track-jacket-verde', 'jorts-baggy-azul-claro', 'cap-trucker-creme'],
    // Vídeo ou foto de campanha (opcional). Ex.: '/uploads/campanha.mp4'. Vazio = capa com as peças.
    video: '',
    poster: '',
  },
  // Atalhos de tendência na home (estilo Carhartt WIP): rótulo, link e peça que ilustra
  trends: [
    { label: 'Jorts', href: '/loja?tipo=jorts', slug: 'jorts-baggy-azul-claro' },
    { label: 'Track', href: '/loja?q=track', slug: 'track-jacket-verde' },
    { label: 'Jeans baggy', href: '/loja?tipo=jeans', slug: 'jeans-baggy-preto' },
    { label: 'Várzea', href: '/loja?tipo=jersey', slug: 'jersey-varzea-26' },
    { label: 'Acessórios', href: '/loja?cat=acessorios', slug: 'oculos-oval-preto' },
  ],
  // "Monte o look" da home (estilo Kith): peças vendidas juntas
  look: {
    title: 'O look da semana',
    text: 'Track verde, jorts lavado e trucker. Escolha o tamanho de cada peça e leve o look inteiro.',
    slugs: ['track-jacket-verde', 'jorts-baggy-azul-claro', 'cap-trucker-creme', 'oculos-oval-preto'],
    bg: '#c9d4c0',
  },
  // Campanhas da home (estilo Kith/Noah): foto em tela cheia, título pequeno e a faixa de peças embaixo.
  // Fotos em /public/campanha. Troque pelas fotos reais quando tiver (mesmo nome de arquivo ou outro caminho).
  campaigns: {
    blackFriday: { img: '/campanha/black-friday.jpg', focus: '68% center', alt: 'Rapaz de puffer preta sentado numa mureta no centro de São Paulo à noite' },
    verao: {
      img: '/campanha/verao-27.jpg', focus: '45% center', alt: 'Dois amigos no Minhocão com jaqueta track verde, jorts e boné trucker',
      kicker: 'Coleção Verão 27', title: 'Verão 27',
      text: 'Jaqueta track, jorts baggy e jeans de perna larga. 17 peças novas.',
    },
    drop: {
      img: '/campanha/drop-concreto.jpg', focus: '50% center', alt: 'Modelo de moletom cinza e calça cargo preta diante de prédio de concreto',
      kicker: 'Drop toda quinta, 11h', text: 'Tiragem curta. Quando acaba, acaba.',
    },
    collab: { img: '/campanha/collab-estudio-x.jpg', focus: '60% center', alt: 'Artista estampando camisetas num ateliê de serigrafia' },
    lookbook: {
      img: '/campanha/lookbook-varzea.jpg', focus: '52% center', alt: 'Amigos num campo de várzea ao pôr do sol',
      kicker: 'Lookbook', title: 'Várzea, domingo 9h', text: 'Quatro looks do Verão 27 fotografados em São Paulo.',
    },
  },
  dropName: 'Drop 07: Concreto',
  collab: {
    title: ['Street Dreams', 'Estúdio X'],
    kicker: 'Collab · edição limitada',
    text: 'Uma cápsula de 4 peças com o estúdio de design que desenha as nossas estampas desde o início. Tiragem única, sem reposição.',
    product: 'hoodie-collab-estudio-x',
  },
  categoryArt: { roupas: 'track-jacket-verde', acessorios: 'oculos-oval-preto', skate: 'deck-bloco-82' } as Record<string, string>,
  lookbook: {
    title: ['Verão', '27'],
    season: 'Lookbook Verão 27',
    looks: [
      { title: 'Várzea, domingo 9h', caption: 'Camisa Várzea 26 + Jorts Baggy Denim', slugs: ['jersey-varzea-26', 'jorts-baggy-azul-claro'], bg: '#d7dccf' },
      { title: 'Minhocão, fim de tarde', caption: 'Jaqueta Track Retrô + Calça Jeans Baggy', slugs: ['track-jacket-verde', 'jeans-baggy-preto'], bg: '#1d1d1f' },
      { title: 'Praça Roosevelt', caption: 'Camiseta Boxy Washed + Shorts Track Nylon', slugs: ['tee-boxy-washed-cinza', 'shorts-track-azul'], bg: '#e6e1d6' },
      { title: 'Chuva no centro', caption: 'Corta-vento Shell Técnico + Calça Track Nylon', slugs: ['shell-tecnico-areia', 'track-pants-preta'], bg: '#c3c6c2' },
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
      { handle: '@cliente.sd', caption: 'Jorts na várzea', slug: 'jorts-baggy-azul-claro', photo: '', example: true },
      { handle: '@time.streetdreams', caption: 'Sessão no Anhangabaú', slug: 'pants-double-knee-bege', photo: '', example: true },
      { handle: '@cliente.sd', caption: 'Collab chegou!', slug: 'hoodie-collab-estudio-x', photo: '', example: true },
      { handle: '@time.streetdreams', caption: 'Track verde no Minhocão', slug: 'track-jacket-verde', photo: '', example: true },
      { handle: '@cliente.sd', caption: 'Trucker que não sai da cabeça', slug: 'cap-trucker-creme', photo: '', example: true },
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
