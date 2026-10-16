// Generates assets/gotham-header.svg: a rainy Gotham skyline with a sweeping bat-signal.
// Usage: node scripts/gotham-header.mjs   (no dependencies, deterministic output)
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 1000, H = 320;
let seed = 94;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const between = (a, b) => a + rnd() * (b - a);
const r1 = n => Math.round(n * 10) / 10;

const BAT = 'M0-6c-1.6 0-2.3-1.6-2.7-3.4l-1.2 3.3c-3.8-.4-7-2.8-8.6-6.1-2.7 5.3-9 6.5-14.5 5.4 4.2 3.2 6.3 7.4 6.3 11.6 3.2-2 6.9-2 9.7.6 1.6-3.2 5.3-3.7 7.4-.6 1.2 2.2 2.4 5.3 3.6 8.4 1.2-3.1 2.4-6.2 3.6-8.4 2.1-3.1 5.8-2.6 7.4.6 2.8-2.6 6.5-2.6 9.7-.6 0-4.2 2.1-8.4 6.3-11.6-5.5 1.1-11.8-.1-14.5-5.4-1.6 3.3-4.8 5.7-8.6 6.1l-1.2-3.3C2.3-7.6 1.6-6 0-6z';

// stars
let stars = '';
for (let i = 0; i < 46; i++) {
  const tw = rnd() < .35;
  stars += `<circle${tw ? ` class="tw" style="animation-delay:${r1(between(0, 4))}s"` : ''} cx="${r1(between(0, W))}" cy="${r1(between(6, 170))}" r="${r1(between(.4, 1.3))}" fill="#e9e4f5" opacity="${r1(between(.25, .7))}"/>`;
}

// skyline: back layer, then front layer with windows
const SPOT_X = 835, SPOT_TOP = 236;
let back = '', front = '', windows = '';
for (let x = -10; x < W + 20;) {
  const w = between(34, 74), maxH = x < 560 ? 105 : 165;
  const h = between(55, maxH);
  back += `<rect x="${r1(x)}" y="${r1(H - h)}" width="${r1(w)}" height="${r1(h)}"/>`;
  if (rnd() < .3) back += `<rect x="${r1(x + w / 2 - 2)}" y="${r1(H - h - between(10, 26))}" width="3" height="30"/>`;
  x += w + between(-6, 4);
}
for (let x = -10; x < W + 20;) {
  let w = between(30, 66), h = between(30, x < 560 ? 88 : 110);
  if (x < SPOT_X - 20 && x + w > SPOT_X - 40) { w = 80; h = H - SPOT_TOP; x = SPOT_X - 40; }
  front += `<rect x="${r1(x)}" y="${r1(H - h)}" width="${r1(w)}" height="${r1(h)}"/>`;
  if (rnd() < .22 && x !== SPOT_X - 40) front += `<path d="M${r1(x)} ${r1(H - h)}L${r1(x + w / 2)} ${r1(H - h - between(12, 30))}L${r1(x + w)} ${r1(H - h)}z"/>`;
  for (let wy = H - h + 8; wy < H - 6; wy += 11) for (let wx = x + 6; wx < x + w - 6; wx += 9) {
    if (rnd() < .13) {
      const tw = rnd() < .3;
      windows += `<rect${tw ? ` class="win" style="animation-delay:${r1(between(0, 7))}s;animation-duration:${r1(between(4, 9))}s"` : ''} x="${r1(wx)}" y="${r1(wy)}" width="3.2" height="5" opacity="${r1(between(.45, .9))}"/>`;
    }
  }
  x += w + between(-4, 3);
}

// rain
let rain = '';
for (let i = 0; i < 70; i++) {
  const x = r1(between(0, W + 120)), y = r1(between(-40, -10));
  rain += `<line style="animation-delay:-${r1(between(0, 1.4))}s;animation-duration:${r1(between(.8, 1.3))}s" x1="${x}" y1="${y}" x2="${r1(x - 5)}" y2="${r1(y + 16)}"/>`;
}

