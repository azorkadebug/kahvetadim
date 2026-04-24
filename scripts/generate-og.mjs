import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'public', 'og.png');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf7f2"/>

  <rect x="0" y="0" width="1200" height="6" fill="#c77b46"/>
  <rect x="0" y="624" width="1200" height="6" fill="#c77b46"/>

  <g transform="translate(960, 120) rotate(-18 80 110)">
    <ellipse cx="80" cy="110" rx="58" ry="96" fill="none" stroke="#c77b46" stroke-width="8" opacity="0.9"/>
    <path d="M 40 30 Q 80 110 120 190" fill="none" stroke="#c77b46" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
  </g>

  <text x="100" y="290" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-size="150" font-weight="500" fill="#2b1d16" letter-spacing="-3">Kahve</text>
  <text x="100" y="430" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-style="italic" font-size="150" font-weight="500" fill="#c77b46" letter-spacing="-3">Tadımları</text>

  <line x1="100" y1="490" x2="220" y2="490" stroke="#2b1d16" stroke-width="2"/>
  <text x="100" y="540" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-style="italic" font-size="32" fill="#6b5545">demlemek, tatmak, yazmak.</text>

  <text x="1100" y="540" text-anchor="end" font-family="Inter, -apple-system, sans-serif" font-size="22" fill="#6b5545" letter-spacing="4">KAHVETADIM.COM</text>
</svg>`;

const buffer = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(outPath, buffer);

const { width, height, size } = await sharp(buffer).metadata();
console.log(`Generated ${outPath}`);
console.log(`  ${width}x${height}, ${(size / 1024).toFixed(1)} KB`);
