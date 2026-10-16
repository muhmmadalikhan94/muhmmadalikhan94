// Generates assets/batman-patrol.svg: Batman patrols your contribution graph.
// Usage: GITHUB_TOKEN=... node scripts/batman-patrol.mjs [username]
// No dependencies; needs Node 18+ for global fetch.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const USER = process.argv[2] || process.env.GITHUB_USER || 'muhmmadalikhan94';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.env.OUT || 'assets/batman-patrol.svg';
if (!TOKEN) { console.error('GITHUB_TOKEN is required'); process.exit(1); }

const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
  totalContributions weeks{contributionDays{date contributionCount contributionLevel weekday}}}}}}`;
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'batman-patrol' },
  body: JSON.stringify({ query, variables: { login: USER } })
});
const json = await res.json();
if (!res.ok || json.errors) { console.error(JSON.stringify(json.errors || json)); process.exit(1); }
const cal = json.data.user.contributionsCollection.contributionCalendar;

// ---------- layout ----------
const CELL = 12, GAP = 3, STEP = CELL + GAP;
const weeks = cal.weeks;
const LEFT = 44, TOP = 74;
const W = LEFT + weeks.length * STEP + 30, H = TOP + 7 * STEP + 56;
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const FILL = ['#17161f', '#3b310d', '#6e5810', '#b8920f', '#f5c518'];
const T = 14;          // seconds per loop
const SWEEP = 10;      // seconds Batman spends crossing the grid
const sweepPct = (SWEEP / T) * 100;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const r1 = n => Math.round(n * 10) / 10;

// month labels: one per month, at the first week that starts in it
const months = [];
let lastMonth = null;
weeks.forEach((wk, i) => {
  const d = new Date(wk.contributionDays[0].date + 'T00:00:00Z');
  const m = d.getUTCMonth();
  if (m !== lastMonth) {
    if (!(months.length && i - months[months.length - 1][0] < 3)) months.push([i, d.toLocaleString('en', { month: 'short', timeZone: 'UTC' })]);
    lastMonth = m;
  }
});
if (months.length > 1 && months[1][0] - months[0][0] < 3) months.shift();

// Batman crosses from x0 to x0 + span during SWEEP seconds; a cell lights when he is over it
const x0 = LEFT - 30, span = weeks.length * STEP + 60;
let cells = '', hits = '', pops = '';
weeks.forEach((wk, w) => {
  const delay = r1(((LEFT + w * STEP + CELL / 2 - x0) / span) * SWEEP);
  wk.contributionDays.forEach(day => {
    const x = LEFT + w * STEP, y = TOP + day.weekday * STEP;
    const lvl = LEVEL[day.contributionLevel] ?? 0;
    cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${FILL[lvl]}"><title>${esc(day.date)}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}</title></rect>`;
    hits += `<rect class="${lvl ? 'hit' : 'lit'}" style="animation-delay:${delay}s" x="${x - 1}" y="${y - 1}" width="${CELL + 2}" height="${CELL + 2}" rx="3"/>`;
    if (day.contributionCount > 0) pops += `<text class="pop" style="animation-delay:${delay}s" x="${x + CELL / 2}" y="${y - 3}">+${day.contributionCount}</text>`;
  });
});

// Batman's patrol path: a swooping line across the grid, then off-screen and back
const midY = TOP + 3 * STEP + CELL / 2;
const kf = [];
const N = 24;
for (let i = 0; i <= N; i++) {
  const p = i / N;
  const x = x0 + p * span;
  const y = midY + Math.sin(p * Math.PI * 5) * 3.2 * STEP;
  const tilt = Math.cos(p * Math.PI * 5) * -14;
  kf.push(`${r1(p * sweepPct)}%{transform:translate(${r1(x)}px,${r1(y)}px) rotate(${r1(tilt)}deg)}`);
}
kf.push(`${r1(sweepPct + 6)}%{transform:translate(${W + 60}px,${TOP - 60}px) rotate(-20deg) scale(.6)}`);
kf.push(`${r1(sweepPct + 6.01)}%{transform:translate(-80px,${TOP - 60}px) rotate(0deg) scale(.6)}`);
kf.push(`100%{transform:translate(${LEFT - 30}px,${midY}px) rotate(0deg) scale(1)}`);

