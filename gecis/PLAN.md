# Geçiş günü: kahvetadim.com → cuppindog.com

Sıra önemli. Her adımın sonunda doğrulama var; biri tutmazsa sonrakine geçme.

## 0. Öncesinde (kod tarafı, şubede hazır)

- [x] Marka adı, palet, favicon, piksel kelime markası
- [x] Adres düzeni: İngilizce kökte, Türkçe `/tr/` altında
- [x] 404 sayfası + `wrangler.jsonc` → `not_found_handling: "404-page"`
- [ ] `astro.config.mjs` → `site: 'https://cuppindog.com'` (geçiş anında değişecek;
      kanonik adresler, sitemap ve OG adresleri buradan üretiliyor)
- [ ] `wrangler.jsonc` → `"name": "kahvetadim"` olduğu gibi kalsın; Worker adı
      değişirse Cloudflare yeni servis açar, özel alan adları kopar.
- [ ] Altbilgideki Instagram bağlantısı ve `a11y.instagram` metni (yeni kullanıcı adı)

## 1. Alan adını Cloudflare'e bağla

1. Cloudflare → cuppindog.com → Workers Routes / Custom Domains
2. `kahvetadim` Worker'ına özel alan adı olarak `cuppindog.com` ekle
3. `www.cuppindog.com` için apex'e 301 yönlendirme kuralı (kahvetadim'dekinin aynısı)

Doğrulama: `curl -sI https://cuppindog.com/ | head -3` → 200

## 2. Şubeyi main'e al ve yayınla

```
git checkout main && git merge cuppindog && git push
```

Cloudflare Workers Builds kendi derleyip yayınlar.

Doğrulama:
- `https://cuppindog.com/` → İngilizce, 200
- `https://cuppindog.com/tr/` → Türkçe, 200
- `https://cuppindog.com/tadim/<slug>/` ve `/tr/tadim/<slug>/` → 200
- `https://cuppindog.com/yok-boyle-bir-sayfa/` → 404 sayfası (düz "Not Found" değil)
- Kaynak kodda `<link rel="canonical" href="https://cuppindog.com/...">`

## 3. Eski alan adını yönlendir

`gecis/yonlendirmeler.csv` → Cloudflare → kahvetadim.com → Bulk Redirects
(liste olarak yükle, 301, sorgu dizesini koru).

20 satır: ana sayfa, arşiv, hakkında ve 7 tadımın iki dili.
Listede olmayan bir adres gelirse apex'e düşsün diye sona joker kural:
`https://kahvetadim.com/*` → `https://cuppindog.com/` (301).

Doğrulama:
```
curl -sI https://kahvetadim.com/tadim/hue-colombia-oscar-hernandez/ | head -3
# 301 + location: https://cuppindog.com/tr/tadim/hue-colombia-oscar-hernandez/
```

**kahvetadim.com'u silme.** Yönlendirme çalıştığı sürece eski bağlantılar
yaşar; alan adı bir yıl daha yenilensin.

## 4. Google Search Console

1. cuppindog.com için alan adı mülkü ekle, Cloudflare DNS TXT ile doğrula
2. Sitemap gönder: `https://cuppindog.com/sitemap-index.xml`
3. kahvetadim.com mülkünde **Ayarlar → Adres değişikliği** → hedef cuppindog.com
   (301'ler çalışmadan bu adım kabul edilmiyor, o yüzden 3. adımdan sonra)

## 5. Instagram

- Kullanıcı adını değiştir (takipçiler korunur) ya da yeni hesabı aç
- Profil fotoğrafı: `~/Desktop/cuppindog/instagram-altin-1024.jpg`
- Biyografideki bağlantıyı cuppindog.com yap

## 6. Geçiş sonrası

- [ ] 60 gün sonra cuppindog.com'u Cloudflare Registrar'a taşı (yenileme ucuzlar)
- [ ] Eski kahvetadim OG görselleri sosyal medyada önbellekte kalabilir; paylaşılan
      bağlantılar için Facebook/LinkedIn önbellek temizleme araçları kullanılabilir
- [ ] Analitik: Cloudflare Web Analytics'te yeni alan adı için site ekle
