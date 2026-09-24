/* Tadım rengi: her tadım vurgu rengini kahvenin baskın lezzet notasından alır
   (Keystatic'te "Renk" alanı). Başlık/altbilgi marka turuncusunda kalır;
   renk yalnız tadımın kendi yüzeylerine (sayfa, ana sayfa kartı, arşiv
   satırı) --color-accent / --color-accent-deep olarak iner.
   Kontrast #f7f5f0 zemine göre ölçüldü: accent ≥ 3:1 (ikon, büyük puan),
   deep ≥ 4.5:1 (küçük metin, bağlantı). */
export const renkler = {
  turuncu: { ad: 'Turuncu (portakal, karamel)', accent: '#c97b1e', deep: '#8a5214' },
  papatya: { ad: 'Papatya sarısı (papatya, bal, sarı çiçek)', accent: '#b08614', deep: '#8b6a10' },
  seftali: { ad: 'Şeftali (şeftali, kayısı, erik)', accent: '#d0663f', deep: '#b5512c' },
  cicek: { ad: 'Çiçek moru (yasemin, lavanta, bergamot)', accent: '#9a64b8', deep: '#7d4a99' },
  limon: { ad: 'Limon yeşili (limon, misket, yeşil elma)', accent: '#7c9621', deep: '#62761a' },
  kirmizi: { ad: 'Kırmızı (kırmızı elma, dut, vişne)', accent: '#c0392b', deep: '#9e2b20' },
  cilek: { ad: 'Çilek pembesi (çilek, ahududu, gül)', accent: '#cc3d66', deep: '#a82a4f' },
} as const;

export type Renk = keyof typeof renkler;
export const renkAdlari = Object.keys(renkler) as [Renk, ...Renk[]];

/** Bir öğenin style özniteliğine yazılacak CSS değişkenleri. */
export const renkStil = (r: Renk = 'turuncu') =>
  `--color-accent:${renkler[r].accent};--color-accent-deep:${renkler[r].deep}`;
