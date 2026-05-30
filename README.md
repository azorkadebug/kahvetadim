# Kahvetadım

Tattığım kahvelerin menşeini, prosesini ve damakta bıraktığı izi tek tek yazdığım kişisel tadım defteri.

🌐 **Yayında:** [https://kahvetadim.com](https://kahvetadim.com)
📷 **Instagram:** [@kahve.tadim](https://instagram.com/kahve.tadim)

## Tadımlar

Specialty kahve odaklı — menşei, kavurucu, demleme reçetesi ve fincan profili dahil. Şu ana kadar yayınlanan tadımlar:

- [Hue Colombia Oscar Hernandez](https://kahvetadim.com/tadim/hue-colombia-oscar-hernandez/) — Kolombiya Huila, natural Gesha, Hue (Selanik)
- [Belayco Etiyopya Bensa Sidama](https://kahvetadim.com/tadim/hafta-sonunun-nesesi-muenih-ten-belayco/) — Café Blá (Münih), natural process
- [Wilder Perez Gesha](https://kahvetadim.com/tadim/fincandaki-kirmizi-peru-dan-wilder-perez-gesha-milestones-coffee/) — Peru Amazonas, Milestones Coffee (Türkiye)

## Teknik

- **Stack:** Astro 5 + Tailwind v4 + MDX + Keystatic CMS (dev-only)
- **Deploy:** Cloudflare Workers Static Assets, GitHub `main` → otomatik deploy
- **Domain:** Apex canonical, `www` → 301 redirect via Cloudflare

## Yeni tadım eklemek

```bash
npm run dev
# Tarayıcıda http://localhost:4321/keystatic/
# Form ile tadım ekle → Save
git add .
git commit -m "New tasting: <kahve adı>"
git push
```

Push sonrası Cloudflare otomatik deploy eder (~1-2 dakika).

## İletişim

Geri bildirim ve önerilere açığım — Instagram DM: [@kahve.tadim](https://instagram.com/kahve.tadim)
