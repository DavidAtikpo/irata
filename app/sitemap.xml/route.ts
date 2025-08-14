import { NextRequest, NextResponse } from 'next/server';

const STATIC_PATHS = [
  '/',
  // Public
  '/financement-participatif',
  '/formations',
  '/demande',
  '/demande/success',
  '/contact',
  '/user/devis/ID/contrat', // dynamic placeholder example
  // Auth
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  // User
  '/dashboard',
  '/documents',
  '/mon-contrat',
  '/mes-devis',
  '/mes-demandes',
  '/profile',
  '/formulaires-quotidiens',
  '/customer-satisfaction',
  '/trainee-follow-up',
  // Admin
  '/admin',
  '/admin/dashboard',
  '/admin/demandes',
  '/admin/devis',
  '/admin/devis/nouveau',
  '/admin/documents',
  '/admin/documents/view/ID', // placeholder
  '/admin/inspection-report',
  '/admin/inspections',
  '/admin/inspections/new',
  '/admin/job-planing',
  '/admin/job-planing/new',
  '/admin/rapports',
  '/admin/formations',
  '/admin/formations/new',
  '/admin/customer-satisfaction',
  '/admin/financement-participatif',
  '/admin/formulaires-quotidiens',
  '/admin/formulaires-quotidiens/reponses',
  '/admin/contrats',
  '/admin/liste-presence',
  '/admin/suivi-irata',
  '/admin/parametres',
  '/admin/utilisateurs',
];

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  const { origin } = new URL(req.url);
  return origin;
}

export async function GET(req: NextRequest) {
  const base = getBaseUrl(req);
  const nowIso = new Date().toISOString();

  const urlsXml = STATIC_PATHS.map((path) => {
    const priority = path === '/' ? '1.0' : '0.7';
    return `\n  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}


