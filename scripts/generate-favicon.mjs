import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public', 'favicon.svg');
const icoPath = resolve(root, 'public', 'favicon.ico');
const appleTouchPath = resolve(root, 'public', 'apple-touch-icon.png');

const svg = readFileSync(svgPath);
const sizes = [16, 32, 48];

const pngs = await Promise.all(
  sizes.map((s) =>
    sharp(svg)
      .resize(s, s, { fit: 'contain', background: { r: 250, g: 247, b: 242, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toBuffer()
  )
);

const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;
const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * sizes.length;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);

let offset = headerSize;
for (let i = 0; i < sizes.length; i++) {
  const s = sizes[i];
  const png = pngs[i];
  const entryOffset = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE;
  header.writeUInt8(s === 256 ? 0 : s, entryOffset);
  header.writeUInt8(s === 256 ? 0 : s, entryOffset + 1);
  header.writeUInt8(0, entryOffset + 2);
  header.writeUInt8(0, entryOffset + 3);
  header.writeUInt16LE(1, entryOffset + 4);
  header.writeUInt16LE(32, entryOffset + 6);
  header.writeUInt32LE(png.length, entryOffset + 8);
  header.writeUInt32LE(offset, entryOffset + 12);
  offset += png.length;
}

const ico = Buffer.concat([header, ...pngs]);
writeFileSync(icoPath, ico);
console.log(`Wrote ${icoPath} (${(ico.length / 1024).toFixed(1)} KB, sizes: ${sizes.join('/')})`);

const appleTouch = await sharp(svg)
  .resize(180, 180, { fit: 'contain', background: { r: 250, g: 247, b: 242, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toBuffer();
writeFileSync(appleTouchPath, appleTouch);
console.log(`Wrote ${appleTouchPath} (${(appleTouch.length / 1024).toFixed(1)} KB, 180x180)`);
