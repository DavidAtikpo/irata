import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('La variable d\'environnement NEXTAUTH_SECRET est manquante ou vide.');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        console.log('🔍 Tentative de connexion pour:', credentials.email);

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          console.log('❌ Utilisateur non trouvé:', credentials.email);
          throw new Error('Utilisateur non trouvé');
        }

        console.log('✅ Utilisateur trouvé:', {
          id: user.id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom
        });

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('❌ Mot de passe incorrect pour:', credentials.email);
          throw new Error('Mot de passe incorrect');
        }

        console.log('✅ Authentification réussie pour:', {
          email: user.email,
          role: user.role
        });

        return {
          id: user.id,
          email: user.email,
          nom: user.nom || '',
          prenom: user.prenom || '',
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🔧 JWT Callback - User:', {
          id: user.id,
          role: user.role,
          email: user.email
        });
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('🔧 Session Callback - Token:', {
          id: token.id,
          role: token.role,
          email: token.email
        });
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};