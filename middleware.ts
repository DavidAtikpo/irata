import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isGestionnaireRoute = req.nextUrl.pathname.startsWith('/gestionnaire');

    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (isGestionnaireRoute && token?.role !== 'GESTIONNAIRE' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/gestionnaire/:path*',
    '/demande/:path*',
    '/profile/:path*',
  ],
}; 