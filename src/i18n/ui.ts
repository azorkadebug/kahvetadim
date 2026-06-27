// Site dilleri ve arayüz metinleri tek kaynak.
// Yeni dil eklemek istenirse buraya bir anahtar daha eklenir.

export const languages = {
  tr: 'Türkçe',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'tr';
export const locales: Lang[] = ['tr', 'en'];

// og:locale ve hreflang için tam yerel kodlar
export const ogLocale: Record<Lang, string> = {
  tr: 'tr_TR',
  en: 'en_US',
};

// Intl tarih biçimlendirmesi için
export const dateLocale: Record<Lang, string> = {
  tr: 'tr-TR',
  en: 'en-GB',
};

// Sabit (statik) arayüz metinleri
export const ui = {
  tr: {
    'site.brandLead': 'Kahve',
    'site.brandAccent': 'Tadımları',
    'site.name': 'Kahve Tadımları',
    'site.description':
      'Tattığım kahvelerin menşeini, prosesini ve damakta bıraktığı izi tek tek yazdığım kişisel tadım defteri.',

    'nav.archive': 'Arşiv',
    'nav.about': 'Hakkında',

    'home.kicker': 'Kişisel kahve defterim',
    'home.titlePre': 'Demlediğim her fincanın ',
    'home.titleEm': 'hikâyesi',
    'home.titlePost': '.',
    'home.intro':
      'Menşeinden prosesine, demleme oranından damakta bıraktığı ize — tattığım kahveleri burada tek tek yazıyorum.',
    'home.latest': 'Son Tadımlar',
    'home.empty': 'Henüz yazılmış tadım yok.',
    'home.all': 'Tüm tadımlar →',

    'archive.kicker': 'Arşiv',
    'archive.title': 'Tüm Tadımlar',
    'archive.empty': 'Arşiv henüz boş.',
    'archive.th.date': 'Tarih',
    'archive.th.coffee': 'Kahve',
    'archive.th.origin': 'Menşei',
    'archive.th.process': 'Proses',
    'archive.th.brew': 'Demleme',
    'archive.th.score': 'Puan',

    'detail.palate': 'Damak profili',
    'detail.flavors': 'Lezzet notları',
    'detail.back': '← Arşive dön',

    'rating.aroma': 'Aroma',
    'rating.acidity': 'Asidite',
    'rating.body': 'Gövde',
    'rating.sweetness': 'Tatlılık',
    'rating.aftertaste': 'Bitiş',

    'data.roaster': 'Kavurucu',
    'data.origin': 'Menşei',
    'data.farm': 'Çiftlik',
    'data.variety': 'Çeşit',
    'data.process': 'Proses',
    'data.brew': 'Demleme',
    'data.grind': 'Öğütüm',
    'data.ratio': 'Oran',
    'data.time': 'Süre',
    'data.roasted': 'Kavurma',
    'data.score': 'Puan',

    'process.washed': 'Yıkanmış',
    'process.natural': 'Natural',
    'process.honey': 'Honey',
    'process.anaerobic': 'Anaerobik',
    'process.other': 'Diğer',

    'about.description': 'Bu kahve tadım defterinin hikâyesi.',

    'a11y.instagram': "Instagram'da @kahve.tadim",
    'a11y.switchLang': 'Dili değiştir',
  },
  en: {
    'site.brandLead': 'Coffee',
    'site.brandAccent': 'Tastings',
    'site.name': 'Coffee Tastings',
    'site.description':
      'A personal tasting journal where I write up the origin, process and cup of every coffee I taste, one by one.',

    'nav.archive': 'Archive',
    'nav.about': 'About',

    'home.kicker': 'My personal coffee journal',
    'home.titlePre': 'The story behind every ',
    'home.titleEm': 'cup',
    'home.titlePost': ' I brew.',
    'home.intro':
      'From origin and process to brew ratio and the trace it leaves on the palate — I write up every coffee I taste, right here.',
    'home.latest': 'Latest Tastings',
    'home.empty': 'No tastings written yet.',
    'home.all': 'All tastings →',

    'archive.kicker': 'Archive',
    'archive.title': 'All Tastings',
    'archive.empty': 'The archive is empty for now.',
    'archive.th.date': 'Date',
    'archive.th.coffee': 'Coffee',
    'archive.th.origin': 'Origin',
    'archive.th.process': 'Process',
    'archive.th.brew': 'Brew',
    'archive.th.score': 'Score',

    'detail.palate': 'Palate profile',
    'detail.flavors': 'Flavor notes',
    'detail.back': '← Back to archive',

    'rating.aroma': 'Aroma',
    'rating.acidity': 'Acidity',
    'rating.body': 'Body',
    'rating.sweetness': 'Sweetness',
    'rating.aftertaste': 'Aftertaste',

    'data.roaster': 'Roaster',
    'data.origin': 'Origin',
    'data.farm': 'Farm',
    'data.variety': 'Variety',
    'data.process': 'Process',
    'data.brew': 'Brew',
    'data.grind': 'Grind',
    'data.ratio': 'Ratio',
    'data.time': 'Time',
    'data.roasted': 'Roasted',
    'data.score': 'Score',

    'process.washed': 'Washed',
    'process.natural': 'Natural',
    'process.honey': 'Honey',
    'process.anaerobic': 'Anaerobic',
    'process.other': 'Other',

    'about.description': 'The story behind this coffee tasting journal.',

    'a11y.instagram': '@kahve.tadim on Instagram',
    'a11y.switchLang': 'Switch language',
  },
} as const;

export type UIKey = keyof (typeof ui)['tr'];

/** Verilen dil için çeviri fonksiyonu. Eksik anahtar varsayılan dile düşer. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Arşiv sayısı gibi parametrik metinler. */
export function archiveCount(lang: Lang, n: number): string {
  if (lang === 'en') {
    if (n === 0) return 'no cups yet';
    return `${n} ${n === 1 ? 'cup' : 'cups'}, each a different story`;
  }
  return `${n} fincan, ${n === 0 ? 'henüz hiç' : 'her biri farklı hikâye'}`;
}

/** Arşiv sayfası meta açıklaması. */
export function archiveDescription(lang: Lang, n: number): string {
  if (lang === 'en') {
    return `A chronological list of ${n} coffee tastings — origin, process, brew method and score.`;
  }
  return `${n} kahve tadımının kronolojik listesi — menşei, proses, demleme yöntemi ve puan.`;
}
