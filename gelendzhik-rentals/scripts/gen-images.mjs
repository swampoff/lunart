/**
 * Генерирует SVG-иллюстрации: общие виды дома и интерьеры апартаментов.
 *
 * Это заглушки. Когда появятся настоящие фотографии, положите их в public/images
 * под теми же именами (house-1…4 и <slug>-1…4) — остальной код менять не нужно.
 *
 * Запуск: npm run images
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/images');
mkdirSync(outDir, { recursive: true });

/** Палитры под разное время суток: день, закат, утро, вечер. */
const PALETTES = [
  { sky: ['#cfe9f1', '#8fc9dd', '#4a9cbe'], sun: '#ffffff', sea: ['#1c6f8f', '#3f9bb8'], land: '#134b60' },
  { sky: ['#f7b267', '#f4845f', '#c75c6a'], sun: '#fff1c9', sea: ['#5c3a58', '#8a5a72'], land: '#3b2440' },
  { sky: ['#0b3d5c', '#2e7ea8', '#7fc2d9'], sun: '#ffd98e', sea: ['#0a3348', '#155975'], land: '#0d2c3d' },
  { sky: ['#20304f', '#3b5a80', '#6d8fb0'], sun: '#ffe6a7', sea: ['#101f33', '#22405e'], land: '#0a1725' },
];

/** Тёплая палитра интерьеров — общая для всех апартаментов, чтобы дом читался как один. */
const ROOM = {
  wall: '#f2ece3',
  wallDark: '#e6dccd',
  floor: '#d8c3a5',
  wood: '#a9764c',
  woodDark: '#7d5533',
  textile: '#e8ded0',
  accent: '#2f7f96',
  accentSoft: '#bcdde6',
  green: '#3d8557',
  white: '#ffffff',
};

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

function mountains(seed, color, baseY, opacity) {
  const points = [];
  const peaks = 5 + (seed % 3);
  for (let i = 0; i <= peaks; i += 1) {
    const x = (1200 / peaks) * i;
    const wave = Math.sin((seed % 17) + i * 1.7) * 60;
    points.push(`${x.toFixed(0)},${(baseY - 70 - wave).toFixed(0)}`);
  }
  return `<polygon points="0,800 ${points.join(' ')} 1200,800" fill="${color}" opacity="${opacity}"/>`;
}

