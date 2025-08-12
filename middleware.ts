import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isGestionnaireRoute = req.nextUrl.pathname.startsWith('/gestionnaire');

    console.log('🔍 Middleware - Token:', token);
    console.log('🔍 Middleware - Route:', req.nextUrl.pathname);
    console.log('🔍 Middleware - Role:', token?.role);

    if (isAdminRoute && token?.role !== 'ADMIN') {
      console.log('❌ Accès refusé à la route admin - Role:', token?.role);
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (isGestionnaireRoute && token?.role !== 'GESTIONNAIRE' && token?.role !== 'ADMIN') {
      console.log('❌ Accès refusé à la route gestionnaire - Role:', token?.role);
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('✅ Accès autorisé à la route');
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