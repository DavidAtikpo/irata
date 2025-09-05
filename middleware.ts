import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isGestionnaireRoute = req.nextUrl.pathname.startsWith('/gestionnaire');
    const isUserRoute = req.nextUrl.pathname.startsWith('/user');

    console.log('🔍 Middleware - Token:', token);
    console.log('🔍 Middleware - Route:', req.nextUrl.pathname);
    console.log('🔍 Middleware - Role:', token?.role);

    if (isAdminRoute && token?.role !== 'ADMIN') {
      console.log('❌ Accès refusé à la route admin - Role:', token?.role);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isGestionnaireRoute && token?.role !== 'GESTIONNAIRE' && token?.role !== 'ADMIN') {
      console.log('❌ Accès refusé à la route gestionnaire - Role:', token?.role);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isUserRoute && token?.role !== 'USER') {
      console.log('❌ Accès refusé à la route utilisateur - Role:', token?.role);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
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
    '/user/:path*',
    '/demande/:path*',
    '/profile/:path*',
  ],
}; 