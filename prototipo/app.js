/* BLOCO Supply Co. — protótipo de loja streetwear (SPA sem dependências) */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (v) => BRL.format(v);

  const FREE_SHIP = 299;
  const SHIP_PRICE = 24.9;
  const PIX_OFF = 0.05;
  const MAX_INSTALLMENTS = 6;
  const MIN_INSTALLMENT = 30;

  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catOf = (p) => Object.keys(CATEGORIES).find((c) => CATEGORIES[c].types.includes(p.type));
  const installments = (v) => Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(v / MIN_INSTALLMENT)));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* =====================================================================
     "Fotos" dos produtos em SVG — placeholders até entrarem as fotos reais
     ===================================================================== */
  const SH = 'rgba(0,0,0,.22)';
  const HL = 'rgba(255,255,255,.12)';
  const fontFor = (txt, max, width) => Math.min(max, (width / Math.max(txt.length, 1)) * 1.7);

  const SHAPES = {
    tee: (p, v) => `
      <path d="M70 40 L40 52 L18 82 L42 98 L56 86 L56 175 L144 175 L144 86 L158 98 L182 82 L160 52 L130 40 Q100 60 70 40 Z" fill="${p.color}"/>
      <path d="M70 40 Q100 ${v === 1 ? 46 : 60} 130 40" fill="none" stroke="${SH}" stroke-width="3"/>
      <path d="M56 86 L56 120 M144 86 L144 120" stroke="${SH}" stroke-width="1.5"/>
      ${printFor(p, v, 100, v === 1 ? 105 : 78)}`,
    hoodie: (p, v) => `
      <path d="M68 44 L40 54 L22 110 L18 170 L38 172 L48 112 L54 96 L54 180 L146 180 L146 96 L152 112 L162 172 L182 170 L178 110 L160 54 L132 44 Z" fill="${p.color}"/>
      <path d="M68 44 Q66 8 100 8 Q134 8 132 44 Q100 ${v === 1 ? 50 : 66} 68 44 Z" fill="${p.color}" stroke="${SH}" stroke-width="2"/>
      ${v === 1 ? '' : `<path d="M90 60 L88 86 M110 60 L112 86" stroke="${HL}" stroke-width="2"/>
      <path d="M72 128 L128 128 L136 164 L64 164 Z" fill="none" stroke="${SH}" stroke-width="2"/>`}
      <rect x="54" y="172" width="92" height="8" fill="${SH}"/>
      ${printFor(p, v, 100, v === 1 ? 110 : 106)}`,
    jacket: (p, v) => `
      <path d="M68 40 L40 52 L22 110 L18 172 L40 174 L48 112 L54 96 L54 182 L146 182 L146 96 L152 112 L160 174 L182 172 L178 110 L160 52 L132 40 Z" fill="${p.color}"/>
      <path d="M68 40 L100 64 L132 40 L124 34 L100 52 L76 34 Z" fill="${SH}"/>
      ${v === 1 ? `<path d="M54 70 L146 70" stroke="${SH}" stroke-width="2"/>` : `
      <path d="M100 64 L100 182" stroke="${SH}" stroke-width="2"/>
      <rect x="64" y="120" width="26" height="28" fill="none" stroke="${SH}" stroke-width="2"/>
      <rect x="110" y="120" width="26" height="28" fill="none" stroke="${SH}" stroke-width="2"/>
      <circle cx="104" cy="80" r="2.4" fill="${SH}"/><circle cx="104" cy="104" r="2.4" fill="${SH}"/><circle cx="104" cy="128" r="2.4" fill="${SH}"/>
      <rect x="64" y="80" width="18" height="8" fill="${p.ink}"/>`}`,
    pants: (p, v) => `
      <path d="M62 14 L138 14 L148 188 L108 188 L100 64 L92 188 L52 188 Z" fill="${p.color}"/>
      <rect x="62" y="14" width="76" height="10" fill="${SH}"/>
      ${v === 1 ? `<rect x="70" y="34" width="22" height="22" fill="none" stroke="${SH}" stroke-width="2"/><rect x="108" y="34" width="22" height="22" fill="none" stroke="${SH}" stroke-width="2"/>` :
      `<path d="M100 24 L100 60" stroke="${SH}" stroke-width="2"/>
       <rect x="52" y="96" width="18" height="30" fill="none" stroke="${SH}" stroke-width="2"/>
       <rect x="130" y="96" width="18" height="30" fill="none" stroke="${SH}" stroke-width="2"/>`}
      ${p.id && p.id.includes('double') ? `<rect x="58" y="110" width="36" height="34" fill="${SH}"/><rect x="106" y="110" width="36" height="34" fill="${SH}"/>` : ''}`,
    shorts: (p, v) => `
      <path d="M58 46 L142 46 L154 142 L106 142 L100 92 L94 142 L46 142 Z" fill="${p.color}"/>
      <rect x="58" y="46" width="84" height="10" fill="${SH}"/>
      <path d="M86 56 L88 74 M114 56 L112 74" stroke="${HL}" stroke-width="2"/>
      <rect x="120" y="112" width="14" height="8" fill="${p.ink}"/>`,
    cap: (p, v) => v === 1 ? `
      <path d="M44 128 Q44 54 100 54 Q156 54 156 128 Z" fill="${p.color}"/>
      <path d="M78 128 Q100 106 122 128 Z" fill="${SH}"/>
      <rect x="84" y="116" width="32" height="6" fill="${SH}"/>` : `
      <path d="M48 124 Q48 54 100 54 Q152 54 152 124 Z" fill="${p.color}"/>
      <path d="M100 54 L100 124 M74 60 Q66 90 66 124 M126 60 Q134 90 134 124" stroke="${SH}" stroke-width="1.5" fill="none"/>
      <path d="M36 124 Q100 110 164 124 Q172 142 100 146 Q28 142 36 124 Z" fill="${p.color}" stroke="${SH}" stroke-width="2"/>
      <circle cx="100" cy="56" r="3" fill="${SH}"/>
      <text x="100" y="104" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="30" fill="${p.ink}">${esc(p.print || 'B')}</text>`,
    beanie: (p) => `
      <path d="M56 140 Q56 56 100 56 Q144 56 144 140 Z" fill="${p.color}"/>
      <rect x="50" y="116" width="100" height="34" fill="${p.color}" stroke="${SH}" stroke-width="2"/>
      ${[60, 70, 80, 90, 100, 110, 120, 130, 140].map((x) => `<path d="M${x} 118 L${x} 148" stroke="${SH}" stroke-width="1.5"/>`).join('')}
      <rect x="88" y="124" width="24" height="14" fill="${p.ink}"/>`,
    bag: (p) => `
      <path d="M40 40 Q100 -10 160 40" fill="none" stroke="${p.color}" stroke-width="8"/>
      <rect x="40" y="80" width="120" height="86" rx="10" fill="${p.color}"/>
      <rect x="40" y="80" width="120" height="30" rx="10" fill="${SH}"/>
      <path d="M52 132 L148 132" stroke="${HL}" stroke-width="3"/>
      <rect x="40" y="40" width="8" height="44" fill="${p.color}"/><rect x="152" y="40" width="8" height="44" fill="${p.color}"/>
      <rect x="86" y="140" width="28" height="12" fill="${p.ink}"/>`,
    socks: (p) => [0, 1].map((i) => `
      <g transform="translate(${i * 44 - 20} ${i * 8})">
        <path d="M60 20 L96 20 L96 120 Q96 160 66 166 L40 168 Q24 166 26 150 Q30 138 52 132 L60 122 Z" fill="${p.color}" stroke="${SH}" stroke-width="2"/>
        <rect x="60" y="20" width="36" height="14" fill="${SH}"/>
        <rect x="60" y="44" width="36" height="6" fill="${p.ink}"/><rect x="60" y="56" width="36" height="6" fill="${p.ink}"/>
      </g>`).join(''),
    deck: (p, v) => v === 1 ? `
      <rect x="72" y="4" width="56" height="192" rx="28" fill="#1b1b1b"/>
      <rect x="80" y="40" width="40" height="14" fill="#333"/><rect x="80" y="146" width="40" height="14" fill="#333"/>` : `
      <rect x="72" y="4" width="56" height="192" rx="28" fill="${p.color}"/>
      <text transform="translate(108 100) rotate(-90)" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="${fontFor(p.print || 'BLOCO', 36, 110)}" fill="${p.ink}">${esc(p.print || 'BLOCO')}</text>
      <circle cx="100" cy="30" r="3" fill="${SH}"/><circle cx="100" cy="170" r="3" fill="${SH}"/>`,
  };

  function printFor(p, view, cx, cy) {
    if (!p.print) return '';
    if (view === 1) {
      const size = fontFor(p.print, 44, 76);
      return `<text x="${cx}" y="${cy + size / 3}" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="${size}" fill="${p.ink}">${esc(p.print)}</text>
              <text x="${cx}" y="${cy + size / 3 + 16}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="1.5" fill="${p.ink}">SUPPLY CO. — SÃO PAULO</text>`;
    }
    return `<text x="${cx + 18}" y="${cy}" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="9" fill="${p.ink}">${esc(p.print)}</text>`;
  }

  /** view: 0 frente · 1 costas · 2 detalhe */
  function art(p, view = 0, { label = true } = {}) {
    const shape = (SHAPES[p.type] || SHAPES.tee)(p, view === 2 ? 0 : view);
    const g = view === 2 ? 'translate(-140 -40) scale(3.4)' : 'translate(40 90) scale(1.6)';
    const tag = label ? `<text x="16" y="484" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="1" fill="${p.color}" opacity=".55">${['FRENTE', 'COSTAS', 'DETALHE'][view]}</text>` : '';
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="500" fill="${p.bg}"/>
      ${view !== 2 ? `<ellipse cx="200" cy="${p.type === 'cap' || p.type === 'shorts' ? 340 : 400}" rx="130" ry="14" fill="rgba(0,0,0,.12)"/>` : ''}
      <g transform="${g}">${shape}</g>${tag}</svg>`;
  }

  /* =====================================================================
     Carrinho (localStorage, com fallback em memória)
     ===================================================================== */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  };
  let cart = store.get('bloco.cart', []).filter((l) => byId[l.id]);

  const cartTotals = () => {
    const subtotal = cart.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
    const count = cart.reduce((s, l) => s + l.qty, 0);
    const ship = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : SHIP_PRICE;
    return { subtotal, count, ship, total: subtotal + ship, pix: subtotal * (1 - PIX_OFF) + ship };
  };

  function addToCart(id, size, qty = 1) {
    const line = cart.find((l) => l.id === id && l.size === size);
    if (line) line.qty += qty; else cart.push({ id, size, qty });
    saveCart();
    toast(`${byId[id].name} (${size}) no carrinho`);
    const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
  function setQty(i, qty) {
    if (qty <= 0) cart.splice(i, 1); else cart[i].qty = qty;
    saveCart();
  }
  function saveCart() { store.set('bloco.cart', cart); renderCart(); }

  function renderCart() {
    const t = cartTotals();
    $('#cartCount').textContent = t.count;
    const body = $('#cartBody');
    const foot = $('#cartFoot');
    if (!cart.length) {
      body.innerHTML = `<div class="empty"><p class="section__title" style="font-size:40px">Vazio.</p><p class="muted">Seu carrinho tá esperando o próximo drop.</p><br><a class="btn" href="#/loja" data-action="cart-close">Ver produtos</a></div>`;
      foot.innerHTML = '';
      return;
    }
    const left = Math.max(0, FREE_SHIP - t.subtotal);
    body.innerHTML = `
      <div class="ship-bar">${left > 0 ? `Faltam <b>${money(left)}</b> pro frete grátis` : '<b>Frete grátis liberado ✓</b>'}
        <div class="ship-bar__track"><div class="ship-bar__fill" style="width:${Math.min(100, (t.subtotal / FREE_SHIP) * 100)}%"></div></div>
      </div>
      ${cart.map((l, i) => {
        const p = byId[l.id];
        return `<div class="line">
          <a class="line__img" href="#/produto/${p.id}" data-action="cart-close">${art(p, 0, { label: false })}</a>
          <div>
            <a class="line__name" href="#/produto/${p.id}" data-action="cart-close">${esc(p.name)}</a>
            <div class="muted small">${esc(p.colorName)} · ${esc(l.size)}</div>
            <div class="qty"><button data-qty="${i}" data-d="-1" aria-label="Diminuir">−</button><span>${l.qty}</span><button data-qty="${i}" data-d="1" aria-label="Aumentar">+</button></div>
            <button class="remove" data-remove="${i}">Remover</button>
          </div>
          <div class="price">${money(p.price * l.qty)}</div>
        </div>`;
      }).join('')}`;
    const n = installments(t.total);
    foot.innerHTML = `
      <div class="totals">
        <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        <div><span>Frete</span><span>${t.ship ? money(t.ship) : 'Grátis'}</span></div>
        <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
        <div class="pix"><span>No Pix (5% off)</span><span>${money(t.pix)}</span></div>
        <div class="muted small"><span>ou ${n}x de ${money(t.total / n)} sem juros</span></div>
      </div>
      <a class="btn btn--block" href="#/checkout" data-action="cart-close">Finalizar compra</a>`;
  }

  /* =====================================================================
     UI global
     ===================================================================== */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2400);
  }
  function openCart(open = true) {
    $('#cartDrawer').classList.toggle('is-open', open);
    $('#cartDrawer').setAttribute('aria-hidden', String(!open));
    $('#overlay').hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  function toggleMenu(force) {
    const m = $('#mobileMenu');
    const open = force ?? !m.classList.contains('is-open');
    m.classList.toggle('is-open', open);
    m.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // Drop: toda quinta às 11h
  function nextDrop(now = new Date()) {
    const d = new Date(now);
    d.setHours(11, 0, 0, 0);
    let add = (4 - d.getDay() + 7) % 7;
    if (add === 0 && now >= d) add = 7;
    d.setDate(d.getDate() + add);
    return d;
  }
  const countdownHTML = () => `<div class="countdown" data-countdown>
      <div><b data-cd="d">00</b><span>DIAS</span></div><div><b data-cd="h">00</b><span>HORAS</span></div>
      <div><b data-cd="m">00</b><span>MIN</span></div><div><b data-cd="s">00</b><span>SEG</span></div></div>`;
  function tickCountdowns() {
    const diff = Math.max(0, nextDrop() - new Date());
    const parts = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    $$('[data-cd]').forEach((el) => { el.textContent = String(parts[el.dataset.cd]).padStart(2, '0'); });
  }
  setInterval(tickCountdowns, 1000);

  /* =====================================================================
     Componentes
     ===================================================================== */
  function card(p) {
    const cat = catOf(p);
    const badges = [
      p.tags.includes('novo') && '<span class="badge badge--accent">Novo</span>',
      p.tags.includes('collab') && '<span class="badge badge--dark">Collab</span>',
      p.soldOut.length && p.soldOut.length < p.sizes.length && '<span class="badge">Últimas peças</span>',
    ].filter(Boolean).join('');
    return `<article class="card">
      <a href="#/produto/${p.id}" class="card__img" aria-label="${esc(p.name)} ${esc(p.colorName)}">
        <div class="badges">${badges}</div>
        ${art(p, 0, { label: false })}${art(p, 1, { label: false })}
      </a>
      <div class="quick-add" aria-label="Adicionar rápido">
        ${p.sizes.map((s) => `<button data-add="${p.id}" data-size="${esc(s)}" ${p.soldOut.includes(s) ? 'disabled' : ''}>${esc(s)}</button>`).join('')}
      </div>
      <div>
        <a href="#/produto/${p.id}" class="card__name">${esc(p.name)}</a>
        <div class="card__meta">${esc(p.colorName)} · ${CATEGORIES[cat].label}</div>
      </div>
      <div><span class="price">${money(p.price)}</span> <span class="price-pix">· ${money(p.price * (1 - PIX_OFF))} no Pix</span></div>
    </article>`;
  }

  /* =====================================================================
     Páginas
     ===================================================================== */
  function pageHome() {
    const heroPicks = ['hoodie-heavy-cinza', 'tee-bloco-logo-preta', 'jacket-work-caramelo'].map((id) => byId[id]);
    const newIn = PRODUCTS.filter((p) => p.tags.includes('novo')).slice(0, 8);
    const catArt = { roupas: byId['hoodie-heavy-marrom'], acessorios: byId['cap-6panel-preto'], skate: byId['deck-bloco-82'] };
    const collab = byId['hoodie-collab-estudio-x'];

    return `
      <section class="hero">
        <div class="hero__media">${heroPicks.map((p) => `<div>${art(p, 0, { label: false })}</div>`).join('')}</div>
        <div class="grain"></div>
        <div class="hero__content">
          <p class="mono">Inverno 26 — Coleção 02</p>
          <h1 class="hero__title">Feito<br>na rua.</h1>
          <div class="hero__row">
            <p>Algodão 300g, modelagem larga e estampas que duram. Peças pensadas pra andar de skate, pegar busão e virar a noite.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <a class="btn btn--light" href="#/loja?tag=novo">Comprar novidades</a>
              <a class="btn btn--ghost" style="color:#fff;border-color:#fff" href="#/lookbook">Ver lookbook</a>
            </div>
          </div>
        </div>
      </section>

      <section class="drop-banner">
        <div class="drop-banner__info">
          <span class="mono">Próximo drop · quinta, 11h</span>
          <h2 class="drop-banner__title">${esc(DROP.name)}</h2>
          ${countdownHTML()}
          <div><a class="btn" href="#/drop">Ver prévia do drop</a></div>
        </div>
        <div class="drop-banner__grid">
          ${DROP.items.map((it) => `<div>${art(it, 0, { label: false })}<div class="lock"><span>EM BREVE</span></div></div>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section__head"><h2 class="section__title">Novidades</h2><a class="link-arrow" href="#/loja?tag=novo">Ver tudo →</a></div>
        <div class="grid">${newIn.map(card).join('')}</div>
      </section>

      <section class="cats">
        ${Object.entries(CATEGORIES).map(([k, c]) => `<a class="cat" href="#/loja?cat=${k}">${art(catArt[k], 0, { label: false })}<span class="cat__label">${c.label}</span></a>`).join('')}
      </section>

      <section class="collab">
        <div class="collab__art">${art(collab, 1, { label: false })}</div>
        <div class="collab__info">
          <span class="mono" style="color:#c8102e">Collab · edição limitada</span>
          <h2 class="collab__title">Bloco <em>×</em><br>Estúdio X</h2>
          <p style="max-width:420px;color:#bbb">Uma cápsula de 4 peças com o estúdio de design que desenha as nossas estampas desde o início. Tiragem única, sem reposição.</p>
          <div><a class="btn btn--light" href="#/loja?tag=collab">Comprar a collab</a></div>
        </div>
      </section>

      <section class="section">
        <div class="section__head"><h2 class="section__title">Journal</h2><a class="link-arrow" href="#/lookbook">Lookbook →</a></div>
        <div class="journal">
          ${JOURNAL.map((j) => `<a class="post" href="#/lookbook">
            <div class="post__img" style="background:${j.bg};color:${j.ink}">${esc(j.kicker)}</div>
            <span class="mono muted">${esc(j.kicker)}</span><h3>${esc(j.title)}</h3></a>`).join('')}
        </div>
      </section>

      <section class="section newsletter">
        <div><h2 class="section__title" style="color:var(--paper)">Entra na lista.</h2>
          <p style="color:#bbb;margin-top:8px">Aviso de drop 1h antes de todo mundo + 10% off na primeira compra.</p></div>
        <form data-form="newsletter"><input type="email" required placeholder="seu@email.com" aria-label="E-mail"><button>Assinar</button></form>
      </section>`;
  }

  // ---- Loja ----
  const shop = { types: new Set(), sizes: new Set(), colors: new Set(), sort: 'relevancia', key: '' };

  function shopBase(q) {
    let list = PRODUCTS;
    if (q.cat && CATEGORIES[q.cat]) list = list.filter((p) => catOf(p) === q.cat);
    if (q.tag) list = list.filter((p) => p.tags.includes(q.tag));
    if (q.q) {
      const term = q.q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.colorName} ${TYPE_LABEL[p.type]}`.toLowerCase().includes(term));
    }
    return list;
  }

  function shopFiltered(q) {
    let list = shopBase(q);
    if (shop.types.size) list = list.filter((p) => shop.types.has(p.type));
    if (shop.sizes.size) list = list.filter((p) => p.sizes.some((s) => shop.sizes.has(s) && !p.soldOut.includes(s)));
    if (shop.colors.size) list = list.filter((p) => shop.colors.has(p.color));
    const sorts = {
      relevancia: () => 0,
      menor: (a, b) => a.price - b.price,
      maior: (a, b) => b.price - a.price,
      novos: (a, b) => b.tags.includes('novo') - a.tags.includes('novo'),
    };
    return [...list].sort(sorts[shop.sort]);
  }

  function pageShop(q) {
    const key = JSON.stringify(q);
    if (shop.key !== key) { shop.types.clear(); shop.sizes.clear(); shop.colors.clear(); shop.key = key; }
    const base = shopBase(q);
    const title = q.q ? `“${q.q}”` : q.tag === 'novo' ? 'Novidades' : q.tag === 'collab' ? 'Collabs' : q.cat ? CATEGORIES[q.cat]?.label : 'Tudo';
    const types = [...new Set(base.map((p) => p.type))];
    const sizes = [...new Set(base.flatMap((p) => p.sizes))];
    const colors = [...new Map(base.map((p) => [p.color, p.colorName])).entries()];
    const chip = (href, label, active) => `<a class="chip ${active ? 'is-active' : ''}" href="${href}">${label}</a>`;

    return `
      <section class="shop-head">
        <h1>${esc(title || 'Loja')}</h1>
        <div class="shop-head__bar">
          <div class="chips">
            ${chip('#/loja', 'Tudo', !q.cat && !q.tag && !q.q)}
            ${chip('#/loja?tag=novo', 'Novidades', q.tag === 'novo')}
            ${Object.entries(CATEGORIES).map(([k, c]) => chip(`#/loja?cat=${k}`, c.label, q.cat === k)).join('')}
            ${chip('#/loja?tag=collab', 'Collabs', q.tag === 'collab')}
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="chip filters-toggle" data-action="filters">Filtros</button>
            <select class="select" data-sort aria-label="Ordenar">
              <option value="relevancia">Relevância</option><option value="novos">Novos primeiro</option>
              <option value="menor">Menor preço</option><option value="maior">Maior preço</option>
            </select>
          </div>
        </div>
      </section>
      <div class="shop">
        <aside class="filters" id="filters">
          ${types.length > 1 ? `<div><h4>Tipo</h4>${types.map((t) => `<label><input type="checkbox" data-f="types" value="${t}"> ${TYPE_LABEL[t]}</label>`).join('')}</div>` : ''}
          <div><h4>Tamanho</h4>${sizes.map((s) => `<label><input type="checkbox" data-f="sizes" value="${esc(s)}"> ${esc(s)}</label>`).join('')}</div>
          <div><h4>Cor</h4><div class="swatches">${colors.map(([hex, name]) => `<button class="swatch" data-color="${hex}" style="background:${hex}" title="${esc(name)}" aria-label="${esc(name)}"></button>`).join('')}</div></div>
          <button class="link-arrow" data-action="clear-filters" style="align-self:start">Limpar filtros</button>
        </aside>
        <div>
          <p class="result-count" id="resultCount"></p><br>
          <div class="grid" id="shopGrid"></div>
        </div>
      </div>`;
  }

  function renderShopGrid(q) {
    const list = shopFiltered(q);
    const grid = $('#shopGrid');
    if (!grid) return;
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
    grid.innerHTML = list.length ? list.map(card).join('') : `<div class="empty" style="grid-column:1/-1"><p class="section__title" style="font-size:40px">Nada por aqui.</p><p class="muted">Tenta limpar os filtros.</p></div>`;
    $$('[data-f]').forEach((i) => { i.checked = shop[i.dataset.f].has(i.value); });
    $$('[data-color]').forEach((b) => b.classList.toggle('is-active', shop.colors.has(b.dataset.color)));
    const sel = $('[data-sort]'); if (sel) sel.value = shop.sort;
  }

  // ---- Produto ----
  let pdpSize = null;
  function pageProduct(id) {
    const p = byId[id];
    if (!p) return pageNotFound();
    pdpSize = p.sizes.length === 1 && !p.soldOut.length ? p.sizes[0] : null;
    const cat = catOf(p);
    const variants = PRODUCTS.filter((x) => x.name === p.name);
    const related = PRODUCTS.filter((x) => x.id !== p.id && catOf(x) === cat && x.name !== p.name).slice(0, 4);
    const n = installments(p.price);
    const isApparel = cat === 'roupas';

    return `
      <section class="pdp">
        <div class="pdp__gallery">
          <div>${art(p, 0)}</div><div>${art(p, 1)}</div><div>${art(p, 2)}</div>
        </div>
        <div class="pdp__info">
          <div class="crumbs"><a href="#/">Início</a> / <a href="#/loja?cat=${cat}">${CATEGORIES[cat].label}</a> / ${TYPE_LABEL[p.type]}</div>
          <div>
            ${p.tags.includes('collab') ? '<span class="badge badge--dark">Collab</span> ' : ''}${p.tags.includes('novo') ? '<span class="badge badge--accent">Novo</span>' : ''}
            <h1 class="pdp__title" style="margin-top:8px">${esc(p.name)}</h1>
            <p class="muted">${esc(p.colorName)}</p>
          </div>
          <div class="pdp__price">${money(p.price)}</div>
          <div class="pay-box">
            <span><b>${money(p.price * (1 - PIX_OFF))}</b> no Pix (5% off)</span>
            <span>ou ${n}x de ${money(p.price / n)} sem juros no cartão</span>
          </div>
          ${variants.length > 1 ? `<div><div class="label-row"><span>Cor: ${esc(p.colorName)}</span></div>
            <div class="variants">${variants.map((v) => `<a class="variant ${v.id === p.id ? 'is-active' : ''}" href="#/produto/${v.id}" title="${esc(v.colorName)}">${art(v, 0, { label: false })}</a>`).join('')}</div></div>` : ''}
          <div>
            <div class="label-row"><span>Tamanho</span>${isApparel ? '<a href="javascript:void 0" data-action="size-guide">Tabela de medidas</a>' : ''}</div>
            <div class="sizes">${p.sizes.map((s) => `<button class="size ${pdpSize === s ? 'is-active' : ''}" data-size-pick="${esc(s)}" ${p.soldOut.includes(s) ? 'disabled title="Esgotado"' : ''}>${esc(s)}</button>`).join('')}</div>
          </div>
          <button class="btn btn--block" data-action="pdp-add" data-id="${p.id}">${pdpSize ? 'Adicionar ao carrinho' : 'Selecione um tamanho'}</button>
          <div>
            <details open><summary>Descrição</summary><p>${describe(p)}</p></details>
            <details><summary>Composição e cuidados</summary><ul>${care(p).map((c) => `<li>${c}</li>`).join('')}</ul></details>
            <details><summary>Frete e trocas</summary>
              <p>Frete grátis acima de ${money(FREE_SHIP)}. Primeira troca grátis em até 30 dias.</p>
              <form class="shipping-calc" data-form="cep"><input inputmode="numeric" maxlength="9" placeholder="Seu CEP" aria-label="CEP"><button class="btn" style="height:40px">Calcular</button></form>
              <p id="cepResult" class="small"></p>
            </details>
          </div>
        </div>
      </section>
      ${related.length ? `<section class="section"><div class="section__head"><h2 class="section__title">Combina com</h2></div><div class="grid">${related.map(card).join('')}</div></section>` : ''}`;
  }

  function describe(p) {
    const d = {
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
    return d[p.type];
  }
  function care(p) {
    if (p.type === 'deck') return ['7 lâminas de maple canadense', 'Lixa não inclusa'];
    if (['bag', 'cap'].includes(p.type)) return ['Lavar à mão', 'Não usar alvejante', 'Secar à sombra'];
    return ['100% algodão (exceto nylon/ripstop)', 'Lavar do avesso em água fria', 'Não usar secadora', 'Não passar sobre a estampa'];
  }

  // ---- Lookbook ----
  function pageLookbook() {
    return `
      <section class="lookbook-hero">
        <span class="mono muted">Lookbook · Inverno 26</span>
        <h1 class="section__title" style="font-size:clamp(56px,11vw,160px)">Centro<br>de SP.</h1>
      </section>
      <div>
        ${LOOKBOOK.map((l, i) => {
          const items = l.ids.map((id) => byId[id]);
          return `<article class="look">
            <div class="look__img" style="background:${l.bg}">${items.map((p) => art({ ...p, bg: l.bg }, i % 2, { label: false })).join('')}</div>
            <div class="look__info">
              <span class="mono muted">Look ${String(i + 1).padStart(2, '0')}</span>
              <h2>${esc(l.title)}</h2>
              <p class="muted">${esc(l.caption)}</p>
              <div class="look__items">${items.map((p) => `<a href="#/produto/${p.id}"><span>${esc(p.name)} — ${esc(p.colorName)}</span><span class="price">${money(p.price)}</span></a>`).join('')}</div>
              <div><button class="btn" data-action="shop-look" data-ids="${l.ids.join(',')}">Comprar o look</button></div>
            </div>
          </article>`;
        }).join('')}
      </div>`;
  }

  // ---- Drop ----
  function pageDrop() {
    const d = nextDrop();
    const when = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    return `
      <section class="section drop-page">
        <span class="mono" style="color:#888">Drop semanal · ${esc(when)} às 11h</span>
        <h1 class="section__title" style="font-size:clamp(56px,11vw,160px);margin:8px 0 24px">${esc(DROP.name)}</h1>
        ${countdownHTML()}
        <form class="notify" data-form="notify"><input type="email" required placeholder="Me avisa quando abrir" aria-label="E-mail"><button class="btn btn--light">Avisar</button></form>
        <p class="small" style="color:#888;margin-top:8px">Limite de 1 unidade por modelo por CPF. Sem reposição.</p>
        <br><br>
        <div class="drop-grid">
          ${DROP.items.map((it) => `<div><div class="img">${art(it, 0, { label: false })}<div class="lock"><span>🔒 ${esc(when.split(',')[0]).toUpperCase()}</span></div></div>
            <strong>${esc(it.name)}</strong><span class="muted">${money(it.price)}</span></div>`).join('')}
        </div>
      </section>`;
  }

  // ---- Checkout ----
  function pageCheckout() {
    if (!cart.length) {
      return `<section class="section"><h1 class="section__title">Carrinho vazio</h1><br><a class="btn" href="#/loja">Ir pra loja</a></section>`;
    }
    const t = cartTotals();
    const n = installments(t.total);
    return `
      <section class="checkout">
        <form data-form="checkout">
          <h1>Checkout</h1>
          <h4 class="mono" style="margin-bottom:12px">1. Seus dados</h4>
          <div class="form">
            <label class="field full">Nome completo<input required name="nome" autocomplete="name"></label>
            <label class="field">E-mail<input required type="email" name="email" autocomplete="email"></label>
            <label class="field">CPF<input required name="cpf" inputmode="numeric" placeholder="000.000.000-00" maxlength="14"></label>
          </div>
          <h4 class="mono" style="margin:28px 0 12px">2. Entrega</h4>
          <div class="form">
            <label class="field">CEP<input required name="cep" inputmode="numeric" placeholder="00000-000" maxlength="9" autocomplete="postal-code"></label>
            <label class="field">Número<input required name="numero"></label>
            <label class="field full">Endereço<input required name="endereco" autocomplete="street-address"></label>
            <label class="field">Cidade<input required name="cidade" autocomplete="address-level2"></label>
            <label class="field">UF<input required name="uf" maxlength="2" autocomplete="address-level1"></label>
          </div>
          <h4 class="mono" style="margin:28px 0 12px">3. Pagamento</h4>
          <div class="pay-options">
            <label class="pay-opt"><input type="radio" name="pay" value="pix" checked><div><strong>Pix — ${money(t.pix)}</strong><small>5% de desconto · aprovação na hora</small></div></label>
            <label class="pay-opt"><input type="radio" name="pay" value="cartao"><div><strong>Cartão de crédito — até ${n}x de ${money(t.total / n)}</strong><small>Sem juros · dados do cartão no ambiente seguro do gateway</small></div></label>
            <label class="pay-opt"><input type="radio" name="pay" value="boleto"><div><strong>Boleto — ${money(t.total)}</strong><small>Compensação em até 2 dias úteis</small></div></label>
          </div>
          <br>
          <button class="btn btn--block">Finalizar pedido</button>
          <p class="small muted" style="margin-top:8px">Protótipo: nenhum pagamento real é processado.</p>
        </form>
        <aside class="summary">
          <h4 class="mono">Resumo (${t.count} ${t.count === 1 ? 'item' : 'itens'})</h4>
          ${cart.map((l) => { const p = byId[l.id]; return `<div class="line" style="grid-template-columns:56px 1fr auto"><div class="line__img">${art(p, 0, { label: false })}</div><div><div class="line__name">${esc(p.name)}</div><div class="muted small">${esc(p.colorName)} · ${esc(l.size)} · ${l.qty}x</div></div><div class="price">${money(p.price * l.qty)}</div></div>`; }).join('')}
          <div class="totals">
            <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
            <div><span>Frete</span><span>${t.ship ? money(t.ship) : 'Grátis'}</span></div>
            <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
            <div class="pix"><span>No Pix</span><span>${money(t.pix)}</span></div>
          </div>
        </aside>
      </section>`;
  }

  function fakeQR(seed) {
    let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const N = 25; let cells = '';
    const finder = (r, c) => [[0, 0], [0, N - 7], [N - 7, 0]].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.5) cells += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
    const f = (r, c) => `<rect x="${c}" y="${r}" width="7" height="7"/><rect x="${c + 1}" y="${r + 1}" width="5" height="5" fill="#fff"/><rect x="${c + 2}" y="${r + 2}" width="3" height="3"/>`;
    return `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" style="background:#fff" shape-rendering="crispEdges">${cells}${f(0, 0)}${f(0, N - 7)}${f(N - 7, 0)}</svg>`;
  }

  function pageOrder(q) {
    const code = q.n || '000000';
    const pix = q.pay === 'pix';
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136bloco-demo-${code}5204000053039865406${q.v || '0.00'}5802BR5913BLOCO SUPPLY6009SAO PAULO62070503***6304ABCD`;
    return `
      <section class="section">
        <span class="mono muted">Pedido #${esc(code)}</span>
        <h1 class="section__title" style="font-size:clamp(48px,9vw,120px)">Valeu! ✓</h1>
        <p style="max-width:520px;margin:12px 0 24px">${pix ? 'Pague com Pix pra confirmar o pedido. O QR code expira em 30 minutos.' : 'Pedido recebido. Você vai receber a confirmação por e-mail.'}</p>
        ${pix ? `<div class="pix-qr" style="max-width:560px">${fakeQR(code)}<div><strong>Pix · ${money(Number(q.v || 0))}</strong>
          <code id="pixCode">${esc(pixCode)}</code><br><button class="btn" data-action="copy-pix" style="height:40px">Copiar código</button></div></div>
          <p class="small muted" style="margin-top:8px">Protótipo: este QR é ilustrativo e não realiza cobrança.</p>` : ''}
        <br><a class="btn btn--ghost" href="#/loja">Continuar comprando</a>
      </section>`;
  }

  function pageNotFound() {
    return `<section class="section"><h1 class="section__title" style="font-size:120px">404</h1><p>Essa página caiu do skate.</p><br><a class="btn" href="#/">Voltar pro início</a></section>`;
  }

  /* =====================================================================
     Roteador (hash)
     ===================================================================== */
  function parseHash() {
    const h = location.hash.slice(1) || '/';
    const [path, qs = ''] = h.split('?');
    return { parts: path.split('/').filter(Boolean), q: Object.fromEntries(new URLSearchParams(qs)) };
  }

  function router() {
    const { parts, q } = parseHash();
    const [route, arg] = parts;
    let html;
    switch (route) {
      case undefined: html = pageHome(); break;
      case 'loja': html = pageShop(q); break;
      case 'produto': html = pageProduct(arg); break;
      case 'lookbook': html = pageLookbook(); break;
      case 'drop': html = pageDrop(); break;
      case 'checkout': html = pageCheckout(); break;
      case 'pedido': html = pageOrder(q); break;
      default: html = pageNotFound();
    }
    app.innerHTML = html;
    if (route === 'loja') renderShopGrid(q);
    tickCountdowns();
    toggleMenu(false);
    openCart(false);
    window.scrollTo(0, 0);
    // nav ativo
    const href = location.hash || '#/';
    $$('.nav a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === href));
    const titles = { loja: 'Loja', produto: byId[arg]?.name, lookbook: 'Lookbook', drop: 'Drop', checkout: 'Checkout', pedido: 'Pedido' };
    document.title = titles[route] ? `${titles[route]} — BLOCO Supply Co.` : 'BLOCO Supply Co.';
  }

  /* =====================================================================
     Eventos
     ===================================================================== */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action],[data-add],[data-qty],[data-remove],[data-size-pick],[data-color]');
    if (!t) return;

    if (t.dataset.add) { addToCart(t.dataset.add, t.dataset.size); return; }
    if (t.dataset.qty !== undefined) { const i = +t.dataset.qty; setQty(i, cart[i].qty + Number(t.dataset.d)); return; }
    if (t.dataset.remove !== undefined) { setQty(+t.dataset.remove, 0); return; }
    if (t.dataset.sizePick) {
      pdpSize = t.dataset.sizePick;
      $$('.size').forEach((b) => b.classList.toggle('is-active', b === t));
      $('[data-action="pdp-add"]').textContent = 'Adicionar ao carrinho';
      return;
    }
    if (t.dataset.color) {
      const c = t.dataset.color;
      shop.colors.has(c) ? shop.colors.delete(c) : shop.colors.add(c);
      renderShopGrid(parseHash().q);
      return;
    }

    switch (t.dataset.action) {
      case 'cart': openCart(true); break;
      case 'cart-close': openCart(false); break;
      case 'menu': toggleMenu(); break;
      case 'search': { const s = $('#search'); s.hidden = !s.hidden; if (!s.hidden) $('#searchInput').focus(); break; }
      case 'search-close': $('#search').hidden = true; break;
      case 'filters': $('#filters').classList.toggle('is-open'); break;
      case 'clear-filters': shop.types.clear(); shop.sizes.clear(); shop.colors.clear(); renderShopGrid(parseHash().q); break;
      case 'pdp-add':
        if (!pdpSize) { toast('Escolhe um tamanho primeiro'); return; }
        addToCart(t.dataset.id, pdpSize);
        openCart(true);
        break;
      case 'shop-look': {
        const ids = t.dataset.ids.split(',');
        ids.forEach((id) => { const p = byId[id]; const s = p.sizes.find((x) => !p.soldOut.includes(x) && ['M', '40', 'Único', '8.25"'].includes(x)) || p.sizes.find((x) => !p.soldOut.includes(x)); cart.push({ id, size: s, qty: 1 }); });
        saveCart(); openCart(true); toast('Look adicionado (tamanhos padrão — ajuste no carrinho)');
        break;
      }
      case 'size-guide': toast('Tabela: P 52cm · M 55cm · G 58cm · GG 61cm · XG 64cm (largura)'); break;
      case 'copy-pix': navigator.clipboard?.writeText($('#pixCode').textContent).then(() => toast('Código Pix copiado'), () => toast('Não deu pra copiar')); break;
    }
  });

  $('#overlay').addEventListener('click', () => openCart(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { openCart(false); toggleMenu(false); $('#search').hidden = true; } });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.f) { t.checked ? shop[t.dataset.f].add(t.value) : shop[t.dataset.f].delete(t.value); renderShopGrid(parseHash().q); }
    if (t.matches('[data-sort]')) { shop.sort = t.value; renderShopGrid(parseHash().q); }
  });

  $('#searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      location.hash = `#/loja?q=${encodeURIComponent(e.target.value.trim())}`;
      $('#search').hidden = true;
      e.target.value = '';
    }
  });

  // Máscaras simples de CEP/CPF
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.name === 'cep' || t.closest('[data-form="cep"]')) t.value = t.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    if (t.name === 'cpf') t.value = t.value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    if (t.name === 'uf') t.value = t.value.toUpperCase();
  });

  document.addEventListener('submit', (e) => {
    const f = e.target.dataset.form;
    if (!f) return;
    e.preventDefault();
    if (f === 'newsletter' || f === 'notify') { toast(f === 'notify' ? 'Fechou! A gente te avisa 1h antes.' : 'Bem-vindo à lista ✓'); e.target.reset(); }
    if (f === 'cep') {
      const cep = e.target.querySelector('input').value.replace(/\D/g, '');
      const r = $('#cepResult');
      if (cep.length !== 8) { r.textContent = 'CEP inválido.'; return; }
      const sp = cep.startsWith('0');
      r.innerHTML = `PAC: ${sp ? '3–5' : '6–10'} dias úteis · ${money(SHIP_PRICE)}<br>SEDEX: ${sp ? '1–2' : '3–5'} dias úteis · ${money(SHIP_PRICE * 1.8)}<br><b>Grátis acima de ${money(FREE_SHIP)}</b>`;
    }
    if (f === 'checkout') {
      const pay = new FormData(e.target).get('pay');
      const t = cartTotals();
      const n = String(Math.floor(100000 + Math.random() * 900000));
      const v = (pay === 'pix' ? t.pix : t.total).toFixed(2);
      cart = []; saveCart();
      location.hash = `#/pedido?n=${n}&pay=${pay}&v=${v}`;
    }
  });

  window.addEventListener('hashchange', router);
  renderCart();
  router();
})();
