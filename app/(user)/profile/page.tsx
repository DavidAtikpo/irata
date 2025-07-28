'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

interface Session {
  user: User;
}

export default function ProfilePage() {
  const { data: session, status } = useSession() as { data: Session | null, status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Chargement...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Gérez vos informations personnelles</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Informations personnelles</h2>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Nom</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">{session.user.nom}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Prénom</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">{session.user.prenom}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">{session.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Rôle</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1 capitalize">{session.user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 