/** Окно с видом на море — повторяется в интерьерных сценах. */
function window(x, y, w, h, palette) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#sky)"/>
    <rect x="${x}" y="${y + h * 0.62}" width="${w}" height="${h * 0.38}" fill="url(#sea)"/>
    <circle cx="${x + w * 0.68}" cy="${y + h * 0.3}" r="${h * 0.11}" fill="${palette.sun}" opacity="0.9"/>
    <rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="${ROOM.white}"/>
    <rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="12" fill="none" stroke="${ROOM.wallDark}" stroke-width="12"/>`;
}

/* ─────────────── Общие виды дома ─────────────── */

/** Фасад: трёхэтажный дом с балконами, забором и дорожкой. */
function facade(seed, palette) {
  const windows = [];
  for (let floor = 0; floor < 3; floor += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = 400 + col * 110;
      const y = 250 + floor * 130;
      windows.push(
        `<rect x="${x}" y="${y}" width="70" height="86" rx="6" fill="${palette.sky[2]}" opacity="0.75"/>
         <rect x="${x + 32}" y="${y}" width="6" height="86" fill="${ROOM.white}" opacity="0.8"/>`,
      );
    }
  }
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="${180 + (seed % 200)}" cy="150" r="60" fill="${palette.sun}" opacity="0.85"/>
    ${mountains(seed, palette.land, 380, 0.35)}
    <rect y="600" width="1200" height="200" fill="#cfc3ab"/>
    <polygon points="330,240 800,140 1270,240" fill="${ROOM.woodDark}"/>
    <rect x="360" y="240" width="880" height="420" fill="${ROOM.wall}"/>
    <rect x="360" y="240" width="880" height="420" fill="none" stroke="${ROOM.wallDark}" stroke-width="6"/>
    ${windows.join('\n    ')}
    <rect x="360" y="366" width="880" height="10" fill="${ROOM.wallDark}" opacity="0.6"/>
    <rect x="360" y="496" width="880" height="10" fill="${ROOM.wallDark}" opacity="0.6"/>
    <g>
      <rect x="880" y="496" width="300" height="12" fill="${ROOM.wallDark}"/>
      <rect x="880" y="508" width="300" height="10" rx="5" fill="${ROOM.white}"/>
      ${Array.from({ length: 11 }, (_, i) => `<rect x="${890 + i * 28}" y="${508}" width="6" height="52" fill="${ROOM.white}" opacity="0.9"/>`).join('')}
      <rect x="880" y="556" width="300" height="10" rx="5" fill="${ROOM.white}"/>
    </g>
    <rect x="180" y="520" width="180" height="140" rx="10" fill="${ROOM.wallDark}"/>
    <rect x="230" y="560" width="80" height="100" rx="6" fill="${ROOM.wood}"/>
    <ellipse cx="120" cy="520" rx="110" ry="130" fill="${ROOM.green}" opacity="0.9"/>
    <rect x="106" y="600" width="26" height="120" fill="${ROOM.woodDark}"/>
    <ellipse cx="1150" cy="540" rx="90" ry="110" fill="${ROOM.green}" opacity="0.8"/>
    <path d="M420 800 L520 660 L700 660 L760 800 Z" fill="#e5dbc6"/>`;
}

/** Двор с бассейном, шезлонгами и зонтом. */
function pool(seed, palette) {
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <rect y="300" width="1200" height="500" fill="#d9cfb8"/>
    <rect x="300" y="120" width="900" height="220" fill="${ROOM.wall}"/>
    <rect x="360" y="170" width="110" height="120" rx="8" fill="${palette.sky[2]}" opacity="0.7"/>
    <rect x="540" y="170" width="110" height="120" rx="8" fill="${palette.sky[2]}" opacity="0.7"/>
    <rect x="720" y="170" width="110" height="120" rx="8" fill="${palette.sky[2]}" opacity="0.7"/>
    <rect x="180" y="430" width="840" height="290" rx="24" fill="#2f9dbd"/>
    <rect x="210" y="460" width="780" height="230" rx="18" fill="#4fc0dc"/>
    <g fill="${ROOM.white}" opacity="0.35">
      <rect x="260" y="520" width="240" height="8" rx="4"/>
      <rect x="420" y="580" width="300" height="8" rx="4"/>
      <rect x="600" y="640" width="260" height="8" rx="4"/>
    </g>
    <g>
      <rect x="1040" y="470" width="130" height="24" rx="12" fill="${ROOM.white}"/>
      <rect x="1050" y="494" width="14" height="60" fill="${ROOM.white}" opacity="0.8"/>
      <rect x="1146" y="494" width="14" height="60" fill="${ROOM.white}" opacity="0.8"/>
      <rect x="1040" y="600" width="130" height="24" rx="12" fill="${ROOM.white}"/>
      <rect x="1050" y="624" width="14" height="60" fill="${ROOM.white}" opacity="0.8"/>
      <rect x="1146" y="624" width="14" height="60" fill="${ROOM.white}" opacity="0.8"/>
    </g>
    <rect x="60" y="360" width="16" height="340" fill="${ROOM.woodDark}"/>
    <path d="M-20 380 L160 380 L68 300 Z" fill="#e2703a"/>
    <ellipse cx="${900 + (seed % 100)}" cy="360" rx="80" ry="50" fill="${ROOM.green}" opacity="0.85"/>`;
}

/** Беседка с мангалом и виноградом. */
function gazebo(seed, palette) {
  const vines = Array.from(
    { length: 7 },
    (_, i) => `<circle cx="${300 + i * 100}" cy="${240 + (i % 3) * 18}" r="42" fill="${ROOM.green}" opacity="0.85"/>`,
  ).join('\n    ');
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <rect y="560" width="1200" height="240" fill="#cfc3ab"/>
    ${mountains(seed, palette.land, 420, 0.3)}
    <polygon points="230,260 700,150 1170,260" fill="${ROOM.woodDark}"/>
    ${vines}
    <rect x="260" y="260" width="26" height="360" fill="${ROOM.wood}"/>
    <rect x="1110" y="260" width="26" height="360" fill="${ROOM.wood}"/>
    <rect x="560" y="440" width="360" height="20" rx="10" fill="${ROOM.wood}"/>
    <rect x="600" y="460" width="20" height="120" fill="${ROOM.woodDark}"/>
    <rect x="860" y="460" width="20" height="120" fill="${ROOM.woodDark}"/>
    <g fill="${ROOM.wood}">
      <rect x="520" y="500" width="70" height="16" rx="8"/>
      <rect x="890" y="500" width="70" height="16" rx="8"/>
    </g>
    <rect x="300" y="450" width="150" height="24" rx="6" fill="#4c4c4c"/>
    <rect x="320" y="474" width="16" height="110" fill="#4c4c4c"/>
    <rect x="414" y="474" width="16" height="110" fill="#4c4c4c"/>
    <g fill="#e2703a" opacity="0.9">
      <circle cx="345" cy="440" r="10"/>
      <circle cx="375" cy="432" r="13"/>
      <circle cx="405" cy="442" r="9"/>
    </g>
    <ellipse cx="1050" cy="600" rx="90" ry="40" fill="${ROOM.green}" opacity="0.8"/>`;
}

