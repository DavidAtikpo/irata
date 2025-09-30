import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email,
            role: user.role,
            nom: user.nom ?? null,
            prenom: user.prenom ?? null,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        // Propager nom/prenom dans le token pour usage côté client
        token.nom = (user as any).nom ?? token.nom
        token.prenom = (user as any).prenom ?? token.prenom
        token.email = (user as any).email ?? token.email
      }
      // Si nom/prenom absents, tenter de les récupérer depuis la base via id ou email
      if (!('nom' in token) || (token as any).nom == null || !('prenom' in token) || (token as any).prenom == null) {
        try {
          let dbUser = null as any;
          if (token.sub) {
            dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          }
          if (!dbUser && token.email) {
            dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
          }
          if (dbUser) {
            (token as any).nom = dbUser.nom ?? null;
            (token as any).prenom = dbUser.prenom ?? null;
            token.email = token.email ?? dbUser.email;
            token.role = token.role ?? (dbUser as any).role;
          }
        } catch (e) {
          // noop
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        // Exposer nom/prenom dans la session (en élargissant le type à l'exécution)
        ;(session.user as any).nom = (token as any).nom
        ;(session.user as any).prenom = (token as any).prenom
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
