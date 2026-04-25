import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Kahve Tadımları' },
  },
  singletons: {
    hakkinda: singleton({
      label: 'Hakkında Sayfası',
      path: 'src/content/sayfalar/hakkinda/',
      format: { contentField: 'content', data: 'yaml' },
      entryLayout: 'content',
      schema: {
        kicker: fields.text({
          label: 'Üst Etiket',
          description: 'Başlığın üstünde görünen küçük yazı. Örn: Hakkında',
        }),
        title: fields.text({ label: 'Başlık' }),
        content: fields.markdoc({
          label: 'Sayfa İçeriği',
          extension: 'md',
        }),
      },
    }),
  },
  collections: {
    tadimlar: collection({
      label: 'Tadımlar',
      slugField: 'title',
      path: 'src/content/tadimlar/*',
      format: { contentField: 'content', data: 'yaml' },
      entryLayout: 'content',
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: { label: 'Başlık' },
          slug: {
            label: 'URL (slug)',
            description: 'Dosya adı ve URL parçası olarak kullanılır. Örn: kenya-nyeri-aa',
          },
        }),
        date: fields.date({
          label: 'Tadım Tarihi',
          defaultValue: { kind: 'today' },
        }),
        coverImage: fields.image({
          label: 'Kapak Fotoğrafı',
          directory: 'src/content/tadimlar',
          publicPath: './',
          validation: { isRequired: false },
        }),
        summary: fields.text({
          label: 'Özet',
          multiline: true,
          description: 'Ana sayfada ve arşiv kartlarında görünen kısa tanıtım',
        }),
        seoDescription: fields.text({
          label: 'SEO Açıklaması',
          multiline: true,
          description: 'Google sonuçlarında ve link önizlemelerinde görünen meta description (155-160 karakter ideal). Boş bırakılırsa Özet kullanılır.',
          validation: { isRequired: false },
        }),
        coffee: fields.object(
          {
            roaster: fields.text({ label: 'Kavurucu' }),
            origin: fields.text({ label: 'Menşei' }),
            region: fields.text({ label: 'Bölge', description: 'İsteğe bağlı' }),
            farm: fields.text({ label: 'Çiftlik', description: 'İsteğe bağlı' }),
            variety: fields.text({ label: 'Çeşit', description: 'İsteğe bağlı (SL28, Geisha vb.)' }),
            process: fields.select({
              label: 'İşlem',
              options: [
                { label: 'Washed', value: 'washed' },
                { label: 'Natural', value: 'natural' },
                { label: 'Honey', value: 'honey' },
                { label: 'Anaerobic', value: 'anaerobic' },
                { label: 'Diğer', value: 'other' },
              ],
              defaultValue: 'washed',
            }),
            roastDate: fields.date({
              label: 'Kavurma Tarihi',
              description: 'İsteğe bağlı',
              validation: { isRequired: false },
            }),
          },
          { label: 'Kahve' }
        ),
        brew: fields.object(
          {
            method: fields.select({
              label: 'Demleme Yöntemi',
              options: [
                { label: 'V60', value: 'V60' },
                { label: 'Chemex', value: 'Chemex' },
                { label: 'AeroPress', value: 'AeroPress' },
                { label: 'Orea', value: 'Orea' },
                { label: 'Espresso', value: 'Espresso' },
                { label: 'French Press', value: 'French Press' },
                { label: 'Moka', value: 'Moka' },
                { label: 'Cold Brew', value: 'Cold Brew' },
                { label: 'Diğer', value: 'other' },
              ],
              defaultValue: 'V60',
            }),
            grindSize: fields.text({ label: 'Öğütüm', description: 'Örn: Comandante 23 Klik' }),
            ratio: fields.text({ label: 'Oran', description: 'Örn: 1:16' }),
            water: fields.text({ label: 'Su', description: 'Örn: 15g / 240g, 94°C' }),
            time: fields.text({ label: 'Süre', description: 'Örn: 3:20' }),
          },
          { label: 'Demleme' }
        ),
        rating: fields.object(
          {
            overall: fields.integer({
              label: 'Genel Puan',
              description: '0-100',
              validation: { min: 0, max: 100 },
              defaultValue: 85,
            }),
            aroma: fields.integer({
              label: 'Aroma',
              description: '0-10 (isteğe bağlı)',
              validation: { min: 0, max: 10, isRequired: false },
            }),
            acidity: fields.integer({
              label: 'Asidite',
              description: '0-10 (isteğe bağlı)',
              validation: { min: 0, max: 10, isRequired: false },
            }),
            body: fields.integer({
              label: 'Gövde',
              description: '0-10 (isteğe bağlı)',
              validation: { min: 0, max: 10, isRequired: false },
            }),
            sweetness: fields.integer({
              label: 'Tatlılık',
              description: '0-10 (isteğe bağlı)',
              validation: { min: 0, max: 10, isRequired: false },
            }),
            aftertaste: fields.integer({
              label: 'Bitiş (Aftertaste)',
              description: '0-10 (isteğe bağlı)',
              validation: { min: 0, max: 10, isRequired: false },
            }),
            flavorNotes: fields.array(fields.text({ label: 'Tat notu' }), {
              label: 'Damak Notları',
              itemLabel: (props) => props.value,
            }),
          },
          { label: 'Puanlama' }
        ),
        content: fields.markdoc({
          label: 'Tadım Yazısı',
          extension: 'md',
        }),
      },
    }),
  },
});
