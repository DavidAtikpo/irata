import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: (DefaultSession['user'] & {
      id: string;
      role: string;
      nom?: string | null;
      prenom?: string | null;
    }) | null;
  }

  interface User {
    id: string;
    role: string;
    nom?: string | null;
    prenom?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    nom?: string | null;
    prenom?: string | null;
    email?: string | null;
  }
}

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}