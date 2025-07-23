'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function CloudinaryInfoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">État du service Cloudinary</h1>
                <p className="text-sm text-gray-600">Problème détecté et solution de contournement</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Problème détecté */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Problème détecté</h3>
                  <div className="text-amber-700 space-y-2">
                    <p><strong>Erreur Cloudinary :</strong> "Customer is marked as untrusted"</p>
                    <p><strong>Impact :</strong> Impossible d'accéder aux documents stockés sur Cloudinary</p>
                    <p><strong>Code d'erreur :</strong> HTTP 401 Unauthorized</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution temporaire */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Solution temporaire mise en place</h3>
                  <div className="text-blue-700 space-y-2">
                    <p><strong>Stockage local activé :</strong> Les nouveaux documents sont automatiquement sauvegardés localement</p>
                    <p><strong>Basculement automatique :</strong> Si Cloudinary échoue, le système utilise le stockage local</p>
                    <p><strong>Accès aux documents :</strong> Priorisé sur le stockage local pour éviter les erreurs 401</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Actions recommandées</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <div>
                    <p className="font-medium text-green-800">Contacter le support Cloudinary</p>
                    <p className="text-green-700 text-sm">Expliquer le problème "Customer marked as untrusted" et demander la réactivation du compte</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <div>
                    <p className="font-medium text-green-800">Vérifier les paramètres de sécurité</p>
                    <p className="text-green-700 text-sm">Dans la console Cloudinary, vérifier que les paramètres de sécurité n'ont pas été modifiés</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <p className="font-medium text-green-800">Tester la restauration</p>
                    <p className="text-green-700 text-sm">Une fois Cloudinary réactivé, tester l'upload et l'accès aux documents</p>
                  </div>
                </div>
              </div>
            </div>

            {/* État actuel */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">État actuel du système</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-700">Upload de documents</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Fonctionnel (Local)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-700">Visualisation documents</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Fonctionnel (Local)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-700">Téléchargement documents</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Fonctionnel (Local)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span className="text-gray-700">Cloudinary</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hors service</span>
                </div>
              </div>
            </div>

            {/* Liens de support */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Liens utiles</h3>
              <div className="space-y-2">
                <a 
                  href="https://support.cloudinary.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Support Cloudinary →
                </a>
                <a 
                  href="https://console.cloudinary.com/console/settings/security" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Paramètres de sécurité Cloudinary →
                </a>
                <a 
                  href="/admin/documents" 
                  className="block text-indigo-600 hover:text-indigo-800 underline"
                >
                  Retour à la gestion des documents →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 