// signal geometry
const SX = 690, SY = 92;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Muhammad Ali Khan, Associate Software Engineer. A rainy Gotham skyline with a bat-signal in the sky.">
<style>
  .name{font:400 56px Impact,'Haettenschweiler','Arial Narrow Bold','Arial Black',sans-serif;fill:#f3f1f7;letter-spacing:2px}
  .sub{font:700 14px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#f5c518;letter-spacing:3px}
  .tag{font:14px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#9a93ab;letter-spacing:.5px}
  .tiny{font:11px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#5f5872;letter-spacing:2px}
  .reveal{transform-origin:40px 0;transform:scaleX(0);animation:reveal 1.5s cubic-bezier(.7,0,.2,1) .3s forwards}
  @keyframes reveal{to{transform:scaleX(1)}}
  .fade{opacity:0;animation:fade 1s ease-out forwards}
  @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .sweep{transform-origin:${SPOT_X}px ${SPOT_TOP}px;animation:sweep 7s ease-in-out infinite alternate}
  @keyframes sweep{from{transform:rotate(-7deg)}to{transform:rotate(5deg)}}
  .signal{animation:flicker 9s steps(1) infinite}
  @keyframes flicker{0%,61%,63%,100%{opacity:1}62%{opacity:.55}}
  .tw{animation:tw 3.5s ease-in-out infinite alternate}
  @keyframes tw{from{opacity:.15}to{opacity:.85}}
  .win{animation:win 6s steps(1) infinite}
  @keyframes win{0%,70%{opacity:.85}71%,100%{opacity:.08}}
  .rain line{stroke:#b9b0d6;stroke-width:1;opacity:.16;animation:rain 1s linear infinite}
  @keyframes rain{from{transform:translate(0,0)}to{transform:translate(-110px,${H + 60}px)}}
  .cloud{animation:drift 40s linear infinite alternate}
  @keyframes drift{from{transform:translateX(-30px)}to{transform:translateX(40px)}}
  .b{fill:#241d36}
  .f1{animation:f1 13s linear infinite}
  .f2{animation:f2 17s linear infinite 4s}
  .f3{animation:f3 11s linear infinite 8s}
  @keyframes f1{0%{transform:translate(1060px,60px) scale(.55)}30%{transform:translate(760px,110px) scale(.55)}60%{transform:translate(420px,70px) scale(.55)}100%{transform:translate(-60px,120px) scale(.55)}}
  @keyframes f2{0%{transform:translate(1060px,150px) scale(.4)}50%{transform:translate(560px,40px) scale(.4)}100%{transform:translate(-60px,90px) scale(.4)}}
  @keyframes f3{0%{transform:translate(1060px,30px) scale(.7)}45%{transform:translate(640px,95px) scale(.7)}100%{transform:translate(-80px,50px) scale(.7)}}
  .flap{animation:flap .28s ease-in-out infinite alternate}
  @keyframes flap{from{transform:scaleY(1)}to{transform:scaleY(.35)}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}.reveal{transform:none}.fade{opacity:1}}
</style>
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05040a"/><stop offset=".65" stop-color="#110c1e"/><stop offset="1" stop-color="#1e1533"/></linearGradient>
  <linearGradient id="beam" gradientUnits="userSpaceOnUse" x1="${SPOT_X}" y1="${SPOT_TOP}" x2="${SX}" y2="${SY}"><stop offset="0" stop-color="#f5c518" stop-opacity=".55"/><stop offset="1" stop-color="#f5c518" stop-opacity=".1"/></linearGradient>
  <radialGradient id="disc"><stop offset="0" stop-color="#ffe066" stop-opacity=".95"/><stop offset=".7" stop-color="#f5c518" stop-opacity=".75"/><stop offset="1" stop-color="#f5c518" stop-opacity=".25"/></radialGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="#f5c518" stop-opacity=".35"/><stop offset="1" stop-color="#f5c518" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="blur2"><feGaussianBlur stdDeviation="1.4"/></filter>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <path id="bat" d="${BAT}"/>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g>${stars}</g>
  <g class="cloud" fill="#1c1530" filter="url(#soft)" opacity=".8"><ellipse cx="300" cy="60" rx="180" ry="26"/><ellipse cx="880" cy="40" rx="160" ry="22"/></g>

  <g class="cloud" fill="#140f22" filter="url(#soft)" opacity=".55" style="animation-duration:55s"><ellipse cx="640" cy="130" rx="150" ry="18"/></g>

  <g class="f1"><g class="flap"><use href="#bat" class="b"/></g></g>
  <g class="f2"><g class="flap" style="animation-duration:.24s"><use href="#bat" class="b"/></g></g>
  <g class="f3"><g class="flap" style="animation-duration:.31s"><use href="#bat" class="b"/></g></g>

  <g fill="#120e1c">${back}</g>
  <g class="sweep">
    <polygon points="${SPOT_X - 6},${SPOT_TOP} ${SPOT_X + 6},${SPOT_TOP} ${SX + 58},${SY - 46} ${SX - 50},${SY + 54}" fill="url(#beam)" filter="url(#blur2)"/>
    <g class="signal">
      <ellipse cx="${SX}" cy="${SY}" rx="150" ry="100" fill="url(#halo)"/>
      <ellipse cx="${SX}" cy="${SY}" rx="94" ry="56" fill="url(#disc)" transform="rotate(-8 ${SX} ${SY})"/>
      <use href="#bat" fill="#0b0912" transform="translate(${SX} ${SY + 2}) rotate(-8) scale(2.45)"/>
    </g>
  </g>
  <g fill="#08070d">${front}</g>
  <g fill="#f5c518">${windows}</g>
  <rect x="${SPOT_X - 9}" y="${SPOT_TOP - 7}" width="18" height="9" rx="2" fill="#2b2440"/>
  <circle cx="${SPOT_X}" cy="${SPOT_TOP - 7}" r="6" fill="#fff4c4"/>
  <circle cx="${SPOT_X}" cy="${SPOT_TOP - 7}" r="16" fill="url(#halo)"/>
  <g class="rain">${rain}</g>

  <text class="tiny fade" x="44" y="62" style="animation-delay:.1s">// GOTHAM · ISLAMABAD · ${new Date().getFullYear()}</text>
  <g class="reveal"><text class="name" x="40" y="132">MUHAMMAD ALI KHAN</text></g>
  <text class="sub fade" x="44" y="166" style="animation-delay:1.3s">ASSOCIATE SOFTWARE ENGINEER</text>
  <text class="tag fade" x="44" y="192" style="animation-delay:1.6s">Data &amp; Integrations · HL7 → JSON · APIs · AI</text>
</g>
</svg>
`;
mkdirSync('assets', { recursive: true });
writeFileSync('assets/gotham-header.svg', svg);
console.log('wrote assets/gotham-header.svg', svg.length, 'bytes');
