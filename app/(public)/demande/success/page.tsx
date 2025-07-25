'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemandeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page des demandes après 5 secondes
    const timeout = setTimeout(() => {
      router.push('/mes-demandes');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Demande envoyée avec succès !
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Votre demande a été enregistrée. Nous vous contacterons bientôt.
          </p>
          <div className="space-x-4">
            <Link
              href="/mes-demandes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir mes demandes
            </Link>
            <Link
              href="/formations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Retour aux formations
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Vous serez redirigé vers la page de vos demandes dans quelques secondes...
          </p>
        </div>
      </div>
    </div>
  );
} 