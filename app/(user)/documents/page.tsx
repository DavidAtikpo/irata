'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentArrowDownIcon,
  DocumentIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  nom: string;
  description?: string;
  url: string;
  type: string;
  public: boolean;
  createdAt: string;
  devis?: { numero: string };
}

export default function UserDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status, session, router]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/user/documents');
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

    setFilteredDocuments(filtered);
  };

  // Effet pour appliquer les filtres
  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, typeFilter]);

  const handleDownload = (documentId: string, nom: string) => {
    const link = document.createElement('a');
    link.href = `/api/documents/${documentId}/local`; // Utiliser stockage local en priorité
    link.download = nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'formation': return 'bg-blue-100 text-blue-800';
      case 'contrat': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour
          </button>
          <div className="mt-4 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes documents</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Accédez à vos documents de formation et contractuels
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Barre de filtres */}
        <div className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Mes documents ({filteredDocuments.length})
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Filtres
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans mes documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
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
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Affichage des documents sous forme de fichiers */}
        <div className="bg-white rounded-lg shadow">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de documents disponibles.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  {/* Icône du fichier - cliquable pour ouvrir */}
                  <div 
                    className="flex justify-center mb-2 cursor-pointer" 
                    onClick={() => window.open(`/api/documents/${doc.id}/local`, '_blank')}
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
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(doc.type)}`}>
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
                    {doc.devis && (
                      <div className="text-xs text-gray-500 text-center">
                        Devis: {doc.devis.numero}
                      </div>
                    )}
                  </div>

                  {/* Actions (visibles au hover) */}
                  <div className="mt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Information</h3>
          <p className="text-blue-800 text-sm">
            Cette section contient tous les documents qui vous sont destinés, y compris les documents publics accessibles à tous les utilisateurs et ceux spécifiquement liés à vos devis.
          </p>
        </div>
      </div>
    </div>
  );
} 