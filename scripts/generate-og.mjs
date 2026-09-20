import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'public', 'og.png');
// Marka işareti (Çakıl) SVG'ye gömülüyor: sharp harici dosya yolunu
// <image href> ile çözmüyor, data URI şart.
const marka = readFileSync(resolve(__dirname, '..', 'public', 'marka-cakil.png')).toString('base64');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf4e7"/>

  <rect x="0" y="0" width="1200" height="6" fill="#c97b1e"/>
  <rect x="0" y="624" width="1200" height="6" fill="#c97b1e"/>

  <image href="data:image/png;base64,${marka}" x="880" y="150" width="240" height="240" image-rendering="pixelated"/>

  <text x="100" y="330" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-size="150" font-weight="500" fill="#23262c" letter-spacing="-3">cuppin<tspan fill="#8a5214">dog</tspan></text>

  <line x1="100" y1="400" x2="220" y2="400" stroke="#23262c" stroke-width="2"/>
  <text x="100" y="452" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-style="italic" font-size="32" fill="#5a5f68">demlemek, tatmak, yazmak.</text>

  <text x="100" y="540" font-family="Inter, -apple-system, sans-serif" font-size="22" fill="#5a5f68" letter-spacing="4">CUPPINDOG.COM</text>
</svg>`;

const buffer = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(outPath, buffer);

const { width, height, size } = await sharp(buffer).metadata();
console.log(`Generated ${outPath}`);
console.log(`  ${width}x${height}, ${(size / 1024).toFixed(1)} KB`);
