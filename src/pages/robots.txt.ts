import type { APIRoute } from 'astro';

// Site haritası adresi alan adına bağlı; elle yazılan public/robots.txt
// taşınmadan sonra eski alan adını göstermeye devam ediyordu. Artık
// astro.config'teki `site` değerinden üretiliyor.
export const GET: APIRoute = ({ site }) => {
  const govde = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site)}
`;
  return new Response(govde, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
