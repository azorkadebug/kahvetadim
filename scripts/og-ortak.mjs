/* OG görsel betiklerinin ortak parçaları: sürüm, palet, yazı → SVG yolu,
   piksel kelime markası ve piksel köpek işareti.

   Neden yazıyı yola çeviriyoruz: sharp (librsvg) <text> için sistem
   fontlarına bakıyor; macOS'ta CoreText, Linux'ta fontconfig. Sitenin
   woff2 fontlarını hiçbiri görmüyor ve sessizce Georgia/Helvetica'ya
   düşüyordu. Bu yüzden harfleri fontun kendi glif çizimlerinden <path>
   olarak basıyoruz — her makinede aynı sonuç.

   Fontlar: scripts/fonts/*.ttf — public/fonts'taki değişken woff2'lerden
   sabit örnek (instance) olarak çıkarıldı (fontTools varLib.instancer +
   pyftsubset, Latin + Latin Ext-A):
     cuppin-fraunces-72-500.ttf         Fraunces opsz 72, wght 500
     cuppin-fraunces-italic-36-400.ttf  Fraunces Italic opsz 36, wght 400
     cuppin-inter-500.ttf               Inter wght 500
   Glif ayrıştırma için Astro'nun zaten kurduğu `fontkitten` kullanılıyor
   (fontkit'in küçük kardeşi; kerning/ligatür yok, OG için yeterli). */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { create } from 'fontkitten';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const root = resolve(__dirname, '..');

/* Önbellek kırıcı: /og/* 7 gün önbellekleniyor (public/_headers). Tasarım
   değişince bunu artır; çıktılar /og/<sürüm>/ altına yazılır, sayfalar da
   aynı sabiti kullanmalı. */
export const OG_SURUM = 'v2';

export const renk = {
  bg: '#faf4e7',
  bgSoft: '#f2e7cf',
  ink: '#23262c',
  inkSoft: '#5a5f68',
  accent: '#c97b1e',
  accentDeep: '#8a5214',
  line: '#e4d8be',
};

const yukle = (ad) => create(readFileSync(resolve(__dirname, 'fonts', ad)));
export const font = {
  serif: yukle('cuppin-fraunces-72-500.ttf'),
  italic: yukle('cuppin-fraunces-italic-36-400.ttf'),
  sans: yukle('cuppin-inter-500.ttf'),
};

const glifler = (f, metin) =>
  [...metin].map((ch) => {
    const cp = ch.codePointAt(0);
    if (!f.hasGlyphForCodePoint(cp)) {
      throw new Error(`OG fontunda "${ch}" (U+${cp.toString(16).toUpperCase()}) yok — scripts/fonts alt kümesini genişlet.`);
    }
    return f.glyphForCodePoint(cp);
  });

/** Metnin piksel genişliği. */
export function olc(f, metin, boyut, harfAraligi = 0) {
  const k = boyut / f.unitsPerEm;
  const g = glifler(f, metin);
  return g.reduce((t, gl) => t + gl.advanceWidth * k, 0) + harfAraligi * Math.max(0, g.length - 1);
}

/** Metni tek bir <path> olarak döndürür. y = taban çizgisi.
    hiza: 'start' | 'middle' | 'end'. */
export function yazi(f, metin, { x, y, boyut, renk: dolgu, harfAraligi = 0, hiza = 'start', opaklik }) {
  const k = boyut / f.unitsPerEm;
  const w = olc(f, metin, boyut, harfAraligi);
  let cx = hiza === 'middle' ? x - w / 2 : hiza === 'end' ? x - w : x;
  const parcalar = [];
  for (const gl of glifler(f, metin)) {
    const d = gl.path.scale(k, -k).translate(cx, y).toSVG();
    if (d) parcalar.push(d);
    cx += gl.advanceWidth * k + harfAraligi;
  }
  const op = opaklik != null ? ` fill-opacity="${opaklik}"` : '';
  return `<path d="${parcalar.join(' ')}" fill="${dolgu}"${op}/>`;
}

/** Kelimeleri ölçülen genişliğe göre satırlara böler. */
export function satirla(f, metin, boyut, maxGenislik, maxSatir = 3) {
  const kelimeler = String(metin).split(/\s+/).filter(Boolean);
  const satirlar = [];
  let cur = '';
  for (const k of kelimeler) {
    const aday = cur ? `${cur} ${k}` : k;
    if (cur && olc(f, aday, boyut) > maxGenislik) {
      satirlar.push(cur);
      cur = k;
    } else cur = aday;
  }
  if (cur) satirlar.push(cur);
  if (satirlar.length > maxSatir) {
    satirlar.length = maxSatir;
    satirlar[maxSatir - 1] = satirlar[maxSatir - 1].replace(/[.,!?;:—-]?$/, '…');
  }
  return satirlar;
}

/* Piksel kelime markası: src/components/site/Wordmark.astro'daki 49x9
   ızgaradan okunuyor, böylece site ile OG aynı çizimi kullanıyor. */
const wordmarkKaynak = readFileSync(resolve(root, 'src/components/site/Wordmark.astro'), 'utf8');
const wmRects = [...wordmarkKaynak.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="([^"]+)"/g)].map(
  (m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4], vurgu: m[5] !== 'currentColor' })
);
if (wmRects.length < 50) throw new Error('Wordmark.astro içinden piksel kareler okunamadı.');
export const WORDMARK_W = 49;
export const WORDMARK_H = 9;

/** Kelime markasını (x,y) sol üst köşeye, tam sayı `olcek` ile çizer. */
export function wordmark({ x, y, olcek, govde, vurgu }) {
  const r = wmRects
    .map((p) => `<rect x="${x + p.x * olcek}" y="${y + p.y * olcek}" width="${p.w * olcek}" height="${p.h * olcek}" fill="${p.vurgu ? vurgu : govde}"/>`)
    .join('');
  return `<g shape-rendering="crispEdges">${r}</g>`;
}

/** Piksel köpek işaretini (public/marka-cakil-24.png) en yakın komşu ile
    tam sayı kata büyütüp data URI olarak döndürür. librsvg <image>
    ölçeklemesinde yumuşatma yaptığı için büyütmeyi sharp yapıyor, SVG'ye
    1:1 gömülüyor. */
export async function kopekIsareti(sharp, olcek, kaynak = 'public/marka-cakil-24.png') {
  const src = resolve(root, kaynak);
  const { width, height } = await sharp(src).metadata();
  const buf = await sharp(src)
    .resize(width * olcek, height * olcek, { kernel: 'nearest' })
    .png()
    .toBuffer();
  return { uri: `data:image/png;base64,${buf.toString('base64')}`, w: width * olcek, h: height * olcek };
}
