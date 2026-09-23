import sharp from 'sharp';
import yaml from 'js-yaml';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { OG_SURUM, renk, font, yazi, olc, satirla, wordmark, WORDMARK_W, WORDMARK_H, kopekIsareti } from './og-ortak.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contentDir = join(root, 'src/content/tadimlar');
// Çıktı sürümlü klasöre: /og/* 7 gün önbellekte, tasarım değişince
// OG_SURUM artar ve adres değişir. Eski sürüm klasörleri silinir.
const ogKok = join(root, 'public/og');
const outDir = join(ogKok, OG_SURUM);
for (const ad of existsSync(ogKok) ? readdirSync(ogKok) : []) {
  if (ad !== OG_SURUM && !ad.startsWith('.')) rmSync(join(ogKok, ad), { recursive: true, force: true });
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

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

// Köşe markası: köpek 24 px × 3 = 72, kelime markası 49 × 5 = 245 px.
const kopek = await kopekIsareti(sharp, 3);
const WM = 5;
const markaX = 1120 - WORDMARK_W * WM;
const markaY = 590 - WORDMARK_H * WM;
const kopekX = markaX - 16 - kopek.w;
const kopekY = 590 - kopek.h + 2;
const kose = `<image href="${kopek.uri}" x="${kopekX}" y="${kopekY}" width="${kopek.w}" height="${kopek.h}"/>
    ${wordmark({ x: markaX, y: markaY, olcek: WM, govde: renk.bg, vurgu: renk.accent })}`;
// Alt satırdaki köken yazısı köşe markasına çarpmasın.
const altYaziMax = kopekX - 40 - 80;

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

  const titleLines = satirla(font.serif, title, 66, 880, 3);
  const titleStartY = 270 - (titleLines.length - 1) * 36;
  let subtitle = [origin, region].filter(Boolean).join(' · ');
  while (subtitle.length > 1 && olc(font.italic, subtitle, 32) > altYaziMax) subtitle = subtitle.slice(0, -2).trimEnd() + '…';
  // Kavurucu adları çoğunlukla yabancı: yerel ayarsız büyük harf (MILESTONES, MİLESTONES değil).
  const roasterText = roaster.toUpperCase();

  const svgOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="dim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${renk.ink}" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="${renk.ink}" stop-opacity="0.80"/>
        <stop offset="100%" stop-color="${renk.ink}" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#dim)"/>
    <rect x="0" y="0" width="1200" height="6" fill="${renk.accent}"/>
    <rect x="0" y="624" width="1200" height="6" fill="${renk.accent}"/>

    <circle cx="1100" cy="120" r="60" fill="${renk.accent}"/>
    ${yazi(font.serif, String(rating), { x: 1100, y: 136, boyut: 46, renk: renk.bg, hiza: 'middle' })}
    ${yazi(font.sans, labels[lang].score, { x: 1100, y: 158, boyut: 13, renk: renk.bg, harfAraligi: 3, hiza: 'middle' })}

    ${roasterText ? yazi(font.sans, roasterText, { x: 80, y: 105, boyut: 22, renk: renk.accent, harfAraligi: 6 }) : ''}

    ${titleLines
      .map((line, i) => yazi(font.serif, line, { x: 80, y: titleStartY + i * 78, boyut: 66, renk: renk.bg, harfAraligi: -1 }))
      .join('\n    ')}

    <rect x="80" y="499" width="120" height="2" fill="${renk.accent}"/>
    ${subtitle ? yazi(font.italic, subtitle, { x: 80, y: 555, boyut: 32, renk: renk.line }) : ''}

    ${kose}
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
    // PNG 550-600 KB çıkıyordu; fotoğraf zeminli kart için JPEG 80-100 KB.
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const outPath = join(outDir, `${slug}.jpg`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  const meta = await sharp(buf).metadata();
  console.log(`Generated public/og/${OG_SURUM}/${slug}.jpg  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(1)} KB`);
}

console.log(`\nTotal: ${entries.length} OG image(s) generated.`);
