import { dateLocale, defaultLang, useTranslations, type Lang } from './ui';

/** Şemada normalize edilmiş seçim alanı: seçilen değer + "Diğer" ise elle yazılan metin. */
export type Choice<K extends string = string> = { kind: K; custom?: string };

/** Proses etiketi: "Diğer" seçilip metin yazıldıysa o metin, yoksa sözlükteki karşılığı. */
export function processLabel(lang: Lang, process: Choice): string {
  if (process.kind === 'other' && process.custom) return process.custom;
  return useTranslations(lang)(`process.${process.kind}` as never);
}

/** Demleme yöntemi etiketi: "Diğer" + metin → metin; "Diğer" boşsa sözlükteki "Diğer"; diğerleri adıyla. */
export function methodLabel(lang: Lang, method: Choice): string {
  if (method.kind !== 'other') return method.kind;
  return method.custom || useTranslations(lang)('method.other' as never);
}

/** URL yolundan aktif dili çıkarır. /tr/... → 'tr', diğer her şey → 'en'. */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'tr' ? 'tr' : 'en';
}

/** Sayfa adresleri menü kelimeleriyle aynı: EN Cups / Nose, TR Fincanlar / Çakıl.
    (2026-09-26'ya kadar yollar Türkçeydi: /tadimlar/, /hakkinda/, /tadim/<slug>/ —
    eski adresler public/_redirects'te 301.) */
const routes = {
  archive: { en: '/cups/', tr: '/tr/fincanlar/' },
  about: { en: '/nose/', tr: '/tr/cakil/' },
} as const;
export type Route = keyof typeof routes;

/** Bir sayfanın dile göre adresi. */
export function routePath(lang: Lang, route: Route): string {
  return routes[route][lang];
}

/** Ana sayfa ve dil kökü: en '/', tr '/tr/'. */
export function localizePath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path;
  if (path === '/') return '/tr/';
  return `/tr${path}`;
}

/** Tadım girdisinin diline bak (id 'en/...' ile başlıyorsa İngilizce). */
export function tastingLang(id: string): Lang {
  return id.startsWith('en/') ? 'en' : 'tr';
}

/** Tadım girdisinin dilden bağımsız slug'ı (en/ öneki atılır). */
export function tastingSlug(id: string): string {
  return id.replace(/^en\//, '');
}

/** Tadım detay sayfasının dile göre URL'i. İçerik dosyaları yerinde durur
    (kök = Türkçe dosya, en/ = İngilizce dosya); değişen yalnızca adres.
    Slug iki dilde ortak ve dilden bağımsız: kavurucu-kahve (special-guests-lerida-pacamara). */
export function tastingUrl(lang: Lang, slug: string): string {
  return lang === 'tr' ? `/tr/fincanlar/${slug}/` : `/cups/${slug}/`;
}

/** Dile göre tarih biçimlendirme. */
export function formatDate(
  lang: Lang,
  date: Date,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  return new Intl.DateTimeFormat(dateLocale[lang], opts).format(date);
}
