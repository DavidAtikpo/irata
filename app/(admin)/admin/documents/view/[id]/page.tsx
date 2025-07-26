'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

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
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">{error || 'Document non trouvé'}</h2>
            <button
              onClick={() => router.back()}
              className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux documents
          </button>
          
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{document.nom}</h1>
              {document.description && (
                <p className="mt-1 text-sm text-gray-600">{document.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  document.type === 'formation' ? 'bg-blue-100 text-blue-800' :
                  document.type === 'contrat' ? 'bg-green-100 text-green-800' :
                  document.type === 'general' ? 'bg-gray-100 text-gray-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {document.type}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  document.public ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {document.public ? 'Public' : 'Privé'}
                </span>
              </div>
            </div>
            
                         <div className="flex space-x-2">
               <button
                 onClick={() => window.open(`/api/documents/${document.id}/local`, '_blank')}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
               >
                 Ouvrir (Local)
               </button>
               <button
                 onClick={() => handleDownload(`/api/documents/${document.id}/local`, document.nom)}
                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
               >
                 <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                 Télécharger (Local)
               </button>
               <button
                 onClick={() => window.open(`/api/documents/${document.id}/debug`, '_blank')}
                 className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
               >
                 Debug Info
               </button>
               <button
                 onClick={() => window.open(`/api/documents/${document.id}/admin`, '_blank')}
                 className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm"
               >
                 Admin API
               </button>
               <button
                 onClick={() => window.open(`/api/documents/${document.id}/proxy`, '_blank')}
                 className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
               >
                 Debug (Proxy)
               </button>
             </div>
          </div>
        </div>

        {/* Informations de débogage */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Informations de débogage :</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>ID :</strong> {document.id}</p>
            <p><strong>Cloudinary ID :</strong> {document.cloudinaryId}</p>
            <p><strong>URL :</strong> {document.url}</p>
            <p><strong>Type :</strong> {document.type}</p>
            <p><strong>Public :</strong> {document.public ? 'Oui' : 'Non'}</p>
          </div>
        </div>

        {/* Visualisation du document */}
        <div className="border rounded-lg bg-gray-50 p-4">
          <div className="h-96 md:h-screen max-h-screen">
            <iframe
              src={`/api/documents/${document.id}/local`}
              className="w-full h-full border rounded"
              title={document.nom}
              onError={() => {
                console.error('Erreur lors du chargement de l\'iframe');
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-gray-600">Votre navigateur ne supporte pas l'affichage des PDF intégrés.</p>
                <div className="space-x-2">
                  <button
                    onClick={() => window.open(`/api/documents/${document.id}/stream`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Ouvrir dans un nouvel onglet
                  </button>
                  <button
                    onClick={() => handleDownload(`/api/documents/${document.id}/download`, document.nom)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Télécharger le fichier
                  </button>
                </div>
              </div>
            </iframe>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>Date d'ajout :</strong> {new Date(document.createdAt).toLocaleDateString('fr-FR')}
          </div>
          {document.user && (
            <div>
              <strong>Utilisateur assigné :</strong> {document.user.prenom} {document.user.nom}
            </div>
          )}
          {document.devis && (
            <div>
              <strong>Devis associé :</strong> {document.devis.numero}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 