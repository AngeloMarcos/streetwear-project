// "Fotos" dos produtos em SVG — usadas enquanto o produto não tem foto real cadastrada no admin.
export type ArtInput = { slug?: string; type: string; color: string; bg: string; ink: string; print?: string };

export const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const safeColor = (c: string) => (/^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#151515');

const SH = 'rgba(0,0,0,.22)';
const HL = 'rgba(255,255,255,.12)';
const FONT = 'Anton, Impact, sans-serif';
const fontFor = (txt: string, max: number, width: number) => Math.min(max, (width / Math.max(txt.length, 1)) * 1.7);

type P = Required<ArtInput>;

function printFor(p: P, view: number, cx: number, cy: number) {
  if (!p.print) return '';
  if (view === 1) {
    const size = fontFor(p.print, 44, 76);
    return `<text x="${cx}" y="${cy + size / 3}" text-anchor="middle" font-family="${FONT}" font-size="${size}" fill="${p.ink}">${esc(p.print)}</text>
      <text x="${cx}" y="${cy + size / 3 + 16}" text-anchor="middle" font-family="monospace" font-size="6" letter-spacing="1.5" fill="${p.ink}">SUPPLY CO. — SÃO PAULO</text>`;
  }
  return `<text x="${cx + 18}" y="${cy}" text-anchor="middle" font-family="${FONT}" font-size="9" fill="${p.ink}">${esc(p.print)}</text>`;
}

const SHAPES: Record<string, (p: P, v: number) => string> = {
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
    ${p.slug.includes('double') ? `<rect x="58" y="110" width="36" height="34" fill="${SH}"/><rect x="106" y="110" width="36" height="34" fill="${SH}"/>` : ''}`,
  shorts: (p) => `
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
    <text x="100" y="104" text-anchor="middle" font-family="${FONT}" font-size="30" fill="${p.ink}">${esc(p.print || 'B')}</text>`,
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
    <text transform="translate(108 100) rotate(-90)" text-anchor="middle" font-family="${FONT}" font-size="${fontFor(p.print || 'STREET DREAMS', 36, 110)}" fill="${p.ink}">${esc(p.print || 'STREET DREAMS')}</text>
    <circle cx="100" cy="30" r="3" fill="${SH}"/><circle cx="100" cy="170" r="3" fill="${SH}"/>`,
};

/** view: 0 frente · 1 costas · 2 detalhe */
export function art(input: ArtInput, view = 0, label = false): string {
  const p: P = {
    slug: input.slug ?? '',
    type: input.type,
    color: safeColor(input.color),
    bg: safeColor(input.bg),
    ink: safeColor(input.ink),
    print: input.print ?? '',
  };
  const shape = (SHAPES[p.type] || SHAPES.tee)(p, view === 2 ? 0 : view);
  const g = view === 2 ? 'translate(-140 -40) scale(3.4)' : 'translate(40 90) scale(1.6)';
  const tag = label
    ? `<text x="16" y="484" font-family="monospace" font-size="11" letter-spacing="1" fill="${p.color}" opacity=".55">${['FRENTE', 'COSTAS', 'DETALHE'][view]}</text>`
    : '';
  const shadowY = p.type === 'cap' || p.type === 'shorts' ? 340 : 400;
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="500" fill="${p.bg}"/>${view !== 2 ? `<ellipse cx="200" cy="${shadowY}" rx="130" ry="14" fill="rgba(0,0,0,.12)"/>` : ''}<g transform="${g}">${shape}</g>${tag}</svg>`;
}
