/* Sitenin genel OG görselleri: İngilizce (kök) ve Türkçe (/tr/).
   Çıktı: public/og/<OG_SURUM>/site-en.png ve site-tr.png
   Logo serif yazı değil, sitedeki piksel kelime markası; sağda piksel
   köpek işareti. Yazılar gerçek Fraunces/Inter glifleri (bkz. og-ortak). */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, OG_SURUM, renk, font, yazi, wordmark, WORDMARK_W, kopekIsareti } from './og-ortak.mjs';

const outDir = resolve(root, 'public', 'og', OG_SURUM);
mkdirSync(outDir, { recursive: true });

const sloganlar = {
  en: 'brew, taste, write.',
  tr: 'demlemek, tatmak, yazmak.',
};

// 24 px'lik köpek × 11 = 264 px; kelime markası 49 birim × 12 = 588 px.
const kopek = await kopekIsareti(sharp, 11);
const WM = 12;

for (const [dil, slogan] of Object.entries(sloganlar)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${renk.bg}"/>
  <rect x="0" y="0" width="1200" height="6" fill="${renk.accent}"/>
  <rect x="0" y="624" width="1200" height="6" fill="${renk.accent}"/>

  <image href="${kopek.uri}" x="${1100 - kopek.w}" y="${Math.round((630 - kopek.h) / 2)}" width="${kopek.w}" height="${kopek.h}"/>

  ${wordmark({ x: 100, y: 204, olcek: WM, govde: renk.ink, vurgu: renk.accentDeep })}

  <rect x="100" y="376" width="120" height="2" fill="${renk.ink}"/>
  ${yazi(font.italic, slogan, { x: 100, y: 440, boyut: 36, renk: renk.inkSoft })}

  ${yazi(font.sans, 'CUPPINDOG.COM', { x: 100, y: 540, boyut: 22, renk: renk.inkSoft, harfAraligi: 4 })}
</svg>`;

  const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
  const outPath = resolve(outDir, `site-${dil}.png`);
  writeFileSync(outPath, buf);
  const { width, height, size } = await sharp(buf).metadata();
  console.log(`Generated public/og/${OG_SURUM}/site-${dil}.png  ${width}x${height}  ${(size / 1024).toFixed(1)} KB`);
}

// Kelime markası genişliği kontrolü (köpekle çakışmasın).
if (100 + WORDMARK_W * WM > 1100 - kopek.w - 20) throw new Error('Kelime markası köpek işaretine çarpıyor.');
