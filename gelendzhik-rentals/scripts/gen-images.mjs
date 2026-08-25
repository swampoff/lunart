/**
 * Генерирует SVG-иллюстрации для карточек объектов.
 *
 * Это заглушки: когда появятся настоящие фотографии квартир, положите их в
 * public/images под теми же именами (или замените пути в поле images таблицы
 * properties) — остальной код менять не нужно.
 *
 * Запуск: npm run images
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/images');
mkdirSync(outDir, { recursive: true });

/** Палитры: закат, день, утро, вечер — по одной на каждый кадр объекта. */
const PALETTES = [
  { sky: ['#0b3d5c', '#2e7ea8', '#7fc2d9'], sun: '#ffd98e', sea: ['#0a3348', '#155975'], land: '#0d2c3d' },
  { sky: ['#f7b267', '#f4845f', '#c75c6a'], sun: '#fff1c9', sea: ['#5c3a58', '#8a5a72'], land: '#3b2440' },
  { sky: ['#cfe9f1', '#8fc9dd', '#4a9cbe'], sun: '#ffffff', sea: ['#1c6f8f', '#3f9bb8'], land: '#134b60' },
  { sky: ['#20304f', '#3b5a80', '#6d8fb0'], sun: '#ffe6a7', sea: ['#101f33', '#22405e'], land: '#0a1725' },
];

const properties = [
  'morskoy-briz-centr',
  'panorama-tolstyy-mys',
  'studiya-u-naberezhnoy',
  'golubaya-buhta-apartamenty',
  'dom-s-dvorikom-kabardinka',
  'divnomorskoe-u-morya',
  'loft-tonkiy-mys',
  'semeynye-apartamenty-marina-roshcha',
];

/** Детерминированный хеш, чтобы у каждого объекта был свой, но стабильный вид. */
function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) {
    value = (value * 31 + text.charCodeAt(i)) >>> 0;
  }
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

/** Кадр 1 — вид на бухту: небо, солнце, горы, море. */
function seaView(seed, palette) {
  const sunX = 260 + (seed % 600);
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="${sunX}" cy="250" r="70" fill="${palette.sun}" opacity="0.9"/>
    <circle cx="${sunX}" cy="250" r="130" fill="${palette.sun}" opacity="0.18"/>
    ${mountains(seed, palette.land, 470, 0.55)}
    ${mountains(seed + 7, palette.land, 500, 0.85)}
    <rect y="500" width="1200" height="300" fill="url(#sea)"/>
    <g fill="${palette.sun}" opacity="0.3">
      ${Array.from({ length: 9 }, (_, i) => {
        const width = 150 - i * 12;
        return `<rect x="${(sunX - width / 2).toFixed(0)}" y="${520 + i * 30}" width="${width}" height="6" rx="3"/>`;
      }).join('\n      ')}
    </g>
    <g fill="#ffffff" opacity="0.16">
      <rect x="120" y="560" width="220" height="4" rx="2"/>
      <rect x="420" y="620" width="300" height="4" rx="2"/>
      <rect x="760" y="580" width="260" height="4" rx="2"/>
      <rect x="200" y="700" width="340" height="4" rx="2"/>
    </g>`;
}

/** Кадр 2 — интерьер: окно с видом, кровать, лампа. */
function interior(seed, palette) {
  return `
    <rect width="1200" height="800" fill="#f4efe7"/>
    <rect width="1200" height="470" fill="#efe6d9"/>
    <rect x="140" y="90" width="480" height="360" rx="12" fill="url(#sky)"/>
    <rect x="140" y="330" width="480" height="120" fill="url(#sea)"/>
    <circle cx="${300 + (seed % 200)}" cy="200" r="46" fill="${palette.sun}" opacity="0.9"/>
    <rect x="370" y="90" width="14" height="360" fill="#f4efe7"/>
    <rect x="140" y="262" width="480" height="12" fill="#f4efe7"/>
    <rect x="128" y="78" width="504" height="384" rx="16" fill="none" stroke="#cbbda9" stroke-width="10"/>
    <rect x="720" y="250" width="360" height="200" rx="14" fill="${palette.land}" opacity="0.16"/>
    <rect x="700" y="300" width="400" height="150" rx="18" fill="#ffffff"/>
    <rect x="740" y="250" width="140" height="70" rx="12" fill="#ffffff" opacity="0.9"/>
    <rect x="900" y="250" width="140" height="70" rx="12" fill="#ffffff" opacity="0.9"/>
    <rect y="450" width="1200" height="350" fill="#e3d5c3"/>
    <rect x="640" y="450" width="520" height="230" rx="16" fill="#ffffff" opacity="0.75"/>
    <circle cx="200" cy="470" r="26" fill="${palette.sea[1]}" opacity="0.5"/>
    <rect x="192" y="490" width="16" height="150" fill="${palette.sea[1]}" opacity="0.35"/>`;
}

/** Кадр 3 — балкон или терраса: перила, растения, море за ними. */
function balcony(seed, palette) {
  const rails = Array.from(
    { length: 14 },
    (_, i) => `<rect x="${60 + i * 82}" y="470" width="10" height="250" fill="#ffffff" opacity="0.85"/>`,
  ).join('');
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="${900 - (seed % 400)}" cy="190" r="60" fill="${palette.sun}" opacity="0.85"/>
    ${mountains(seed + 3, palette.land, 460, 0.7)}
    <rect y="480" width="1200" height="320" fill="url(#sea)"/>
    ${rails}
    <rect x="40" y="450" width="1120" height="18" rx="9" fill="#ffffff" opacity="0.95"/>
    <rect y="720" width="1200" height="80" fill="#c9b8a3"/>
    <ellipse cx="180" cy="700" rx="90" ry="40" fill="#2f6b45" opacity="0.85"/>
    <ellipse cx="230" cy="670" rx="60" ry="34" fill="#3d8557" opacity="0.85"/>
    <rect x="140" y="700" width="90" height="60" rx="8" fill="#a9613c"/>
    <rect x="880" y="640" width="220" height="16" rx="8" fill="#ffffff" opacity="0.9"/>
    <rect x="920" y="656" width="16" height="80" fill="#ffffff" opacity="0.7"/>
    <rect x="1044" y="656" width="16" height="80" fill="#ffffff" opacity="0.7"/>`;
}

