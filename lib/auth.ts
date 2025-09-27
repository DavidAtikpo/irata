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

        // isActive is newly added; cast to any until prisma types are regenerated
        if ((user as any).isActive === false) {
          console.log('❌ Compte désactivé:', credentials.email);
          throw new Error('Compte désactivé');
        }

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
          // NextAuth expects a name field on User
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          // Custom fields carried forward
          nom: user.nom || '',
          prenom: user.prenom || '',
          role: user.role,
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u: any = user;
        console.log('🔧 JWT Callback - User:', {
          id: u.id,
          role: u.role,
          email: u.email,
          nom: u.nom,
          prenom: u.prenom
        });
        (token as any).id = u.id;
        (token as any).role = u.role;
        (token as any).nom = u.nom;
        (token as any).prenom = u.prenom;
      }
      // Fallback: ensure id exists on token using NextAuth default `sub`
      if (!(token as any).id && typeof token.sub === 'string') {
        (token as any).id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('🔧 Session Callback - Token:', {
          id: token.id,
          role: token.role,
          email: token.email,
          nom: token.nom,
          prenom: token.prenom
        });
        if (typeof (token as any).id === 'string') {
          (session.user as any).id = (token as any).id;
        }
        if (typeof (token as any).role === 'string') {
          (session.user as any).role = (token as any).role;
        }
        if (typeof (token as any).nom === 'string' || (token as any).nom === null) {
          (session.user as any).nom = (token as any).nom as any;
        }
        if (typeof (token as any).prenom === 'string' || (token as any).prenom === null) {
          (session.user as any).prenom = (token as any).prenom as any;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
};