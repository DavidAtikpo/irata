'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface Document {
  id: string;
  nom: string;
  description?: string;
  url: string;
  type: string;
  public: boolean;
  createdAt: string;
  user?: { nom: string; prenom: string; email: string };
  devis?: { numero: string };
}

export default function AdminDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);


  const [uploadForm, setUploadForm] = useState({
    nom: '',
    description: '',
    type: 'formation',
    public: true,
    userId: '',
    devisId: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status, session, router]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      setError('Erreur lors de la récupération des documents');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    setUploading(true);
    setError(null);

    try {
      // Essayer d'abord Cloudinary, puis le stockage local si échec
      let response;
      let isLocalUpload = false;

      try {
        response = await fetch('/api/admin/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur Cloudinary');
        }
      } catch (cloudinaryError) {
        console.log('Cloudinary échec, tentative stockage local:', cloudinaryError);
        
        // Fallback vers le stockage local
        response = await fetch('/api/admin/documents/upload/local', {
          method: 'POST',
          body: formData,
        });
        isLocalUpload = true;
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors du téléversement local');
        }
      }

      if (isLocalUpload) {
        setError('⚠️ Document téléversé en stockage local (problème Cloudinary détecté)');
      }

      setShowUploadForm(false);
      setUploadForm({
        nom: '',
        description: '',
        type: 'formation',
        public: true,
        userId: '',
        devisId: '',
      });
      await fetchDocuments();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const response = await fetch(`/api/admin/documents?id=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchDocuments();
    } catch (error) {
      setError('Erreur lors de la suppression du document');
      console.error('Erreur:', error);
    }
  };

  const handleDownload = (documentId: string, nom: string) => {
    const link = document.createElement('a');
    // Essayer d'abord le stockage local, puis autres méthodes
    link.href = `/api/documents/${documentId}/local`;
    link.download = nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (documentId: string) => {
    router.push(`/admin/documents/view/${documentId}`);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Gestion des documents</h2>
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Téléverser un document
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Formulaire de téléversement */}
        {showUploadForm && (
          <div className="mb-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Téléverser un nouveau document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du document *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={uploadForm.nom}
                    onChange={(e) => setUploadForm({ ...uploadForm, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value="formation">Formation</option>
                    <option value="contrat">Contrat</option>
                    <option value="general">Général</option>
                    <option value="procedure">Procédure</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="public"
                      checked={uploadForm.public}
                      onChange={(e) => setUploadForm({ ...uploadForm, public: e.target.checked })}
                      className="mr-2"
                    />
                    Document public
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Utilisateur (optionnel)
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={uploadForm.userId}
                    onChange={(e) => setUploadForm({ ...uploadForm, userId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Devis (optionnel)
                  </label>
                  <input
                    type="text"
                    name="devisId"
                    value={uploadForm.devisId}
                    onChange={(e) => setUploadForm({ ...uploadForm, devisId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fichier PDF *
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploading ? 'Téléversement...' : 'Téléverser'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des documents */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-gray-900">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-3 py-2 text-left">Nom</th>
                <th className="border px-3 py-2 text-left">Type</th>
                <th className="border px-3 py-2 text-left">Description</th>
                <th className="border px-3 py-2 text-left">Accès</th>
                <th className="border px-3 py-2 text-left">Utilisateur</th>
                <th className="border px-3 py-2 text-left">Devis</th>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">Aucun document trouvé.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 font-medium">{doc.nom}</td>
                    <td className="border px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.type === 'formation' ? 'bg-blue-100 text-blue-800' :
                        doc.type === 'contrat' ? 'bg-green-100 text-green-800' :
                        doc.type === 'general' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="border px-3 py-2 max-w-xs truncate">{doc.description || '-'}</td>
                    <td className="border px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.public ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.public ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="border px-3 py-2">
                      {doc.user ? `${doc.user.prenom} ${doc.user.nom}` : '-'}
                    </td>
                    <td className="border px-3 py-2">
                      {doc.devis ? doc.devis.numero : '-'}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="border px-3 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(doc.id, doc.nom)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Télécharger"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleView(doc.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Voir"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
} 