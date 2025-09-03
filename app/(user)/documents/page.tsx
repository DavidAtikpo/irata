'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentArrowDownIcon,
  DocumentIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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

interface Contrat {
  id: string;
  statut: string;
  createdAt: string;
  devis: {
    numero: string;
    montant: number;
    dateFormation?: string;
    demande: {
      session: string;
    };
  };
}

interface Invoice {
  id: string;
  amount: number;
  paymentStatus: string;
  paidAmount?: number;
  createdAt: string;
  contratId: string;
  contrat: {
    devis: {
      numero: string;
      demande: {
        session: string;
      };
    };
  };
}

export default function UserDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasValidatedContract, setHasValidatedContract] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchContrats();
    }
  }, [status, session, router]);

  const fetchContrats = async () => {
    try {
      const response = await fetch('/api/user/contrats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contrats');
      }
      const data = await response.json();
      setContrats(data);
      
      // Vérifier si l'utilisateur a un contrat validé
      const validatedContract = data.find((contrat: Contrat) => contrat.statut === 'VALIDE');
      setHasValidatedContract(!!validatedContract);
      
      // Récupérer les factures pour vérifier le paiement
      await fetchInvoices();
    } catch (error) {
      setError('Erreur lors de la récupération des contrats');
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/user/invoice');
      
      // Si l'utilisateur n'a pas de factures (404), c'est normal
      if (response.status === 404) {
        console.log('Aucune facture trouvée pour cet utilisateur');
        setInvoices([]);
        setHasPaid(false);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures');
      }
      
      const data = await response.json();
      
      // Debug: afficher la structure des données
      console.log('Structure des données invoice:', data);
      console.log('Type de data:', typeof data);
      console.log('Est-ce un tableau?', Array.isArray(data));
      
      setInvoices(data);
      
      // Vérifier si data est un tableau avant d'utiliser .some()
      if (Array.isArray(data)) {
        // Vérifier si l'utilisateur a payé (total ou partiel)
        const hasAnyPayment = data.some((invoice: Invoice) => 
          invoice.paymentStatus === 'PAID' || invoice.paymentStatus === 'PARTIAL'
        );
        setHasPaid(hasAnyPayment);
        
        // Récupérer les documents si l'utilisateur a payé
        if (hasAnyPayment) {
          await fetchDocuments();
        }
      } else {
        // Si data n'est pas un tableau, essayer d'extraire les factures
        console.log('Data n\'est pas un tableau, structure:', data);
        
        // Essayer différentes structures possibles
        let invoicesArray = [];
        if (data.invoices && Array.isArray(data.invoices)) {
          invoicesArray = data.invoices;
        } else if (data.data && Array.isArray(data.data)) {
          invoicesArray = data.data;
        } else if (data.factures && Array.isArray(data.factures)) {
          invoicesArray = data.factures;
        }
        
        if (invoicesArray.length > 0) {
          const hasAnyPayment = invoicesArray.some((invoice: Invoice) => 
            invoice.paymentStatus === 'PAID' || invoice.paymentStatus === 'PARTIAL'
          );
          setHasPaid(hasAnyPayment);
          
          if (hasAnyPayment) {
            await fetchDocuments();
          }
        } else {
          // Aucune facture trouvée
          setHasPaid(false);
        }
      }
      
      // Toujours terminer le chargement
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      // En cas d'erreur, on considère que l'utilisateur n'a pas payé
      setHasPaid(false);
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/user/documents');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const data = await response.json();
      setDocuments(data);
      setFilteredDocuments(data);
      
      // Enregistrer automatiquement l'action "RECEIVED" pour tous les documents
      data.forEach(async (doc: Document) => {
        await recordAction(doc.id, 'RECEIVED');
      });
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

  const recordAction = async (documentId: string, action: 'RECEIVED' | 'OPENED' | 'DOWNLOADED') => {
    try {
      console.log(`🔍 Enregistrement de l'action: ${action} pour le document ${documentId}`);
      const response = await fetch(`/api/documents/${documentId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Action ${action} enregistrée avec succès:`, result);
      } else {
        console.error(`❌ Erreur lors de l'enregistrement de l'action ${action}:`, response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de l\'action:', error);
    }
  };

  const handleDownload = async (documentId: string, nom: string) => {
    // Enregistrer l'action de téléchargement
    await recordAction(documentId, 'DOWNLOADED');
    
    const link = document.createElement('a');
    link.href = `/api/documents/${documentId}/local`; // Utiliser stockage local en priorité
    link.download = nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = async (documentId: string) => {
    // Enregistrer l'action d'ouverture
    await recordAction(documentId, 'OPENED');
    
    // Ouvrir le document dans un nouvel onglet
    window.open(`/api/documents/${documentId}/local`, '_blank');
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'formation':
        return (
          <div className="w-6 h-8 bg-blue-500 rounded flex items-center justify-center text-white relative shadow-sm">
            <DocumentIcon className="h-3 w-3" />
            <span className="absolute bottom-0.5 text-xs font-bold">PDF</span>
          </div>
        );
      case 'contrat':
        return (
          <div className="w-6 h-8 bg-green-500 rounded flex items-center justify-center text-white relative shadow-sm">
            <DocumentIcon className="h-3 w-3" />
            <span className="absolute bottom-0.5 text-xs font-bold">PDF</span>
          </div>
        );
      case 'procedure':
        return (
          <div className="w-6 h-8 bg-purple-500 rounded flex items-center justify-center text-white relative shadow-sm">
            <DocumentIcon className="h-3 w-3" />
            <span className="absolute bottom-0.5 text-xs font-bold">PDF</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-8 bg-gray-500 rounded flex items-center justify-center text-white relative shadow-sm">
            <DocumentIcon className="h-3 w-3" />
            <span className="absolute bottom-0.5 text-xs font-bold">PDF</span>
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
      <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-2 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas payé, pas d'accès aux documents du tout
  if (!hasPaid) {
    return (
      <div className="py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Retour
            </button>
            <div className="mt-2 sm:mt-4 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Mes documents</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                Accédez à vos documents de formation et contractuels
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
            <ExclamationTriangleIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-400 mb-3" />
            <h3 className="text-sm sm:text-base font-medium text-red-800 mb-2">
              Accès aux documents bloqué
            </h3>
            <p className="text-xs sm:text-sm text-red-700 mb-4">
              Vous devez effectuer un paiement (total ou partiel) pour accéder aux documents de formation.
            </p>
            
            {contrats.length > 0 && (
              <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Vos contrats :</h4>
                <div className="space-y-2">
                  {contrats.map((contrat) => (
                    <div key={contrat.id} className="flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Devis #{contrat.devis.numero}</span>
                        <span className="text-gray-500 ml-2">- {contrat.devis.demande.session}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contrat.statut === 'VALIDE' 
                          ? 'bg-green-100 text-green-800' 
                          : contrat.statut === 'SIGNE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contrat.statut === 'VALIDE' ? 'Validé' : 
                         contrat.statut === 'SIGNE' ? 'Signé' : 
                         contrat.statut === 'EN_ATTENTE' ? 'En attente' : contrat.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Prochaines étapes
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Effectuez le paiement de votre formation</li>
                <li>• Le paiement peut être total ou partiel</li>
                <li>• Vous recevrez un email de confirmation</li>
                <li>• Les documents seront alors disponibles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur a payé mais pas de contrat validé, il voit seulement les documents publics
  if (!hasValidatedContract && hasPaid) {
    return (
      <div className="py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Retour
            </button>
            <div className="mt-2 sm:mt-4 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Mes documents</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                Accédez à vos documents de formation et contractuels
              </p>
            </div>
          </div>

          {/* Avertissement pour contrat non validé */}
          <div className="mb-3 sm:mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <LockClosedIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">
                  Accès limité aux documents
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700">
                  Vous avez payé mais votre contrat n'est pas encore validé. Seuls les documents publics sont visibles.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-3 sm:mb-4 rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Barre de filtres */}
          <div className="mb-3 sm:mb-4 bg-white p-2 sm:p-3 lg:p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                Documents publics ({filteredDocuments.length})
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <AdjustmentsHorizontalIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Filtres</span>
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les documents publics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 sm:pl-8 lg:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Type de document</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
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
                      className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Affichage des documents publics */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-6">
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.nom}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(doc.type)}`}>
                            {getTypeLabel(doc.type)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(doc.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Ouvrir"
                            >
                              <DocumentIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id, doc.nom)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Télécharger"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Information sur les contrats */}
          {contrats.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 mb-2">Vos contrats</h3>
              <div className="space-y-2">
                {contrats.map((contrat) => (
                  <div key={contrat.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-medium">Devis #{contrat.devis.numero}</span>
                      <span className="text-gray-500 ml-2">- {contrat.devis.demande.session}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contrat.statut === 'VALIDE' 
                        ? 'bg-green-100 text-green-800' 
                        : contrat.statut === 'SIGNE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contrat.statut === 'VALIDE' ? 'Validé' : 
                       contrat.statut === 'SIGNE' ? 'Signé' : 
                       contrat.statut === 'EN_ATTENTE' ? 'En attente' : contrat.statut}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-blue-800 mt-3">
                Une fois votre contrat validé, vous aurez accès à tous les documents de formation.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-3 sm:mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Retour
          </button>
          <div className="mt-2 sm:mt-4 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Mes documents</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              Accédez à vos documents de formation et contractuels
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 rounded-md bg-red-50 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Barre de filtres */}
        <div className="mb-3 sm:mb-4 bg-white p-2 sm:p-3 lg:p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              {hasValidatedContract ? 'Mes documents' : 'Documents publics'} ({filteredDocuments.length})
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <AdjustmentsHorizontalIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Filtres</span>
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans mes documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 sm:pl-8 lg:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Type de document</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
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
                    className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
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
            <div className="text-center py-8 sm:py-12">
              <DocumentIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
              <h3 className="mt-2 text-xs sm:text-sm lg:text-base font-medium text-gray-900">Aucun document trouvé</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de documents disponibles.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-6">
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.nom}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {doc.description}
                                </div>
                              )}
                              {doc.devis && (
                                <div className="text-xs text-gray-500">
                                  Devis: {doc.devis.numero}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(doc.type)}`}>
                            {getTypeLabel(doc.type)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {doc.public ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Privé
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(doc.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Ouvrir"
                            >
                              <DocumentIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id, doc.nom)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Télécharger"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 mb-2">Information</h3>
          <p className="text-xs sm:text-sm text-blue-800">
            Cette section contient tous les documents qui vous sont destinés, y compris les documents publics accessibles à tous les utilisateurs et ceux spécifiquement liés à vos devis.
          </p>
        </div>
      </div>
    </div>
  );
} 
