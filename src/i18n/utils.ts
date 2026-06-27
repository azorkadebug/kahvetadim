import { dateLocale, defaultLang, type Lang } from './ui';

/** URL yolundan aktif dili çıkarır. /en/... → 'en', diğer her şey → 'tr'. */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : 'tr';
}

/**
 * Bir kök yolu (TR yolu) aktif dile göre önekler.
 * tr: '/tadimlar/' → '/tadimlar/'
 * en: '/tadimlar/' → '/en/tadimlar/'
 * en: '/' → '/en/'
 */
export function localizePath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path;
  if (path === '/') return '/en/';
  return `/en${path}`;
}

/** Tadım girdisinin diline bak (id 'en/...' ile başlıyorsa İngilizce). */
export function tastingLang(id: string): Lang {
  return id.startsWith('en/') ? 'en' : 'tr';
}

/** Tadım girdisinin dilden bağımsız slug'ı (en/ öneki atılır). */
export function tastingSlug(id: string): string {
  return id.replace(/^en\//, '');
}

/** Tadım detay sayfasının dile göre URL'i. */
export function tastingUrl(lang: Lang, slug: string): string {
  return lang === 'en' ? `/en/tadim/${slug}/` : `/tadim/${slug}/`;
}

/** Dile göre tarih biçimlendirme. */
export function formatDate(
  lang: Lang,
  date: Date,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  return new Intl.DateTimeFormat(dateLocale[lang], opts).format(date);
}
