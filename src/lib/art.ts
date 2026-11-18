// "Fotos" de estúdio dos produtos em SVG — usadas enquanto o produto não tem foto real cadastrada no admin.
// Todas as peças ficam no mesmo fundo de estúdio, com luz, sombra e textura do tecido.
export type ArtInput = { slug?: string; type: string; color: string; bg: string; ink: string; print?: string };

export const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const safeColor = (c: string) => (/^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#151515');

type P = Required<ArtInput>;

// Definições iguais em todos os SVGs (não dependem da cor), então podem repetir o mesmo id na página.
const DEFS = `<defs>
<linearGradient id="sdS" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="sdSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<radialGradient id="sdBg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#f4f3f1"/><stop offset="1" stop-color="#e2e0dc"/></radialGradient>
<linearGradient id="sdMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5f5f5"/><stop offset=".4" stop-color="#9c9c9c"/><stop offset=".6" stop-color="#e6e6e6"/><stop offset="1" stop-color="#6e6e6e"/></linearGradient>
<linearGradient id="sdLens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient>
<pattern id="sdDenim" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="3" height="3" fill="none"/><path d="M0 0V3" stroke="#fff" stroke-opacity=".09" stroke-width="1"/></pattern>
<pattern id="sdRip" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0H6M0 0V6" stroke="#000" stroke-opacity=".09" stroke-width=".6"/></pattern>
<pattern id="sdMesh" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="#000" fill-opacity=".28"/></pattern>
<pattern id="sdWaffle" width="4" height="4" patternUnits="userSpaceOnUse"><rect x=".6" y=".6" width="2.8" height="2.8" fill="none" stroke="#000" stroke-opacity=".1" stroke-width=".5"/></pattern>
<pattern id="sdRib" width="2.4" height="4" patternUnits="userSpaceOnUse"><path d="M1.2 0V4" stroke="#000" stroke-opacity=".16" stroke-width=".8"/></pattern>
<filter id="sdDs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".18"/></filter>
</defs>`;

/** Tecido: cor da peça + luz/sombra + textura opcional */
const fab = (d: string, c: string, tex = '') =>
  `<path d="${d}" fill="${c}"/>${tex ? `<path d="${d}" fill="url(#${tex})"/>` : ''}<path d="${d}" fill="url(#sdS)"/>`;
const line = (d: string, op = .14, w = 1.2, col = '#000') => `<path d="${d}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
const stitch = (d: string, col = '#000', op = .25) => `<path d="${d}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width=".7" stroke-dasharray="2 1.6"/>`;
const word = (txt: string, x: number, y: number, size: number, fill: string, extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="middle" style="font-family:var(--display),Arial Black,sans-serif;font-weight:800;font-stretch:125%" font-size="${size}" fill="${fill}" ${extra}>${esc(txt)}</text>`;
const fit = (txt: string, max: number, width: number) => Math.min(max, (width / Math.max(txt.length, 1)) * 1.45);

/** Estampa: no peito (frente) ou grande nas costas */
function graphic(p: P, v: number, cx: number, cy: number, back = 70) {
  if (!p.print) return '';
  if (v === 1) {
    const s = fit(p.print, 26, back);
    return word(p.print, cx, cy, s, p.ink) + `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-family="Arial,sans-serif" font-size="4.2" letter-spacing="1.2" fill="${p.ink}">SÃO PAULO · BRASIL · 2026</text>`;
  }
  return word(p.print, cx + 20, cy, fit(p.print, 7, 26), p.ink);
}

const TEE = 'M60 36 Q100 50 140 36 L174 50 L192 92 L162 104 L156 94 L156 180 Q100 186 44 180 L44 94 L38 104 L8 92 L26 50 Z';
const LS = 'M60 36 Q100 50 140 36 L172 50 L186 120 L196 172 L176 176 L158 110 L156 180 Q100 186 44 180 L42 110 L24 176 L4 172 L14 120 L28 50 Z';
const HOOD_BODY = 'M64 44 L34 56 L18 120 L10 176 L32 180 L46 118 L48 104 L48 184 Q100 190 152 184 L152 104 L154 118 L168 180 L190 176 L182 120 L166 56 L136 44 Z';
const JACKET = 'M66 40 L36 52 L20 116 L14 172 L36 176 L46 116 L50 100 L50 182 L150 182 L150 100 L154 116 L164 176 L186 172 L180 116 L164 52 L134 40 Z';
const PUFF = 'M62 40 L28 52 L12 114 L10 158 L36 162 L44 116 L46 104 L46 160 Q100 168 154 160 L154 104 L156 116 L164 162 L190 158 L188 114 L172 52 L138 40 Z';
const PANTS = 'M58 10 L142 10 L152 190 L106 190 L100 70 L94 190 L48 190 Z';
const BAGGY = 'M58 10 L142 10 L158 192 L104 192 L100 72 L96 192 L42 192 Z';
const JORTS = 'M56 34 L144 34 L160 156 L106 158 L100 88 L94 158 L40 156 Z';
const SHORTS = 'M58 50 L142 50 L154 138 L106 140 L100 96 L94 140 L46 138 Z';

const SHAPES: Record<string, (p: P, v: number) => string> = {
  tee: (p, v) => `
    ${fab(TEE, p.color)}
    <path d="${TEE}" fill="url(#sdSide)"/>
    <path d="M68 38 Q100 ${v === 1 ? 44 : 58} 132 38 Q100 ${v === 1 ? 50 : 66} 68 38 Z" fill="${p.color}" stroke="#000" stroke-opacity=".22" stroke-width="1"/>
    ${line('M44 94 L56 98 M156 94 L144 98', .12)}${line('M70 118 Q84 140 78 176', .07, 2)}${line('M128 112 Q120 146 126 178', .07, 2)}
    ${stitch('M46 175 Q100 181 154 175')}${stitch('M14 88 L36 98 M186 88 L164 98')}
    ${graphic(p, v, 100, v === 1 ? 92 : 74)}`,
  longsleeve: (p, v) => `
    ${fab(LS, p.color, p.slug.includes('thermal') ? 'sdWaffle' : '')}
    <path d="${LS}" fill="url(#sdSide)"/>
    <path d="M68 38 Q100 ${v === 1 ? 44 : 58} 132 38 Q100 ${v === 1 ? 50 : 66} 68 38 Z" fill="${p.color}" stroke="#000" stroke-opacity=".22"/>
    <path d="M4 172 L24 176 L26 166 L7 162 Z M196 172 L176 176 L174 166 L193 162 Z" fill="#000" fill-opacity=".14"/>
    ${line('M42 110 L44 176 M158 110 L156 176', .1)}${line('M74 120 Q86 146 80 178', .07, 2)}
    ${graphic(p, v, 100, v === 1 ? 92 : 74)}`,
  jersey: (p, v) => `
    ${fab(TEE, p.color, 'sdRip')}
    <path d="M44 100 L58 100 L58 181 L44 180 Z M156 100 L142 100 L142 181 L156 180 Z" fill="${p.ink}" opacity=".9"/>
    <path d="M8 92 L26 50 L32 52 L14 95 Z M192 92 L174 50 L168 52 L186 95 Z" fill="${p.ink}"/>
    ${v === 1 ? `<path d="M66 38 Q100 46 134 38" fill="none" stroke="${p.ink}" stroke-width="4"/>
      ${word('10', 100, 132, 46, p.ink)}${word(p.print || 'SD', 100, 78, 9, p.ink)}`
    : `<path d="M66 37 L100 66 L134 37" fill="none" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M70 78 h12 v10 q-6 5 -12 0 z" fill="${p.ink}"/>
      ${word('STREET DREAMS', 100, 122, 9, p.ink)}<rect x="118" y="74" width="12" height="9" fill="${p.ink}" opacity=".7"/>`}
    <path d="${TEE}" fill="url(#sdS)"/>`,
  rugby: (p, v) => `
    <clipPath id="sdCR"><path d="${LS}"/></clipPath>
    ${fab(LS, p.color)}
    <g clip-path="url(#sdCR)">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="0" y="${58 + i * 20}" width="200" height="10" fill="${p.ink}"/>`).join('')}</g>
    <path d="${LS}" fill="url(#sdS)"/>
    <path d="M70 36 L100 50 L130 36 L140 44 L112 66 L100 54 L88 66 L60 44 Z" fill="#f4f1e8" stroke="#000" stroke-opacity=".2"/>
    ${v === 1 ? '' : `<rect x="94" y="54" width="12" height="34" fill="#f4f1e8"/><circle cx="100" cy="64" r="1.6" fill="#999"/><circle cx="100" cy="78" r="1.6" fill="#999"/>`}
    <path d="M4 172 L24 176 L26 164 L7 160 Z M196 172 L176 176 L174 164 L193 160 Z M44 172 L156 172 L156 182 Q100 188 44 182Z" fill="#f4f1e8" opacity=".95"/>`,
  hoodie: (p, v) => {
    const zip = p.slug.includes('zip');
    return `
    ${fab(HOOD_BODY, p.color)}<path d="${HOOD_BODY}" fill="url(#sdSide)"/>
    <path d="M64 46 Q60 6 100 4 Q140 6 136 46 Q100 ${v === 1 ? 52 : 70} 64 46 Z" fill="${p.color}"/><path d="M64 46 Q60 6 100 4 Q140 6 136 46 Q100 ${v === 1 ? 52 : 70} 64 46 Z" fill="url(#sdS)"/>
    ${v === 1 ? line('M100 6 L100 48', .18) : `<path d="M74 44 Q100 66 126 44 Q118 20 100 18 Q82 20 74 44Z" fill="#000" fill-opacity=".28"/>`}
    <path d="M48 174 L152 174 L152 186 Q100 192 48 186Z M10 170 L32 174 L33 182 L9 178Z M190 170 L168 174 L167 182 L191 178Z" fill="url(#sdRib)"/>
    ${v === 1 ? '' : zip
      ? `<path d="M100 62 L100 186" stroke="#2a2a2a" stroke-width="2.4"/><rect x="97.5" y="64" width="5" height="10" rx="1.5" fill="url(#sdMetal)"/>${line('M64 132 L74 166 M136 132 L126 166', .25, 1.4)}`
      : `<path d="M66 128 L134 128 L144 166 L56 166 Z" fill="${p.color}" stroke="#000" stroke-opacity=".2"/>${line('M66 128 L56 166 M134 128 L144 166', .22, 1.4)}`}
    ${line('M60 104 Q72 140 66 172', .06, 2)}${line('M140 100 Q130 140 136 172', .06, 2)}
    ${zip ? '' : graphic(p, v, 100, v === 1 ? 104 : 96, 80)}`;
  },
  jacket: (p, v) => `
    ${fab(JACKET, p.color, 'sdDenim')}<path d="${JACKET}" fill="url(#sdSide)"/>
    <path d="M66 40 L100 64 L134 40 L128 30 L100 50 L72 30 Z" fill="#3a2a1c"/>
    ${v === 1 ? `${stitch('M50 70 L150 70')}${stitch('M50 120 L150 120')}`
    : `<path d="M100 64 L100 182" stroke="#000" stroke-opacity=".3" stroke-width="1.2"/>
       ${[80, 104, 128, 152].map((y) => `<circle cx="104" cy="${y}" r="2.3" fill="url(#sdMetal)"/>`).join('')}
       <path d="M62 116 h26 v28 h-26z M112 116 h26 v28 h-26z" fill="${p.color}" stroke="#000" stroke-opacity=".25"/>
       ${stitch('M62 120 h26 M112 120 h26', '#e8c37a', .8)}
       <path d="M64 82 h20 v14 h-20z" fill="${p.color}" stroke="#000" stroke-opacity=".25"/><rect x="69" y="86" width="10" height="5" fill="${p.ink}"/>`}
    ${stitch('M52 176 L148 176', '#e8c37a', .7)}`,
  track: (p, v) => `
    ${fab(JACKET, p.color, 'sdRip')}<path d="${JACKET}" fill="url(#sdSide)"/>
    <path d="M36 52 L20 116 L14 172 M164 52 L180 116 L186 172" fill="none" stroke="${p.ink}" stroke-width="5"/>
    <path d="M42 52 L27 116 L22 172 M158 52 L173 116 L178 172" fill="none" stroke="${p.ink}" stroke-width="2"/>
    <path d="M78 30 L122 30 L130 42 L100 50 L70 42Z" fill="${p.ink}"/>
    <path d="M14 168 L36 172 L37 180 L13 177Z M186 168 L164 172 L163 180 L187 177Z M50 176 L150 176 L150 184 L50 184Z" fill="${p.ink}"/>
    ${v === 1 ? word(p.print || 'STREET DREAMS', 100, 74, fit(p.print || 'STREET DREAMS', 11, 80), p.ink)
    : `<path d="M100 28 L100 184" stroke="#1b1b1b" stroke-width="2.2"/><rect x="97.5" y="44" width="5" height="11" rx="1.5" fill="url(#sdMetal)"/>
       ${line('M60 120 L66 150 M140 120 L134 150', .3, 1.4)}<path d="M118 66 l8 -6 l8 6 l-8 6z" fill="${p.ink}"/>`}`,
  puffer: (p, v) => `
    ${fab(PUFF, p.color)}
    ${[62, 82, 102, 122, 142].map((y) => `<path d="M46 ${y} Q100 ${y + 7} 154 ${y}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/><path d="M48 ${y + 4} Q100 ${y + 12} 152 ${y + 4}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`).join('')}
    ${[70, 90, 110, 130].map((y) => `<path d="M${30 - (y - 70) * .2} ${y} L${44 - (y - 70) * .02} ${y + 4} M${170 + (y - 70) * .2} ${y} L${156 + (y - 70) * .02} ${y + 4}" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>`).join('')}
    <path d="M64 40 Q100 30 136 40 L138 22 Q100 12 62 22Z" fill="${p.color}"/><path d="M64 40 Q100 30 136 40 L138 22 Q100 12 62 22Z" fill="url(#sdS)"/>
    ${v === 1 ? '' : `<path d="M100 20 L100 164" stroke="#1b1b1b" stroke-width="2"/><rect x="97.5" y="24" width="5" height="10" rx="1.5" fill="url(#sdMetal)"/><rect x="112" y="60" width="16" height="6" fill="${p.ink}"/>`}
    <path d="M10 154 L36 158 L36 166 L9 162Z M190 154 L164 158 L164 166 L191 162Z" fill="#000" fill-opacity=".35"/>`,
  shell: (p, v) => `
    ${fab(HOOD_BODY, p.color, 'sdRip')}
    <clipPath id="sdCS"><path d="${HOOD_BODY}"/></clipPath>
    <g clip-path="url(#sdCS)"><path d="M0 40 L200 40 L200 92 Q100 108 0 92Z" fill="${p.ink}"/></g>
    <path d="${HOOD_BODY}" fill="url(#sdS)"/>
    <path d="M64 46 Q60 8 100 6 Q140 8 136 46 Q100 ${v === 1 ? 52 : 70} 64 46 Z" fill="${p.ink}"/><path d="M64 46 Q60 8 100 6 Q140 8 136 46 Q100 70 64 46 Z" fill="url(#sdS)"/>
    ${v === 1 ? word(p.print || 'SD', 100, 140, 12, '#d9d9d9', 'opacity=".9"')
    : `<path d="M100 62 L100 104" stroke="#1b1b1b" stroke-width="2"/><rect x="97.5" y="62" width="5" height="9" rx="1.5" fill="url(#sdMetal)"/>
       <path d="M62 122 L138 122 L144 158 L56 158Z" fill="${p.color}" stroke="#000" stroke-opacity=".25"/>${line('M70 140 L130 140', .3, 1.2)}
       <rect x="70" y="112" width="3" height="7" fill="#e6e6e6"/><rect x="127" y="112" width="3" height="7" fill="#e6e6e6"/>`}
    <path d="M48 178 L152 178 L152 186 Q100 190 48 186Z" fill="#000" fill-opacity=".25"/>`,
  pants: (p, v) => {
    const track = p.slug.includes('track');
    const D = track ? BAGGY : PANTS;
    return `
    ${fab(D, p.color, p.slug.includes('cargo') ? 'sdRip' : '')}<path d="${D}" fill="url(#sdSide)"/>
    <rect x="58" y="10" width="84" height="12" fill="${track ? 'url(#sdRib)' : '#000'}" fill-opacity="${track ? 1 : .15}"/>
    ${track ? `<path d="M50 24 L44 190 M150 24 L156 190" stroke="${p.ink}" stroke-width="4"/>${line('M96 14 Q100 30 98 40 M104 14 Q102 30 106 42', .5, 1)}`
    : v === 1 ? `<path d="M68 32 h22 v22 h-22z M110 32 h22 v22 h-22z" fill="none" stroke="#000" stroke-opacity=".22"/>`
      : `${line('M100 22 L100 66', .25)}${line('M64 22 Q70 36 84 36 M136 22 Q130 36 116 36', .25)}
         ${p.slug.includes('cargo') ? `<path d="M48 96 h20 v30 h-20z M132 96 h20 v30 h-20z" fill="${p.color}" stroke="#000" stroke-opacity=".3"/>${line('M48 104 h20 M132 104 h20', .3)}` : ''}`}
    ${p.slug.includes('double') ? `<path d="M54 112 h40 v40 h-42z M106 112 h40 l2 40 h-42z" fill="#000" fill-opacity=".12"/>${stitch('M54 114 h40 M106 114 h40')}` : ''}
    ${line('M74 80 Q78 130 72 186', .07, 2)}${line('M126 80 Q122 130 128 186', .07, 2)}
    ${line('M50 182 Q72 178 94 182 M106 182 Q128 178 150 182', .16, 1.4)}`;
  },
  jeans: (p, v) => `
    ${fab(BAGGY, p.color, 'sdDenim')}<path d="${BAGGY}" fill="url(#sdSide)"/>
    <rect x="58" y="10" width="84" height="12" fill="#000" fill-opacity=".14"/>${stitch('M58 13 H142 M58 20 H142', '#d79a45', .9)}
    ${[66, 84, 116, 134].map((x) => `<rect x="${x}" y="9" width="4" height="15" fill="${p.color}" stroke="#000" stroke-opacity=".2" stroke-width=".6"/>`).join('')}
    ${v === 1 ? `<path d="M64 36 h28 l-2 28 l-12 6 l-12 -6z M108 36 h28 l-2 28 l-12 6 l-12 -6z" fill="${p.color}" stroke="#000" stroke-opacity=".25"/>${stitch('M66 40 h24 M110 40 h24', '#d79a45', .9)}<rect x="122" y="22" width="12" height="7" fill="#c7b08a"/>`
    : `${stitch('M100 22 L100 64', '#d79a45', .9)}${stitch('M62 22 Q68 40 86 40 M138 22 Q132 40 114 40', '#d79a45', .9)}<circle cx="100" cy="16" r="2.4" fill="url(#sdMetal)"/><circle cx="66" cy="32" r="1.2" fill="#c08a3c"/><circle cx="134" cy="32" r="1.2" fill="#c08a3c"/>`}
    ${line('M72 86 Q78 140 70 188', .08, 3)}${line('M128 86 Q122 140 130 188', .08, 3)}
    ${[170, 178, 186].map((y) => line(`M44 ${y} Q70 ${y - 4} 96 ${y} M104 ${y} Q130 ${y - 4} 156 ${y}`, .12, 1.2)).join('')}`,
  jorts: (p, v) => `
    ${fab(JORTS, p.color, 'sdDenim')}<path d="${JORTS}" fill="url(#sdSide)"/>
    <rect x="56" y="34" width="88" height="11" fill="#000" fill-opacity=".14"/>${stitch('M56 37 H144 M56 43 H144', '#d79a45', .9)}
    ${[64, 84, 116, 136].map((x) => `<rect x="${x}" y="33" width="4" height="13" fill="${p.color}" stroke="#000" stroke-opacity=".2" stroke-width=".6"/>`).join('')}
    ${v === 1 ? `<path d="M64 56 h26 l-2 26 l-11 5 l-11 -5z M110 56 h26 l-2 26 l-11 5 l-11 -5z" fill="${p.color}" stroke="#000" stroke-opacity=".25"/><rect x="120" y="45" width="12" height="7" fill="#c7b08a"/>`
    : `${stitch('M100 45 L100 82', '#d79a45', .9)}${stitch('M60 45 Q66 60 84 60 M140 45 Q134 60 116 60', '#d79a45', .9)}<circle cx="100" cy="40" r="2.3" fill="url(#sdMetal)"/>`}
    ${line('M70 96 Q74 126 66 154', .08, 3)}${line('M130 96 Q126 126 134 154', .08, 3)}
    ${stitch('M41 150 Q68 146 94 151 M106 151 Q132 146 159 150', '#d79a45', .9)}`,
  shorts: (p) => {
    const track = p.slug.includes('track');
    return `
    ${fab(SHORTS, p.color, 'sdRip')}<path d="${SHORTS}" fill="url(#sdSide)"/>
    <rect x="58" y="50" width="84" height="11" fill="url(#sdRib)"/><rect x="58" y="50" width="84" height="11" fill="#000" fill-opacity=".1"/>
    ${line('M94 58 Q90 74 96 80 M106 58 Q110 74 104 80', .5, 1, '#fff')}
    ${track ? `<path d="M56 62 L48 138 M144 62 L152 138" stroke="${p.ink}" stroke-width="4"/><path d="M46 132 Q70 126 94 136 M106 136 Q130 126 154 132" fill="none" stroke="${p.ink}" stroke-width="2.4"/>` : `<rect x="122" y="116" width="14" height="8" fill="${p.ink}"/>`}`;
  },
  cap: (p, v) => {
    const trucker = p.slug.includes('trucker');
    const crown = 'M48 124 Q46 54 100 52 Q154 54 152 124 Z';
    if (v === 1) return `
      ${fab(crown, p.color, trucker ? 'sdMesh' : '')}
      <path d="M78 124 Q100 100 122 124 Z" fill="#e2e0dc"/><rect x="82" y="112" width="36" height="5" rx="1" fill="${trucker ? '#222' : 'url(#sdMetal)'}"/>
      ${line('M100 52 L100 104', .2)}`;
    return `
      ${fab(crown, p.color, '')}
      ${trucker ? `<path d="M100 52 Q154 54 152 124 L128 124 Q130 80 100 52Z M100 52 Q46 54 48 124 L72 124 Q70 80 100 52Z" fill="url(#sdMesh)"/>
        <path d="M72 124 Q70 80 100 52 Q130 80 128 124Z" fill="${p.ink}"/><path d="M72 124 Q70 80 100 52 Q130 80 128 124Z" fill="url(#sdS)"/>` : ''}
      ${line('M100 54 L100 122', .18)}${line('M76 58 Q66 88 68 122 M124 58 Q134 88 132 122', .14)}
      ${[66, 84, 116, 134].map((x) => `<circle cx="${x}" cy="${68 + Math.abs(100 - x) * .18}" r="1.4" fill="#000" fill-opacity=".25"/>`).join('')}
      <path d="M38 122 Q100 108 162 122 Q174 140 100 148 Q26 140 38 122 Z" fill="${p.color}"/><path d="M38 122 Q100 108 162 122 Q174 140 100 148 Q26 140 38 122 Z" fill="#000" fill-opacity=".14"/>
      ${stitch('M44 128 Q100 116 156 128 M46 134 Q100 122 154 134')}
      <circle cx="100" cy="53" r="3.4" fill="${p.color}" stroke="#000" stroke-opacity=".25"/>
      ${word(p.print || 'SD', 100, trucker ? 100 : 98, trucker ? 18 : 22, trucker ? p.color : p.ink)}`;
  },
  beanie: (p) => `
    ${fab('M56 132 Q54 50 100 48 Q146 50 144 132 Z', p.color, 'sdRib')}
    ${fab('M50 112 L150 112 L152 154 L48 154 Z', p.color, 'sdRib')}
    <path d="M48 112 L152 112" stroke="#000" stroke-opacity=".3" stroke-width="1.6"/>
    <rect x="86" y="122" width="28" height="18" fill="${p.ink}"/>${word(p.print || 'SD', 100, 135, 9, p.color)}`,
  bag: (p, v) => {
    if (p.slug.includes('sling')) return `
      <path d="M28 40 Q20 110 70 150" fill="none" stroke="#222" stroke-width="7"/><path d="M172 40 Q182 110 132 150" fill="none" stroke="#222" stroke-width="7"/>
      <rect x="28" y="40" width="144" height="7" rx="3" fill="#222"/><rect x="92" y="36" width="16" height="15" rx="2" fill="#111"/>
      ${fab('M50 112 Q46 92 70 90 L130 90 Q154 92 150 112 L148 150 Q100 166 52 150 Z', p.color, 'sdRip')}
      <path d="M54 104 Q100 96 146 104" stroke="#1b1b1b" stroke-width="2.4" fill="none"/><rect x="132" y="98" width="5" height="10" rx="1" fill="url(#sdMetal)"/>
      ${v === 1 ? '' : `<rect x="88" y="122" width="24" height="12" fill="${p.ink}"/>${word(p.print || 'SD', 100, 131, 7, p.color)}`}`;
    return `
      <path d="M44 92 Q100 4 156 92" fill="none" stroke="#202020" stroke-width="6"/>
      ${fab('M38 92 L162 92 L158 168 Q100 176 42 168 Z', p.color, 'sdRip')}
      <path d="M38 92 L162 92 L160 122 L40 122 Z" fill="#000" fill-opacity=".14"/>
      <path d="M44 102 Q100 96 156 102" stroke="#1b1b1b" stroke-width="2.2" fill="none"/>
      <rect x="86" y="136" width="28" height="12" fill="${p.ink}"/>${word(p.print || 'SD', 100, 145, 7, p.color)}`;
  },
  socks: (p) => [0, 1].map((i) => `
    <g transform="translate(${i * 46 - 22} ${i * 10})">
      ${fab('M60 18 L96 18 L96 120 Q96 160 66 166 L40 168 Q22 166 25 150 Q30 136 52 130 L60 120 Z', p.color, 'sdRib')}
      <rect x="60" y="18" width="36" height="16" fill="url(#sdRib)"/>
      <rect x="60" y="44" width="36" height="5" fill="${p.ink}"/><rect x="60" y="54" width="36" height="5" fill="${p.ink}"/>
      <path d="M40 168 Q22 166 25 150 Q32 152 44 158Z M96 120 Q96 150 80 160 Q86 138 84 124Z" fill="#000" fill-opacity=".12"/>
    </g>`).join(''),
  glasses: (p, v) => `
    <g transform="translate(0 ${v === 1 ? 6 : 0})">
    <ellipse cx="62" cy="100" rx="38" ry="25" fill="${p.color}"/><ellipse cx="138" cy="100" rx="38" ry="25" fill="${p.color}"/>
    <ellipse cx="62" cy="100" rx="31" ry="19" fill="url(#sdLens)"/><ellipse cx="138" cy="100" rx="31" ry="19" fill="url(#sdLens)"/>
    <path d="M46 90 Q56 84 70 86 M122 90 Q132 84 146 86" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M96 94 Q100 88 104 94" stroke="${p.color}" stroke-width="6" fill="none"/>
    <path d="M24 92 L4 86 M176 92 L196 86" stroke="${p.color}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="62" cy="100" rx="38" ry="25" fill="url(#sdS)"/><ellipse cx="138" cy="100" rx="38" ry="25" fill="url(#sdS)"/></g>`,
  chain: (p) => {
    const pts: string[] = [];
    for (let i = 0; i <= 26; i++) {
      const t = (i / 26) * Math.PI;
      const x = 100 - Math.cos(t) * 74, y = 30 + Math.sin(t) * 130;
      const ang = (Math.atan2(Math.cos(t) * 130, Math.sin(t) * 74) * 180) / Math.PI;
      pts.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="4.4" transform="rotate(${(90 - ang).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#sdMetal)" stroke="#555" stroke-width=".7"/>`);
    }
    return pts.join('') + `<rect x="92" y="156" width="16" height="10" rx="2" fill="url(#sdMetal)" stroke="#555" stroke-width=".7"/>${p.print ? word(p.print, 100, 163.5, 5, '#333') : ''}`;
  },
  keychain: (p) => `
    <path d="M86 20 Q60 20 62 52 L66 92 Q70 112 86 110 Q102 110 104 92 L108 52 Q110 20 86 20 Z" fill="none" stroke="${p.color}" stroke-width="7"/>
    <path d="M86 20 Q60 20 62 52 L66 92 Q70 112 86 110" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
    <rect x="98" y="40" width="5" height="22" fill="${p.color}" transform="rotate(8 100 50)"/>
    <circle cx="86" cy="122" r="10" fill="none" stroke="url(#sdMetal)" stroke-width="3"/>
    <g transform="rotate(-8 100 160)">${fab('M70 130 L130 130 L130 186 L70 186 Z', p.ink, 'sdRip')}${word(p.print || 'SD', 100, 166, 16, p.color)}</g>`,
  deck: (p, v) => v === 1 ? `
    <rect x="72" y="4" width="56" height="192" rx="28" fill="#1b1b1b"/><rect x="72" y="4" width="56" height="192" rx="28" fill="url(#sdMesh)"/>
    <rect x="80" y="40" width="40" height="14" fill="#3a3a3a"/><rect x="80" y="146" width="40" height="14" fill="#3a3a3a"/>` : `
    ${fab('M100 4 Q128 4 128 32 L128 168 Q128 196 100 196 Q72 196 72 168 L72 32 Q72 4 100 4Z', p.color)}
    <text transform="translate(108 100) rotate(-90)" text-anchor="middle" style="font-family:var(--display),Arial Black,sans-serif;font-weight:800;font-stretch:125%" font-size="${fit(p.print || 'STREET DREAMS', 26, 140)}" fill="${p.ink}">${esc(p.print || 'STREET DREAMS')}</text>
    ${[30, 42, 158, 170].map((y) => `<circle cx="${y < 100 ? 92 : 108}" cy="${y}" r="1.6" fill="#000" fill-opacity=".3"/><circle cx="${y < 100 ? 108 : 92}" cy="${y}" r="1.6" fill="#000" fill-opacity=".3"/>`).join('')}`,
};

/** view: 0 frente · 1 costas · 2 detalhe. bare = sem fundo (o container define a cor) */
export function art(input: ArtInput, view = 0, label = false, bare = false, uid = ''): string {
  const p: P = {
    slug: input.slug ?? '',
    type: input.type,
    color: safeColor(input.color),
    bg: safeColor(input.bg),
    ink: safeColor(input.ink),
    print: input.print ?? '',
  };
  const shape = (SHAPES[p.type] || SHAPES.tee)(p, view === 2 ? 0 : view);
  const g = view === 2 ? 'translate(-150 -60) scale(3.5)' : 'translate(25 68) scale(1.75)';
  const tag = label
    ? `<text x="20" y="480" font-family="Arial,sans-serif" font-size="12" fill="#000" opacity=".45">${['Frente', 'Costas', 'Detalhe'][view]}</text>`
    : '';
  const bg = bare ? '' : `<rect width="400" height="500" fill="url(#sdBg)"/>`;
  const svg = `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${DEFS}${bg}<g transform="${g}" filter="${view === 2 ? '' : 'url(#sdDs)'}">${shape}</g>${tag}</svg>`;
  // ids únicos por desenho: se o primeiro SVG da página estiver escondido (menu fechado), os outros continuam funcionando
  const u = uid.replace(/[^a-zA-Z0-9]/g, '');
  return u ? svg.replace(/(id="|url\(#)(sd[A-Za-z]+)/g, `$1$2${u}`) : svg;
}