const updated = new Date().toISOString().slice(0, 10);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Batman patrols ${esc(USER)}'s contribution graph: ${cal.totalContributions} contributions in the last year">
<style>
  .t{font:700 15px 'Segoe UI',Helvetica,Arial,sans-serif;fill:#f2f2f2;letter-spacing:.06em}
  .s{font:12px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#8b8697}
  .y{fill:#f5c518}
  .m{font:10px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#6f6a7c}
  .lit{fill:#f5c518;opacity:0;animation:lit ${T}s linear infinite}
  .hit{fill:none;stroke:#fff6c2;stroke-width:1.6;opacity:0;animation:hit ${T}s linear infinite}
  .pop{font:700 9px ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;fill:#f5c518;text-anchor:middle;opacity:0;animation:pop ${T}s ease-out infinite}
  @keyframes lit{0%{opacity:0}1%{opacity:.28}7%{opacity:0}100%{opacity:0}}
  @keyframes hit{0%{opacity:0}1%{opacity:1}9%{opacity:0}100%{opacity:0}}
  @keyframes pop{0%{opacity:0;transform:translateY(4px)}2%{opacity:1}10%{opacity:0;transform:translateY(-12px)}100%{opacity:0}}
  .bat{animation:patrol ${T}s linear infinite}
  @keyframes patrol{${kf.join('')}}
  .wings{transform-origin:0 0;animation:flap .32s ease-in-out infinite alternate}
  @keyframes flap{from{transform:scaleY(1)}to{transform:scaleY(.45)}}
  .beam{opacity:.5;animation:beam 3s ease-in-out infinite alternate}
  @keyframes beam{from{opacity:.35}to{opacity:.6}}
  @media (prefers-reduced-motion:reduce){.bat,.wings,.lit,.hit,.pop,.beam{animation:none}}
</style>
<defs>
  <radialGradient id="glow"><stop offset="0" stop-color="#f5c518" stop-opacity=".45"/><stop offset="1" stop-color="#f5c518" stop-opacity="0"/></radialGradient>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060c"/><stop offset="1" stop-color="#110d1c"/></linearGradient>
  <path id="batshape" d="M0-6c-1.6 0-2.3-1.6-2.7-3.4l-1.2 3.3c-3.8-.4-7-2.8-8.6-6.1-2.7 5.3-9 6.5-14.5 5.4 4.2 3.2 6.3 7.4 6.3 11.6 3.2-2 6.9-2 9.7.6 1.6-3.2 5.3-3.7 7.4-.6 1.2 2.2 2.4 5.3 3.6 8.4 1.2-3.1 2.4-6.2 3.6-8.4 2.1-3.1 5.8-2.6 7.4.6 2.8-2.6 6.5-2.6 9.7-.6 0-4.2 2.1-8.4 6.3-11.6-5.5 1.1-11.8-.1-14.5-5.4-1.6 3.3-4.8 5.7-8.6 6.1l-1.2-3.3C2.3-7.6 1.6-6 0-6z"/>
</defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)"/>
<text class="t" x="${LEFT}" y="34">GOTHAM PATROL LOG</text>
<text class="s" x="${LEFT}" y="52"><tspan class="y">${cal.totalContributions}</tspan> contributions in the last year · <tspan class="y">@${esc(USER)}</tspan></text>
${months.map(([i, n]) => `<text class="m" x="${LEFT + i * STEP}" y="${TOP - 8}">${n}</text>`).join('')}
<text class="m" x="${LEFT - 30}" y="${TOP + 1 * STEP + 9}">Mon</text>
<text class="m" x="${LEFT - 30}" y="${TOP + 3 * STEP + 9}">Wed</text>
<text class="m" x="${LEFT - 30}" y="${TOP + 5 * STEP + 9}">Fri</text>
<g>${cells}</g>
<g>${hits}</g>
<g>${pops}</g>
<g class="bat">
  <circle class="beam" r="46" fill="url(#glow)"/>
  <g class="wings"><use href="#batshape" fill="#0b0a10" stroke="#f5c518" stroke-width="1.2" transform="scale(1.05)"/></g>
</g>
<text class="m" x="${LEFT}" y="${H - 18}">updated ${updated}</text>
<g transform="translate(${W - 30 - 5 * STEP - 70},${H - 28})">
  <text class="m" x="0" y="10">Less</text>
  ${FILL.map((f, i) => `<rect x="${32 + i * STEP}" y="0" width="${CELL}" height="${CELL}" rx="2.5" fill="${f}"/>`).join('')}
  <text class="m" x="${36 + 5 * STEP}" y="10">More</text>
</g>
</svg>
`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT}: ${cal.totalContributions} contributions, ${weeks.length} weeks`);
