'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  UserIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

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
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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
      setFilteredDocuments(data);
    } catch (error) {
      setError('Erreur lors de la récupération des documents');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logique de filtrage
  const applyFilters = () => {
    let filtered = [...documents];

    // Filtre par nom
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return docDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return docDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return docDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredDocuments(filtered);
  };

  // Effet pour appliquer les filtres
  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, dateFilter, typeFilter]);

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

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'formation':
        return (
          <div className="w-16 h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white relative shadow-md">
            <DocumentIcon className="h-8 w-8" />
            <span className="absolute bottom-1 text-xs font-bold">PDF</span>
          </div>
        );
      case 'contrat':
        return (
          <div className="w-16 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white relative shadow-md">
            <DocumentIcon className="h-8 w-8" />
            <span className="absolute bottom-1 text-xs font-bold">PDF</span>
          </div>
        );
      case 'procedure':
        return (
          <div className="w-16 h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white relative shadow-md">
            <DocumentIcon className="h-8 w-8" />
            <span className="absolute bottom-1 text-xs font-bold">PDF</span>
          </div>
        );
      default:
        return (
          <div className="w-16 h-20 bg-gray-500 rounded-lg flex items-center justify-center text-white relative shadow-md">
            <DocumentIcon className="h-8 w-8" />
            <span className="absolute bottom-1 text-xs font-bold">PDF</span>
          </div>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'formation': return 'Formation';
      case 'contrat': return 'Contrat';
      case 'procedure': return 'Procédure';
      case 'general': return 'Général';
      default: return type;
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      {/* Avertissement Cloudinary */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Problème Cloudinary détecté</h3>
              <p className="mt-1 text-sm text-amber-700">
                Le service Cloudinary est actuellement hors service ("Customer marked as untrusted"). 
                Les nouveaux documents sont automatiquement sauvegardés en stockage local.
              </p>
              <div className="mt-3">
                <Link 
                  href="/admin/cloudinary-info"
                  className="text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Voir les détails et solutions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        {/* Barre de filtres */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Documents ({filteredDocuments.length})
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filtres
            </button>
          </div>

          {/* Barre de recherche rapide */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">Tous les types</option>
                  <option value="formation">Formation</option>
                  <option value="contrat">Contrat</option>
                  <option value="procedure">Procédure</option>
                  <option value="general">Général</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setDateFilter('all');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Affichage des documents sous forme de fichiers */}
        <div className="bg-white">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Commencez par téléverser votre premier document.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  {/* Icône du fichier - cliquable pour ouvrir */}
                  <div 
                    className="flex justify-center mb-2 cursor-pointer" 
                    onClick={() => handleView(doc.id)}
                    title="Cliquer pour ouvrir le document"
                  >
                    {getDocumentIcon(doc.type)}
                  </div>

                  {/* Nom du fichier */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.nom}>
                      {doc.nom}
                    </h4>
                    {doc.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate" title={doc.description}>
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Métadonnées */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.type === 'formation' ? 'bg-blue-100 text-blue-800' :
                        doc.type === 'contrat' ? 'bg-green-100 text-green-800' :
                        doc.type === 'procedure' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getTypeLabel(doc.type)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    {doc.public && (
                      <div className="flex justify-center">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Public
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions (visibles au hover) */}
                  <div className="mt-3 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc.id, doc.nom);
                      }}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                      title="Télécharger"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
} 