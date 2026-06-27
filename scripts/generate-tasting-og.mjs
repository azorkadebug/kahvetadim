import sharp from 'sharp';
import yaml from 'js-yaml';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contentDir = join(root, 'src/content/tadimlar');
const outDir = join(root, 'public/og');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrapLines = (text, max, maxLines = 3) => {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,!?;:—-]?$/, '…');
  }
  return lines;
};

// TR dosyaları kökte, EN dosyaları en/ alt klasöründe.
// Her biri için { path, slug (en/ önekli), lang, dir } topluyoruz.
const collect = (dir, prefix, lang) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({
      path: join(dir, f),
      slug: prefix + f.replace(/\.md$/, ''),
      lang,
      dir,
    }));

const entries = [...collect(contentDir, '', 'tr')];
const enDir = join(contentDir, 'en');
if (existsSync(enDir)) entries.push(...collect(enDir, 'en/', 'en'));

// Etiketler dile göre
const labels = {
  tr: { score: 'PUAN' },
  en: { score: 'SCORE' },
};

for (const { path: filePath, slug, lang, dir } of entries) {
  const raw = readFileSync(filePath, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  const data = yaml.load(m[1]);

  const title = String(data.title || slug);
  const roaster = String(data.coffee?.roaster || '');
  const origin = String(data.coffee?.origin || '');
  const region = String(data.coffee?.region || '');
  const rating = data.rating?.overall ?? 0;
  const coverRel = data.coverImage;

  const titleLines = wrapLines(title, 26, 3);
  const titleStartY = 270 - (titleLines.length - 1) * 36;
  const subtitle = [origin, region].filter(Boolean).join(' · ');

  const svgOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="dim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0f08" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="#1a0f08" stop-opacity="0.78"/>
        <stop offset="100%" stop-color="#1a0f08" stop-opacity="0.94"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#dim)"/>
    <rect x="0" y="0" width="1200" height="6" fill="#c77b46"/>
    <rect x="0" y="624" width="1200" height="6" fill="#c77b46"/>

    <g transform="translate(1040, 60)">
      <circle cx="60" cy="60" r="60" fill="#c77b46"/>
      <text x="60" y="62" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="46" font-weight="500" fill="#faf7f2">${rating}</text>
      <text x="60" y="96" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" letter-spacing="3" fill="#faf7f2">${labels[lang].score}</text>
    </g>

    <text x="80" y="105" font-family="Inter, sans-serif" font-size="22" letter-spacing="6" fill="#c77b46">${escape(roaster.toUpperCase())}</text>

    ${titleLines
      .map(
        (line, i) =>
          `<text x="80" y="${titleStartY + i * 78}" font-family="Fraunces, Georgia, serif" font-size="66" font-weight="500" fill="#faf7f2" letter-spacing="-1">${escape(line)}</text>`
      )
      .join('\n    ')}

    <line x1="80" y1="500" x2="200" y2="500" stroke="#c77b46" stroke-width="2"/>
    <text x="80" y="555" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="32" fill="#e8d4bf">${escape(subtitle)}</text>

    <text x="1120" y="590" text-anchor="end" font-family="Inter, sans-serif" font-size="18" letter-spacing="4" fill="#e8d4bf">KAHVETADIM.COM</text>
  </svg>`;

  let pipeline;
  if (coverRel) {
    const coverPath = resolve(dir, coverRel.replace(/^\.\//, ''));
    if (!existsSync(coverPath)) {
      console.warn(`  ! cover not found for ${slug}: ${coverPath} — using fallback bg`);
      pipeline = sharp({
        create: { width: 1200, height: 630, channels: 4, background: { r: 26, g: 15, b: 8, alpha: 1 } },
      });
    } else {
      pipeline = sharp(coverPath).resize(1200, 630, { fit: 'cover', position: 'centre' });
    }
  } else {
    pipeline = sharp({
      create: { width: 1200, height: 630, channels: 4, background: { r: 26, g: 15, b: 8, alpha: 1 } },
    });
  }

  const buf = await pipeline
    .composite([{ input: Buffer.from(svgOverlay) }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outPath = join(outDir, `${slug}.png`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  const meta = await sharp(buf).metadata();
  console.log(`Generated public/og/${slug}.png  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(1)} KB`);
}

console.log(`\nTotal: ${entries.length} OG image(s) generated.`);
