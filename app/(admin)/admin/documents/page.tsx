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
  AdjustmentsHorizontalIcon,
  EyeIcon
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
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Documents</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gérez les documents de formation et les ressources
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:w-auto"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
              >
                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                Nouveau document
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className={`mb-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom du document..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Filtre par type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="formation">Formation</option>
                  <option value="contrat">Contrat</option>
                  <option value="procedure">Procédure</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Filtre par date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">
                  {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} trouvé{filteredDocuments.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Total: {documents.length}</span>
                <span>•</span>
                <span>Publics: {documents.filter(d => d.public).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des documents */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Commencez par téléverser votre premier document.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  {/* Icône du fichier - cliquable pour ouvrir */}
                  <div 
                    className="flex justify-center mb-3 cursor-pointer" 
                    onClick={() => handleView(doc.id)}
                    title="Cliquer pour ouvrir le document"
                  >
                    {getDocumentIcon(doc.type)}
                  </div>

                  {/* Nom du fichier */}
                  <div className="text-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.nom}>
                      {doc.nom}
                    </h4>
                    {doc.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={doc.description}>
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Métadonnées */}
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                          Public
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions (visibles au hover sur desktop, toujours visibles sur mobile) */}
                  <div className="mt-3 flex justify-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(doc.id);
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors"
                      title="Voir"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc.id, doc.nom);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                      title="Télécharger"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
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