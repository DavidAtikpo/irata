import { NextRequest, NextResponse } from 'next/server';

const STATIC_PATHS = [
  '/',
  // Public
  '/financement-participatif',
  '/formations',
  '/demande',
  '/demande/success',
  '/contact',
  '/documents/irata-disclaimer',

  // Auth
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  
  // User pages (pour que Weglot les découvre)
  '/user/dashboard',
  '/user/profile',
  '/user/mes-demandes',
  '/user/mes-devis',
  '/user/mon-contrat',
  '/user/invoice',
  '/user/documents',
  '/user/inspections',
  '/user/attendance',
  '/user/actions-correctives',
  '/user/non-conformites',
  '/user/formulaires-quotidiens',
  '/user/edge-and-rope-management',
  '/user/customer-satisfaction',
  '/user/medical-declaration',
  '/user/trainee-follow-up',
  '/user/trainee-induction',
  '/user/pre-job-training',
  '/user/convocation-cides',
  '/user/investissements',
  '/user/irata-disclaimer',
  
  // Admin pages
  '/admin/dashboard',
  '/admin/users',
  '/admin/formations',
  '/admin/documents',
  '/admin/attendance',
  '/admin/cloudinary-info',
  
  // Gestionnaire
  '/gestionnaire/dashboard',
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


