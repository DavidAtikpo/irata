"use client"

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Désactiver NextAuth sur les pages publiques pour éviter les erreurs
  const isPublicPage = pathname?.includes('/qr-generator') || 
                      pathname?.includes('/sign-in') || 
                      pathname?.includes('/sign-up') ||
                      pathname === '/'
  
  if (isPublicPage) {
    return <>{children}</>
  }
  
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}












