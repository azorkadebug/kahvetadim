/* Site simgeleri — piksel köpek (Çakıl) başından, yalnız tam sayı katlı
   en yakın komşu büyütmeyle üretilir (ara piksel yok).

   Kaynak çizimler (elle çizilmiş, dokunulmaz):
     public/favicon-16.png      16 px için ayrı çizim
     public/favicon-32.png      32 px çizim (marka-cakil-32.png ile aynı)
     public/marka-cakil-24.png  24 px ana çizim

   Çıktılar:
     favicon.ico            16 (favicon-16) + 32 (favicon-32) + 48 (24 × 2)
     apple-touch-icon.png   180: 32 × 5 = 160 + 10 px kenar, krem zemin
     icon-192.png           192: 32 × 5 = 160 + 16 px kenar, krem zemin
     icon-512.png           512: 32 × 13 = 416 + 48 px kenar, krem zemin
     favicon.svg            32 px çizimin piksel kareleri (crispEdges)

   Eskiden public/favicon.svg'deki kahve fincanından üretiyordu; her
   build eski fincanı geri getiriyordu. Artık favicon.svg de çıktı. */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '..', 'public');
const p = (ad) => resolve(pub, ad);

const ZEMIN = { r: 0xfa, g: 0xf4, b: 0xe7, alpha: 1 }; // --color-bg

const buyut = (ad, kat) =>
  sharp(p(ad))
    .metadata()
    .then(({ width, height }) =>
      sharp(p(ad)).resize(width * kat, height * kat, { kernel: 'nearest' }).png().toBuffer()
    );

const zeminli = async (ad, kat, boyut) => {
  const buf = await buyut(ad, kat);
  const { width, height } = await sharp(buf).metadata();
  const sol = Math.floor((boyut - width) / 2);
  const ust = Math.floor((boyut - height) / 2);
  return sharp(buf)
    .extend({ top: ust, bottom: boyut - height - ust, left: sol, right: boyut - width - sol, background: ZEMIN })
    .flatten({ background: ZEMIN })
    .png({ compressionLevel: 9 })
    .toBuffer();
};

// --- favicon.ico (PNG gömülü çok boyutlu ICO) ---
const icoParcalari = [
  { s: 16, png: await sharp(p('favicon-16.png')).png({ compressionLevel: 9 }).toBuffer() },
  { s: 32, png: await sharp(p('favicon-32.png')).png({ compressionLevel: 9 }).toBuffer() },
  { s: 48, png: await buyut('marka-cakil-24.png', 2) },
];
for (const { s, png } of icoParcalari) {
  const m = await sharp(png).metadata();
  if (m.width !== s || m.height !== s) throw new Error(`ICO ${s}px parçası ${m.width}x${m.height} çıktı`);
}
const header = Buffer.alloc(6 + 16 * icoParcalari.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoParcalari.length, 4);
let offset = header.length;
icoParcalari.forEach(({ s, png }, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
const ico = Buffer.concat([header, ...icoParcalari.map((x) => x.png)]);
writeFileSync(p('favicon.ico'), ico);
console.log(`Wrote public/favicon.ico (${(ico.length / 1024).toFixed(1)} KB, 16/32/48)`);

// --- Zeminli PNG simgeler ---
for (const [ad, kat, boyut] of [
  ['apple-touch-icon.png', 5, 180],
  ['icon-192.png', 5, 192],
  ['icon-512.png', 13, 512],
]) {
  const buf = await zeminli('favicon-32.png', kat, boyut);
  writeFileSync(p(ad), buf);
  console.log(`Wrote public/${ad} (${(buf.length / 1024).toFixed(1)} KB, ${boyut}x${boyut}, 32px × ${kat})`);
}

// --- favicon.svg: 32 px çizimden piksel kareler ---
{
  const { data, info } = await sharp(p('favicon-32.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hex = (i) => '#' + [0, 1, 2].map((k) => data[i + k].toString(16).padStart(2, '0')).join('');
  const rects = [];
  for (let y = 0; y < info.height; y++) {
    // Aynı renkli yatay koşuları tek <rect>'e birleştir.
    let x = 0;
    while (x < info.width) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] === 0) { x++; continue; }
      const c = hex(i);
      let w = 1;
      while (x + w < info.width) {
        const j = (y * info.width + x + w) * 4;
        if (data[j + 3] === 0 || hex(j) !== c) break;
        w++;
      }
      rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`);
      x += w;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${info.width} ${info.height}" shape-rendering="crispEdges">${rects.join('')}</svg>\n`;
  writeFileSync(p('favicon.svg'), svg);
  console.log(`Wrote public/favicon.svg (${rects.length} rects)`);
}