/** Вид на бухту — как с балкона верхних апартаментов. */
function seaView(seed, palette) {
  const sunX = 300 + (seed % 500);
  const glare = Array.from({ length: 9 }, (_, i) => {
    const width = 150 - i * 12;
    return `<rect x="${(sunX - width / 2).toFixed(0)}" y="${520 + i * 30}" width="${width}" height="6" rx="3"/>`;
  }).join('\n      ');
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="${sunX}" cy="250" r="70" fill="${palette.sun}" opacity="0.9"/>
    <circle cx="${sunX}" cy="250" r="130" fill="${palette.sun}" opacity="0.18"/>
    ${mountains(seed, palette.land, 470, 0.55)}
    ${mountains(seed + 7, palette.land, 500, 0.85)}
    <rect y="500" width="1200" height="300" fill="url(#sea)"/>
    <g fill="${palette.sun}" opacity="0.3">
      ${glare}
    </g>`;
}

/* ─────────────── Интерьеры апартаментов ─────────────── */

/** Спальня: кровать, тумбы, лампы, окно. */
function bedroom(seed, palette) {
  return `
    <rect width="1200" height="800" fill="${ROOM.wall}"/>
    <rect y="600" width="1200" height="200" fill="${ROOM.floor}"/>
    ${window(760, 120, 340, 300, palette)}
    <rect x="150" y="300" width="480" height="60" rx="12" fill="${ROOM.woodDark}"/>
    <rect x="170" y="440" width="440" height="180" rx="14" fill="${ROOM.textile}"/>
    <rect x="170" y="420" width="440" height="40" rx="14" fill="${ROOM.white}"/>
    <rect x="200" y="380" width="160" height="60" rx="14" fill="${ROOM.white}"/>
    <rect x="410" y="380" width="160" height="60" rx="14" fill="${ROOM.white}"/>
    <rect x="170" y="520" width="440" height="100" rx="12" fill="${ROOM.accentSoft}"/>
    <rect x="60" y="470" width="90" height="150" rx="10" fill="${ROOM.wood}"/>
    <rect x="630" y="470" width="90" height="150" rx="10" fill="${ROOM.wood}"/>
    <circle cx="105" cy="440" r="30" fill="${palette.sun}" opacity="0.95"/>
    <circle cx="675" cy="440" r="30" fill="${palette.sun}" opacity="0.95"/>
    <rect x="820" y="560" width="220" height="60" rx="10" fill="${ROOM.wood}" opacity="0.6"/>
    <ellipse cx="${900 + (seed % 60)}" cy="530" rx="46" ry="56" fill="${ROOM.green}" opacity="0.85"/>`;
}

/** Кухня-гостиная: гарнитур, остров, стулья. */
function kitchen(seed, palette) {
  const handles = Array.from(
    { length: 5 },
    (_, i) => `<rect x="${132 + i * 110}" y="374" width="56" height="8" rx="4" fill="${ROOM.woodDark}"/>`,
  ).join('\n    ');
  return `
    <rect width="1200" height="800" fill="${ROOM.wall}"/>
    <rect y="620" width="1200" height="180" fill="${ROOM.floor}"/>
    <rect x="100" y="180" width="620" height="200" rx="10" fill="${ROOM.wood}"/>
    ${handles}
    <rect x="100" y="440" width="620" height="30" rx="8" fill="#3a3a3a"/>
    <rect x="100" y="470" width="620" height="180" rx="10" fill="${ROOM.wallDark}"/>
    <rect x="300" y="120" width="200" height="70" rx="8" fill="#8d8d8d"/>
    <rect x="760" y="240" width="180" height="410" rx="12" fill="${ROOM.white}"/>
    <rect x="760" y="380" width="180" height="10" fill="${ROOM.wallDark}"/>
    ${window(990, 200, 170, 260, palette)}
    <rect x="420" y="560" width="360" height="24" rx="12" fill="${ROOM.woodDark}"/>
    <g fill="${ROOM.wood}">
      <rect x="470" y="584" width="18" height="80"/>
      <rect x="712" y="584" width="18" height="80"/>
    </g>
    <circle cx="${200 + (seed % 60)}" cy="430" r="22" fill="${ROOM.accent}" opacity="0.8"/>
    <rect x="560" y="400" width="60" height="46" rx="6" fill="${ROOM.accent}" opacity="0.75"/>`;
}

/** Гостиная: диван, ковёр, телевизор. */
function living(seed, palette) {
  return `
    <rect width="1200" height="800" fill="${ROOM.wall}"/>
    <rect y="600" width="1200" height="200" fill="${ROOM.floor}"/>
    <ellipse cx="600" cy="700" rx="420" ry="80" fill="${ROOM.accentSoft}" opacity="0.6"/>
    ${window(820, 130, 300, 290, palette)}
    <rect x="120" y="420" width="520" height="140" rx="20" fill="${ROOM.textile}"/>
    <rect x="120" y="380" width="520" height="60" rx="18" fill="${ROOM.wallDark}"/>
    <rect x="160" y="400" width="120" height="60" rx="14" fill="${ROOM.accentSoft}"/>
    <rect x="320" y="400" width="120" height="60" rx="14" fill="${ROOM.white}"/>
    <rect x="480" y="400" width="120" height="60" rx="14" fill="${ROOM.accentSoft}"/>
    <rect x="150" y="560" width="60" height="40" fill="${ROOM.woodDark}"/>
    <rect x="550" y="560" width="60" height="40" fill="${ROOM.woodDark}"/>
    <rect x="290" y="600" width="220" height="20" rx="10" fill="${ROOM.wood}"/>
    <rect x="310" y="620" width="14" height="50" fill="${ROOM.woodDark}"/>
    <rect x="476" y="620" width="14" height="50" fill="${ROOM.woodDark}"/>
    <rect x="700" y="250" width="300" height="180" rx="10" fill="#2b2b2b" opacity="0.85"/>
    <rect x="820" y="430" width="60" height="14" fill="#2b2b2b" opacity="0.85"/>
    <ellipse cx="${1080 + (seed % 40)}" cy="540" rx="60" ry="76" fill="${ROOM.green}" opacity="0.85"/>
    <rect x="${1058 + (seed % 40)}" y="600" width="46" height="60" rx="6" fill="${ROOM.wood}"/>`;
}

/** Терраса или балкон: перила, зелень, море за ними. */
function terrace(seed, palette) {
  const rails = Array.from(
    { length: 14 },
    (_, i) => `<rect x="${60 + i * 82}" y="470" width="10" height="250" fill="${ROOM.white}" opacity="0.9"/>`,
  ).join('\n    ');
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="${880 - (seed % 400)}" cy="190" r="60" fill="${palette.sun}" opacity="0.85"/>
    ${mountains(seed + 3, palette.land, 460, 0.7)}
    <rect y="480" width="1200" height="320" fill="url(#sea)"/>
    ${rails}
    <rect x="40" y="450" width="1120" height="18" rx="9" fill="${ROOM.white}"/>
    <rect y="720" width="1200" height="80" fill="${ROOM.floor}"/>
    <ellipse cx="180" cy="690" rx="90" ry="42" fill="${ROOM.green}" opacity="0.9"/>
    <rect x="140" y="700" width="90" height="60" rx="8" fill="${ROOM.wood}"/>
    <rect x="820" y="620" width="260" height="18" rx="9" fill="${ROOM.white}"/>
    <rect x="856" y="638" width="16" height="86" fill="${ROOM.white}" opacity="0.85"/>
    <rect x="1028" y="638" width="16" height="86" fill="${ROOM.white}" opacity="0.85"/>
    <rect x="900" y="560" width="120" height="60" rx="10" fill="${ROOM.white}" opacity="0.8"/>`;
}

