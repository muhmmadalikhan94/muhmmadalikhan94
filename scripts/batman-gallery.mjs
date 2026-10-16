// Generates four animated Batman scene cards (original artwork) into assets/.
// Usage: node scripts/batman-gallery.mjs   (no dependencies, deterministic output)
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 300, H = 380;
const r1 = n => Math.round(n * 10) / 10;
const rng = s => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const BAT = 'M0-6c-1.6 0-2.3-1.6-2.7-3.4l-1.2 3.3c-3.8-.4-7-2.8-8.6-6.1-2.7 5.3-9 6.5-14.5 5.4 4.2 3.2 6.3 7.4 6.3 11.6 3.2-2 6.9-2 9.7.6 1.6-3.2 5.3-3.7 7.4-.6 1.2 2.2 2.4 5.3 3.6 8.4 1.2-3.1 2.4-6.2 3.6-8.4 2.1-3.1 5.8-2.6 7.4.6 2.8-2.6 6.5-2.6 9.7-.6 0-4.2 2.1-8.4 6.3-11.6-5.5 1.1-11.8-.1-14.5-5.4-1.6 3.3-4.8 5.7-8.6 6.1l-1.2-3.3C2.3-7.6 1.6-6 0-6z';
// Batman standing with his cape spread, head at (150,150), cape bottom at (150,312)
const CAPE = 'M141 174L137 138 145 154H155L163 138 159 174Q161 178 168 180Q222 172 266 196Q252 222 250 252 236 238 220 240 214 262 214 286 198 270 182 274 168 290 150 312 132 290 118 274 102 270 86 286 86 262 80 240 64 238 50 252 48 222 34 196Q78 172 132 180Q139 178 141 174Z';

const rain = (seed, n = 34, op = .18) => {
  const r = rng(seed); let out = '';
  for (let i = 0; i < n; i++) {
    const x = r1(r() * (W + 80)), y = r1(-20 - r() * 30);
    out += `<line style="animation-delay:-${r1(r() * 1.2)}s;animation-duration:${r1(.7 + r() * .5)}s" x1="${x}" y1="${y}" x2="${r1(x - 4)}" y2="${r1(y + 14)}"/>`;
  }
  return `<g class="rain" style="opacity:${op}">${out}</g>`;
};
const skyline = (seed, top = 300, fill = '#07060b') => {
  const r = rng(seed); let out = '';
  for (let x = -6; x < W + 10;) {
    const w = 22 + r() * 34, h = 20 + r() * (H - top);
    out += `<rect x="${r1(x)}" y="${r1(H - h)}" width="${r1(w)}" height="${r1(h)}"/>`;
    x += w - 2;
  }
  return `<g fill="${fill}">${out}</g>`;
};

