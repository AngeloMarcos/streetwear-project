# Street Dreams — loja streetwear

No ar em https://streetdreams.mentoark.com.br

Loja própria em **Next.js 15 + PostgreSQL + Mercado Pago**, pronta para rodar numa VPS (Hostinger) com domínio próprio e HTTPS automático.

## O que tem

| Área | Recursos |
|---|---|
| Loja | Home com hero, drop com contagem regressiva, novidades, categorias, collab, journal e newsletter |
| Catálogo | Filtros por tipo, tamanho e cor, ordenação, busca, variações de cor e estoque por tamanho |
| Drop semanal | Produto com "data de drop" fica bloqueado e entra na loja sozinho no horário |
| Carrinho | Gaveta lateral, barra de frete grátis e "comprar o look" |
| Checkout | Pix com desconto (QR na própria página), cartão em até 6x e boleto pelo Mercado Pago |
| Estoque | Reservado no pedido e devolvido se o pagamento expira ou é recusado (sem vender o que não tem) |
| Black Friday | Contagem regressiva antes, desconto automático no período (sem cupom), preço riscado, página `/black-friday` e desconto por produto |
| Navegação | Menu com submenus por categoria, busca com resultados enquanto digita, vistos recentemente |
| Conversão | Faixa de vantagens, mais vendidos (pelas vendas reais), "leva junto" no carrinho, barra de compra fixa no celular, "avise-me quando chegar", pop-up de e-mail e botão do WhatsApp |
| Admin `/admin` | Pedidos (status, rastreio, notas), produtos (fotos, estoque, drop) e inscritos (CSV) |

Os valores (frete grátis, desconto Pix, parcelas) ficam no `.env`. Textos da home, lookbook e journal ficam em [src/content/site.ts](src/content/site.ts).

---

## 1. Rodar no computador (desenvolvimento)

Precisa de Node 20+ e um PostgreSQL.

```bash
npm install
cp .env.example .env      # ajuste DATABASE_URL para o seu Postgres local
npx prisma migrate deploy
npm run seed
npm run dev               # http://localhost:3000  ·  admin: http://localhost:3000/admin (senha "admin" em dev)
```

Sem `MP_ACCESS_TOKEN`, a loja roda em **modo demonstração**: gera um Pix fictício e mostra um botão "Simular pagamento aprovado".

---

## 2. Publicar na VPS da Hostinger

### 2.1 Apontar o domínio
No painel do seu domínio (DNS), crie:
- registro **A** `@` → IP da VPS
- registro **A** `www` → IP da VPS

### 2.2 Preparar a VPS (uma vez)
Acesse por SSH (`ssh root@IP-DA-VPS`). Se a VPS não veio com o template Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

> Se já houver Nginx/Apache usando as portas 80/443 na VPS, desative-o (`systemctl disable --now nginx`) ou me avise para ajustar a configuração.

### 2.3 Enviar o código
O jeito recomendado é um repositório **privado** no GitHub:

```bash
cd /opt && git clone https://github.com/SEU-USUARIO/bloco-store.git bloco && cd bloco
```

### 2.4 Configurar
```bash
cp .env.example .env
nano .env
```
Preencha **DOMAIN**, **SITE_URL**, as senhas (a de `POSTGRES_PASSWORD` precisa ser a mesma dentro de `DATABASE_URL`), **ADMIN_PASSWORD**, **ADMIN_SECRET** (gere com `openssl rand -hex 32`) e as chaves do Mercado Pago.

### 2.5 Subir
```bash
docker compose up -d --build
docker compose exec app npm run seed     # só na primeira vez: catálogo inicial
```
Pronto: `https://seudominio.com.br` (o certificado HTTPS sai sozinho em ~1 min).

### 2.6 Atualizar depois
```bash
cd /opt/bloco && git pull && docker compose up -d --build
```

### 2.7 Backup diário
```bash
crontab -e
# adicione:
40 3 * * * cd /opt/bloco && sh scripts/backup.sh >> backups/backup.log 2>&1
*/2 * * * * cd /opt/bloco && sh scripts/watchdog.sh >> backups/watchdog.log 2>&1
```
Copie a pasta `backups/` para fora da VPS de tempos em tempos.

---

### VPS que já tem Traefik (outros sistemas nas portas 80/443)

Use `docker-compose.vps.yml`: sobe só a loja e o banco dela, sem Caddy, sem mexer nos outros containers.

```bash
cd /opt/bloco && docker compose -f docker-compose.vps.yml -p bloco up -d --build
docker compose -f docker-compose.vps.yml -p bloco exec app npm run seed   # só na primeira vez
```

O endereço vem de `DOMAIN` no `.env` (aponte o registro A para a VPS antes) e o Traefik gera o HTTPS sozinho. Use também `SITE_URL=https://<DOMAIN>`. A porta 8088 fica só dentro da VPS.

Atualizar depois: `cd /opt/bloco && git pull && docker compose -f docker-compose.vps.yml -p bloco up -d --build`

## 3. Mercado Pago