/** Кадр 4 — двор и дорожка к морю. */
function courtyard(seed, palette) {
  const trees = Array.from({ length: 6 }, (_, i) => {
    const x = 90 + i * 200 + (seed % 40);
    return `<ellipse cx="${x}" cy="${430 + (i % 3) * 20}" rx="70" ry="86" fill="#2f6b45" opacity="0.8"/>
            <rect x="${x - 9}" y="${470 + (i % 3) * 20}" width="18" height="120" fill="#5b4127"/>`;
  }).join('');
  return `
    <rect width="1200" height="800" fill="url(#sky)"/>
    <rect y="360" width="1200" height="440" fill="#dcd2bf"/>
    ${mountains(seed + 11, palette.land, 400, 0.5)}
    ${trees}
    <path d="M480 800 L560 560 L660 560 L760 800 Z" fill="#efe7d6"/>
    <rect x="100" y="600" width="1000" height="8" rx="4" fill="#c7b9a0"/>
    <rect x="820" y="480" width="240" height="160" rx="10" fill="#ffffff" opacity="0.9"/>
    <rect x="860" y="520" width="70" height="70" rx="6" fill="${palette.sea[1]}" opacity="0.5"/>
    <rect x="950" y="520" width="70" height="70" rx="6" fill="${palette.sea[1]}" opacity="0.5"/>
    <circle cx="${200 + (seed % 300)}" cy="180" r="54" fill="${palette.sun}" opacity="0.85"/>`;
}

const SCENES = [seaView, interior, balcony, courtyard];

function svgFor(slug, index) {
  const seed = hash(slug) + index * 13;
  const palette = PALETTES[(hash(slug) + index) % PALETTES.length];
  // Сдвигаем набор сцен по объекту, иначе все карточки каталога выглядят одинаково.
  const scene = SCENES[(hash(slug) + index) % SCENES.length](seed, palette);

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
  ${scene}
</svg>
`;
}

let count = 0;
for (const slug of properties) {
  for (let i = 0; i < 4; i += 1) {
    writeFileSync(resolve(outDir, `${slug}-${i + 1}.svg`), svgFor(slug, i));
    count += 1;
  }
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f5c72"/>
  <circle cx="44" cy="22" r="8" fill="#ffd98e"/>
  <path d="M6 44c6-6 12-6 18 0s12 6 18 0 12-6 16 0v14H6z" fill="#7fc2d9"/>
  <path d="M18 40V22l14-10 14 10v18z" fill="#ffffff" opacity="0.92"/>
  <rect x="27" y="30" width="10" height="12" fill="#0f5c72"/>
</svg>
`;
writeFileSync(resolve(root, 'public/favicon.svg'), favicon);

console.log(`Готово: ${count} изображений в public/images и favicon.svg`);