const card = (file, title, num, defs, body, css) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}: animated Batman illustration">
<style>
  .rain line{stroke:#cfc6e6;stroke-width:1;animation:rain 1s linear infinite}
  @keyframes rain{to{transform:translate(-60px,${H + 40}px)}}
  .flash{fill:#fff;opacity:0;animation:flash 7s linear infinite}
  @keyframes flash{0%,62%,68%,100%{opacity:0}63%{opacity:.55}64%{opacity:.05}65.5%{opacity:.35}}
  .cap{font:700 12px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;letter-spacing:3px;fill:#f5c518}
  .num{font:11px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#6f6884;letter-spacing:1px}
  .flap{animation:flap .22s ease-in-out infinite alternate}
  @keyframes flap{from{transform:scaleY(1)}to{transform:scaleY(.35)}}
  ${css}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <radialGradient id="moon"><stop offset="0" stop-color="#fff7d6"/><stop offset=".62" stop-color="#f6db7a"/><stop offset=".8" stop-color="#d9ad16" stop-opacity=".9"/><stop offset="1" stop-color="#d9ad16" stop-opacity="0"/></radialGradient>
  <path id="bat" d="${BAT}"/>
  <path id="cape" d="${CAPE}"/>
  ${defs}
</defs>
<g clip-path="url(#c)">
${body}
  <rect class="flash" width="${W}" height="${H}"/>
  <rect y="${H - 46}" width="${W}" height="46" fill="#0b0a10" opacity=".9"/>
  <text class="cap" x="20" y="${H - 18}">${title}</text>
  <text class="num" x="${W - 20}" y="${H - 18}" text-anchor="end">${num}</text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="#f5c518" stroke-opacity=".28"/>
</svg>
`;
  writeFileSync(`assets/${file}`, svg);
  console.log('wrote', file, svg.length, 'bytes');
};

mkdirSync('assets', { recursive: true });

// 1. The Cowl: backlit bust, blinking eyes, lightning
card('bat-cowl.svg', 'THE COWL', '01',
  `<linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0812"/><stop offset="1" stop-color="#1c1430"/></linearGradient>`,
  `<rect width="${W}" height="${H}" fill="url(#s1)"/>
  <circle cx="150" cy="150" r="118" fill="url(#moon)" class="glow"/>
  <g class="drift" fill="#140f22" opacity=".55"><ellipse cx="90" cy="120" rx="90" ry="9"/><ellipse cx="230" cy="176" rx="80" ry="7"/></g>
  <g fill="#050408">
    <path d="M114 120L121 60 136 100Q150 96 164 100L179 60 186 120Q190 140 188 162 186 186 172 200L150 214 128 200Q114 186 112 162 110 140 114 120Z"/>
    <path d="M126 198Q150 222 174 198L214 218Q250 232 262 270L276 ${H}H24L38 270Q50 232 86 218Z"/>
  </g>
  <use href="#bat" fill="#1d1729" transform="translate(150 286) scale(1.7)"/>
  <g class="eyes" fill="#fbf6e6"><path d="M127 151L142 146 144 153 130 156Z"/><path d="M173 151L158 146 156 153 170 156Z"/></g>
  ${rain(11)}`,
  `.eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 4.5s infinite}
  @keyframes blink{0%,90%,96%,100%{transform:scaleY(1)}93%{transform:scaleY(.08)}}
  .glow{animation:glow 5s ease-in-out infinite alternate}
  @keyframes glow{from{opacity:.85}to{opacity:1}}
  .drift{animation:drift 14s linear infinite alternate}
  @keyframes drift{from{transform:translateX(-20px)}to{transform:translateX(24px)}}`);

// 2. The Watch: cape spread on a rooftop ledge, wind and lightning
let wind = '';
{ const r = rng(5); for (let i = 0; i < 9; i++) { const x = r1(W + r() * 60), y = r1(60 + r() * 220); wind += `<line style="animation-delay:-${r1(r() * 2)}s" x1="${x}" y1="${y}" x2="${r1(x + 26 + r() * 40)}" y2="${y}"/>`; } }
card('bat-rooftop.svg', 'THE WATCH', '02',
  `<linearGradient id="s2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060d"/><stop offset=".7" stop-color="#1a1230"/><stop offset="1" stop-color="#2a1b3f"/></linearGradient>`,
  `<rect width="${W}" height="${H}" fill="url(#s2)"/>
  <circle cx="230" cy="82" r="52" fill="url(#moon)"/>
  ${skyline(8, 250, '#110d1c')}
  <g class="wind">${wind}</g>
  <g class="cape"><use href="#cape" fill="#050408"/></g>
  <rect x="88" y="312" width="124" height="9" fill="#0d0b14"/>
  <rect x="98" y="320" width="104" height="${H}" fill="#08070c"/>
  <path d="M206 312l10-10 6 4-4 6z" fill="#0d0b14"/>
  ${rain(23, 40, .2)}`,
  `.cape{transform-origin:150px 178px;animation:cape 2.4s ease-in-out infinite alternate}
  @keyframes cape{from{transform:scale(.93,.98)}to{transform:scale(1.04,1.02) rotate(-1deg)}}
  .wind line{stroke:#d9d0ee;stroke-width:1;opacity:.22;animation:wind 1.6s linear infinite}
  @keyframes wind{to{transform:translateX(-${W + 120}px)}}`);

// 3. The Swing: grapple line pendulum across a big moon
card('bat-grapple.svg', 'THE SWING', '03',
  `<linearGradient id="s3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0816"/><stop offset="1" stop-color="#241a3c"/></linearGradient>`,
  `<rect width="${W}" height="${H}" fill="url(#s3)"/>
  <circle cx="160" cy="150" r="104" fill="url(#moon)"/>
  ${skyline(31, 230, '#0e0b18')}
  ${skyline(47, 300, '#060509')}
  <g class="swing">
    <line x1="150" y1="-40" x2="150" y2="214" stroke="#d8d0ea" stroke-width="1.3"/>
    <g class="sway"><use href="#cape" fill="#050408" transform="translate(150 212) scale(.42) translate(-150 -150)"/></g>
  </g>
  ${rain(37, 30, .16)}`,
  `.swing{transform-origin:150px -40px;animation:swing 2.6s cubic-bezier(.45,0,.55,1) infinite alternate}
  @keyframes swing{from{transform:rotate(22deg)}to{transform:rotate(-22deg)}}
  .sway{transform-origin:150px 212px;animation:sway 2.6s cubic-bezier(.45,0,.55,1) infinite alternate}
  @keyframes sway{from{transform:rotate(-14deg) scaleX(.9)}to{transform:rotate(14deg) scaleX(1.05)}}`);

// 4. The Swarm: bats burst out of a cave mouth toward the viewer
let bats = '', batCss = '';
{ const r = rng(77);
  for (let i = 0; i < 18; i++) {
    const ang = -Math.PI * (.08 + r() * .84), dist = 260 + r() * 140;
    const ex = r1(150 + Math.cos(ang) * dist), ey = r1(318 + Math.sin(ang) * dist);
    const dur = r1(2.2 + r() * 1.8), del = r1(r() * dur), s = r1(.9 + r() * .9);
    bats += `<g class="sw${i}" style="animation-delay:-${del}s"><g class="flap" style="animation-duration:${r1(.16 + r() * .12)}s"><use href="#bat" fill="#07050b"/></g></g>`;
    batCss += `.sw${i}{opacity:0;animation:sw${i} ${dur}s cubic-bezier(.5,0,.9,.6) infinite}@keyframes sw${i}{0%{opacity:0;transform:translate(150px,318px) scale(.08)}12%{opacity:1}100%{opacity:1;transform:translate(${ex}px,${ey}px) scale(${s})}}`;
  } }
card('bat-swarm.svg', 'THE SWARM', '04',
  `<linearGradient id="s4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1330"/><stop offset=".6" stop-color="#3b2a5c"/><stop offset="1" stop-color="#5b3a62"/></linearGradient>
  <radialGradient id="mouth"><stop offset="0" stop-color="#f5c518" stop-opacity=".45"/><stop offset="1" stop-color="#f5c518" stop-opacity="0"/></radialGradient>`,
  `<rect width="${W}" height="${H}" fill="url(#s4)"/>
  <circle cx="150" cy="140" r="112" fill="url(#moon)" opacity=".9"/>
  <path d="M-10 ${H}V300Q30 250 60 262 90 228 150 232 214 226 244 262 274 250 310 296V${H}Z" fill="#0a0710"/>
  <path d="M84 ${H}Q86 300 150 292 214 300 216 ${H}Z" fill="#020103"/>
  <ellipse cx="150" cy="322" rx="56" ry="26" fill="url(#mouth)"/>
  ${bats}`,
  batCss);