1. Crie uma aplicação em **mercadopago.com.br/developers/panel/app** (produto: *Checkout Pro / Pagamentos online*).
2. Comece com as **credenciais de teste**: coloque o *Access Token* de teste em `MP_ACCESS_TOKEN` e reinicie (`docker compose up -d`).
3. Em **Webhooks**, cadastre a URL `https://SEUDOMINIO/api/webhooks/mercadopago` com o evento **Pagamentos**. Copie a *assinatura secreta* para `MP_WEBHOOK_SECRET`.
4. **Parcelamento sem juros**: no painel do Mercado Pago, em *Seu negócio > Custos > Parcelamento*, configure até 6x sem juros (o custo é seu como vendedor).
5. Faça compras de teste com os cartões e usuários de teste do MP. Depois, troque para as **credenciais de produção**.

O cartão é digitado no ambiente do Mercado Pago: a loja nunca recebe nem guarda dados de cartão.

---

## 4. Rotina no admin

- **Pedidos**: a aba "Pagos" é a fila de envio. Abra o pedido, copie o endereço, poste e cole o **código de rastreio** com o status "Enviado". O cliente vê o rastreio no link do pedido.
- **Produtos**: suba as fotos (1ª frente, 2ª costas, 3ª detalhe; ideal 1200×1500). Estoque no formato `P:10 M:20 G:5`.
- **Avise-me**: lista quem quer um tamanho esgotado. Ao repor, copie os e-mails, mande o aviso e clique em "Marcar como avisados".
- **Vídeo na home**: suba o vídeo (MP4, até ~10 MB) para a VPS e coloque o endereço em `hero.video` em [src/content/site.ts](src/content/site.ts). Vazio = usa as fotos dos produtos.
- **WhatsApp**: troque o número em `social.whatsapp` no mesmo arquivo.
- **Drop**: defina "Lançar no drop em" (horário de Brasília). Até lá o produto aparece borrado na página Drop, com a contagem regressiva.

## 5. Black Friday

- As datas e o desconto padrão ficam no `.env` (`BF_START`, `BF_END`, `BF_PERCENT`, `BF_TEASER_DAYS`). Depois de mudar, rode `docker compose up -d`.
- Antes de começar: a loja mostra a contagem regressiva, a prévia dos preços em `/black-friday` e coleta e-mails (aparecem em **Inscritos** com origem `black-friday`).
- Durante: o desconto entra sozinho em todos os produtos, com preço riscado, e o pedido já sai com o valor promocional. O desconto do Pix soma por cima.
- No admin, cada produto tem o campo **Desconto Black Friday (%)**: vazio = padrão, `0` = fora da promoção (ex.: collabs).
- Quando acaba, os preços voltam sozinhos.

## Estrutura

```
prisma/            schema, migrações e seed do catálogo
src/app/           páginas (loja, produto, drop, lookbook, checkout, pedido, admin) e APIs
src/components/    header, carrinho, cards, filtros
src/lib/           banco, preços, Mercado Pago, pedidos/estoque, login admin, uploads
src/content/       textos editáveis da loja
prototipo/         protótipo HTML original
```

## Páginas de conteúdo e institucionais

| Página | O que é | Onde editar |
|---|---|---|
| `/blog` e `/blog/<slug>` | Matérias com as peças citadas para comprar no final | `site.journal` em `src/content/site.ts` |
| `/collabs` | Destaque da collab + todos os produtos com a tag `collab` | `site.collab` + tag no admin |
| `/sobre` | História da marca e números | `site.about` |
| `/privacidade`, `/termos` | Textos modelo (LGPD/CDC) — revise com um advogado | os próprios arquivos em `src/app/` |
| `/ajuda#medidas` | Todas as tabelas de medidas | `src/lib/sizes.ts` (mesmas tabelas da janela no produto) |
| `/sitemap.xml`, `/robots.txt` | Gerados sozinhos para o Google, usam `SITE_URL` | — |

**Antes de publicar:** preencha `site.company` (razão social, CNPJ, endereço e e-mail). A lei exige esses dados em loja online; eles aparecem no rodapé e nas páginas legais.


## Templates de apresentação

Três visuais para o mesmo site, com os mesmos produtos, carrinho e checkout: `/template-1` (Outlet direto), `/template-2` (Drop / Lookbook) e `/template-3` (Comunidade). Uma barra no topo troca entre eles. Ficam fora do Google.

- Código comum: `src/templates/` (`Shell.tsx`, `client.tsx`, `ProductPage.tsx`, `OutletPage.tsx`, `meta.ts`, `base.css`)
- Cada template: `src/templates/HomeN.tsx`, `src/templates/tN.css` e as rotas em `src/app/template-N/`
- Feed, vídeos, avaliações e grupo VIP do template 3: `site.community` em `src/content/site.ts` (itens com `example: true` aparecem com a etiqueta "exemplo")
- Outlet = produtos com desconto cadastrado no admin (campo Black Friday). Nenhuma regra de preço nova.