const HOUSE_SCENES = [facade, pool, gazebo, seaView];
const ROOM_SCENES = [living, bedroom, kitchen, terrace];

const APARTMENTS = [
  'studiya-briz',
  'apartamenty-laguna',
  'apartamenty-panorama',
  'apartamenty-kipari',
  'mansarda-magnoliya',
];

function render(scene, seed, palette) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.sky[0]}"/>
      <stop offset="55%" stop-color="${palette.sky[1]}"/>
      <stop offset="100%" stop-color="${palette.sky[2]}"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.sea[1]}"/>
      <stop offset="100%" stop-color="${palette.sea[0]}"/>
    </linearGradient>
  </defs>
  ${scene(seed, palette)}
</svg>
`;
}

let count = 0;

// Общие виды дома: дневная палитра, чтобы фасад и двор выглядели как один солнечный день.
HOUSE_SCENES.forEach((scene, index) => {
  const palette = PALETTES[index === 3 ? 1 : 0];
  writeFileSync(resolve(outDir, `house-${index + 1}.svg`), render(scene, 40 + index * 7, palette));
  count += 1;
});

// Интерьеры: у каждых апартаментов свой порядок кадров и своё освещение за окном.
for (const slug of APARTMENTS) {
  const base = hash(slug);
  for (let i = 0; i < 4; i += 1) {
    const scene = ROOM_SCENES[(base + i) % ROOM_SCENES.length];
    const palette = PALETTES[(base + i) % PALETTES.length];
    writeFileSync(resolve(outDir, `${slug}-${i + 1}.svg`), render(scene, base + i * 13, palette));
    count += 1;
  }
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f5c72"/>
  <circle cx="46" cy="20" r="7" fill="#ffd98e"/>
  <path d="M8 46c5-5 10-5 15 0s10 5 15 0 10-5 18 0v12H8z" fill="#7fc2d9"/>
  <path d="M16 42V22l16-11 16 11v20z" fill="#ffffff" opacity="0.94"/>
  <rect x="27" y="30" width="10" height="12" fill="#0f5c72"/>
</svg>
`;
writeFileSync(resolve(root, 'public/favicon.svg'), favicon);

console.log(`Готово: ${count} изображений в public/images и favicon.svg`);
