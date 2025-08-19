import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    nom: string;
    prenom: string;
  }
} 