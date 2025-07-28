'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Document {
  id: string;
  nom: string;
  description?: string;
  cloudinaryId: string;
  url: string;
  type: string;
  public: boolean;
  createdAt: string;
  user?: { nom: string; prenom: string; email: string };
  devis?: { numero: string };
}

export default function ViewDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDocument();
    }
  }, [status, session, router, resolvedParams.id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch('/api/admin/documents');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const documents = await response.json();
      const foundDoc = documents.find((doc: Document) => doc.id === resolvedParams.id);
      
      if (!foundDoc) {
        throw new Error('Document non trouvé');
      }
      
      setDocument(foundDoc);
    } catch (error) {
      setError('Erreur lors de la récupération du document');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, nom: string) => {
    if (typeof window !== 'undefined') {
      const link = window.document.createElement('a');
      link.href = url;
      link.download = nom;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <h2 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">Chargement...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-red-600">{error || 'Document non trouvé'}</h2>
              <button
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* En-tête avec navigation */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Bouton retour */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors self-start"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour aux documents
            </button>
            
            {/* Titre et informations principales */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {document.nom}
                </h1>
                {document.description && (
                  <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">
                    {document.description}
                  </p>
                )}
                
                {/* Métadonnées principales */}
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                    Type: {document.type}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                    document.public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {document.public ? 'Public' : 'Privé'}
                  </span>
                  <span className="text-gray-400">
                    Ajouté le {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                <button
                  onClick={() => window.open(`/api/documents/${document.id}/stream`, '_blank')}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ouvrir dans</span> un nouvel onglet
                </button>
                <button
                  onClick={() => handleDownload(`/api/documents/${document.id}/local`, document.nom)}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du document</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs break-all">{document.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-900">{document.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Visibilité:</span>
                <span className="ml-2 text-gray-900">{document.public ? 'Public' : 'Privé'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Cloudinary ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs break-all">{document.cloudinaryId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date d'ajout:</span>
                <span className="ml-2 text-gray-900">{new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              {document.user && (
                <div>
                  <span className="font-medium text-gray-700">Utilisateur assigné:</span>
                  <span className="ml-2 text-gray-900">{document.user.prenom} {document.user.nom}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">URL:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs break-all">{document.url}</span>
              </div>
              {document.devis && (
                <div>
                  <span className="font-medium text-gray-700">Devis associé:</span>
                  <span className="ml-2 text-gray-900">{document.devis.numero}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons de débogage (masqués sur mobile par défaut) */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Actions de débogage</h3>
            <span className="text-xs text-gray-500">Pour les administrateurs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => handleDownload(`/api/documents/${document.id}/local`, document.nom)}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Local
            </button>
            <button
              onClick={() => window.open(`/api/documents/${document.id}/debug`, '_blank')}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Debug Info
            </button>
            <button
              onClick={() => window.open(`/api/documents/${document.id}/admin`, '_blank')}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Admin API
            </button>
            <button
              onClick={() => window.open(`/api/documents/${document.id}/proxy`, '_blank')}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Proxy
            </button>
          </div>
        </div>

        {/* Visualisation du document */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu du document</h3>
          <div className="border rounded-lg bg-gray-50 overflow-hidden">
            <div className="h-64 sm:h-96 lg:h-[600px] xl:h-[700px]">
              <iframe
                src={`/api/documents/${document.id}/local`}
                className="w-full h-full border-0"
                title={document.nom}
                onError={() => {
                  console.error('Erreur lors du chargement de l\'iframe');
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <p className="mb-4 text-gray-600 text-center text-sm sm:text-base">
                    Votre navigateur ne supporte pas l'affichage des PDF intégrés.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => window.open(`/api/documents/${document.id}/stream`, '_blank')}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </button>
                    <button
                      onClick={() => handleDownload(`/api/documents/${document.id}/download`, document.nom)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Télécharger le fichier
                    </button>
                  </div>
                </div>
              </iframe>
            </div>
          </div>
          
          {/* Actions alternatives pour mobile */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:hidden">
            <button
              onClick={() => window.open(`/api/documents/${document.id}/stream`, '_blank')}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Ouvrir en plein écran
            </button>
            <button
              onClick={() => handleDownload(`/api/documents/${document.id}/download`, document.nom)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}