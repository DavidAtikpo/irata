'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../../../hooks/useNotifications';
import {
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowDownTrayIcon as DownloadIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  question: string;
  required: boolean;
  options?: string[];
  correctAnswers: string[];
  points: number;
}

interface FormulaireQuotidien {
  id: string;
  titre: string;
  description?: string;
  session: string;
  niveau: string;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  valide: boolean;
  questions: Question[];
  nombreReponses: number;
}

interface Reponse {
  id: string;
  userId: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
  };
  formulaireId: string;
  dateReponse: string;
  reponses: {
    questionId: string;
    reponse: string;
    pointsObtenus: number;
    correcte: boolean;
  }[];
  totalPoints: number;
  pointsMax: number;
  moyenne: number;
  note: string;
}

export default function ReponsesFormulairesQuotidiensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [selectedFormulaire, setSelectedFormulaire] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReponse, setSelectedReponse] = useState<Reponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalReponses: 0,
    moyenneGenerale: 0,
    meilleurScore: 0,
    tauxReussite: 0
  });

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchFormulaires();
      fetchReponses();
    }
  }, [status, session, router]);

  const fetchFormulaires = async () => {
    try {
      const response = await fetch('/api/admin/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setFormulaires(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les formulaires');
    }
  };

  const fetchReponses = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/formulaires-quotidiens/reponses');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réponses');
      }
      const data = await response.json();
      setReponses(data);
      
      // Calculer les statistiques
      if (data.length > 0) {
        const totalReponses = data.length;
        const moyenneGenerale = data.reduce((sum: number, r: Reponse) => sum + r.moyenne, 0) / totalReponses;
        const meilleurScore = Math.max(...data.map((r: Reponse) => r.moyenne));
        const tauxReussite = (data.filter((r: Reponse) => r.moyenne >= 10).length / totalReponses) * 100;
        
        setStats({
          totalReponses,
          moyenneGenerale: Math.round(moyenneGenerale * 100) / 100,
          meilleurScore: Math.round(meilleurScore * 100) / 100,
          tauxReussite: Math.round(tauxReussite * 100) / 100
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les réponses');
    } finally {
      setLoading(false);
    }
  };

  const getNote = (moyenne: number): string => {
    if (moyenne >= 16) return 'Excellent';
    if (moyenne >= 14) return 'Très bien';
    if (moyenne >= 12) return 'Bien';
    if (moyenne >= 10) return 'Assez bien';
    if (moyenne >= 8) return 'Passable';
    if (moyenne >= 6) return 'Insuffisant';
    return 'Très insuffisant';
  };

  const getNoteColor = (moyenne: number): string => {
    if (moyenne >= 16) return 'text-emerald-600 bg-emerald-100';
    if (moyenne >= 14) return 'text-blue-600 bg-blue-100';
    if (moyenne >= 12) return 'text-green-600 bg-green-100';
    if (moyenne >= 10) return 'text-yellow-600 bg-yellow-100';
    if (moyenne >= 8) return 'text-orange-600 bg-orange-100';
    if (moyenne >= 6) return 'text-red-600 bg-red-100';
    return 'text-red-800 bg-red-200';
  };

  const handleViewDetails = (reponse: Reponse) => {
    setSelectedReponse(reponse);
    setShowDetailsModal(true);
  };

  const handleDownloadReponse = async (reponse: Reponse) => {
    try {
      const formulaire = formulaires.find(f => f.id === reponse.formulaireId);
      if (!formulaire) return;

      // Utiliser la route PDF existante
      const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaire.id}/reponses/${reponse.id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/html')) {
        // Si c'est du HTML, l'ouvrir dans un nouvel onglet
        const htmlContent = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          
          addNotification(
            'NEW_REPONSE',
            `Document HTML de la réponse de ${reponse.user.prenom} ${reponse.user.nom} ouvert dans un nouvel onglet. Utilisez Ctrl+P pour l'imprimer en PDF.`,
            '/admin/formulaires-quotidiens/reponses'
          );
        }
      } else {
        // Si c'est un PDF, le télécharger normalement
        const pdfBlob = await response.blob();
        
        // Créer et télécharger le fichier PDF
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reponse-${reponse.user.prenom}-${reponse.user.nom}-${formulaire.titre}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer l'URL
        window.URL.revokeObjectURL(url);

        addNotification(
          'NEW_REPONSE',
          `PDF de la réponse de ${reponse.user.prenom} ${reponse.user.nom} téléchargé avec succès`,
          '/admin/formulaires-quotidiens/reponses'
        );
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      setError('Erreur lors de la génération du PDF');
    }
  };

  const filteredReponses = selectedFormulaire === 'all' 
    ? reponses 
    : reponses.filter(r => r.formulaireId === selectedFormulaire);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement des réponses...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 mb-4"
          >
            ← Retour aux formulaires
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Réponses aux Formulaires Quotidiens</h1>
          <p className="mt-2 text-gray-600">
            Consultez les réponses des stagiaires et leurs performances
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques générales */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Total Réponses</dt>
                <dd className="text-2xl font-bold text-gray-900">{stats.totalReponses}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Moyenne Générale</dt>
                <dd className="text-2xl font-bold text-gray-900">{stats.moyenneGenerale}/20</dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Meilleur Score</dt>
                <dd className="text-2xl font-bold text-gray-900">{stats.meilleurScore}/20</dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Taux de Réussite</dt>
                <dd className="text-2xl font-bold text-gray-900">{stats.tauxReussite}%</dd>
              </div>
            </div>
          </div>
        </div>

                {/* Filtres */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filtrer par formulaire:</label>
              <select
                value={selectedFormulaire}
                onChange={(e) => setSelectedFormulaire(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les formulaires</option>
                {formulaires.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.titre} - {form.session}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchReponses}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Actualiser
              </button>
            </div>
            
            {/* Bouton pour télécharger toutes les réponses du formulaire sélectionné */}
            {selectedFormulaire !== 'all' && (
              <button
                onClick={async () => {
                  try {
                    const formulaire = formulaires.find(f => f.id === selectedFormulaire);
                    if (!formulaire) return;
                    
                    // Utiliser la route PDF pour toutes les réponses
                    const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaire.id}/reponses/pdf`);
                    
                    if (!response.ok) {
                      throw new Error('Erreur lors de la génération du PDF');
                    }
                    
                    const pdfBlob = await response.blob();
                    const url = window.URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `toutes-reponses-${formulaire.titre}-${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    
                    addNotification(
                      'NEW_REPONSE',
                      `PDF de toutes les réponses au formulaire "${formulaire.titre}" téléchargé avec succès`,
                      '/admin/formulaires-quotidiens/reponses'
                    );
                  } catch (error) {
                    console.error('Erreur lors du téléchargement PDF:', error);
                    setError('Erreur lors de la génération du PDF de toutes les réponses');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Télécharger toutes les réponses (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Liste des réponses */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Réponses des stagiaires ({filteredReponses.length})
            </h3>
          </div>
          
          {filteredReponses.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réponse</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedFormulaire === 'all' 
                  ? 'Aucun stagiaire n\'a encore répondu aux formulaires'
                  : 'Aucun stagiaire n\'a encore répondu à ce formulaire'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stagiaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formulaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Moyenne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReponses.map((reponse) => (
                    <tr key={reponse.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {reponse.user.prenom.charAt(0)}{reponse.user.nom.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reponse.user.prenom} {reponse.user.nom}
                            </div>
                            <div className="text-sm text-gray-500">{reponse.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formulaires.find(f => f.id === reponse.formulaireId)?.titre || 'Formulaire inconnu'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formulaires.find(f => f.id === reponse.formulaireId)?.session || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reponse.dateReponse).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reponse.totalPoints}/{reponse.pointsMax} points
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((reponse.totalPoints / reponse.pointsMax) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {reponse.moyenne}/20
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNoteColor(reponse.moyenne)}`}>
                          {getNote(reponse.moyenne)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(reponse)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReponse(reponse)}
                          className="text-green-600 hover:text-green-900 p-1 rounded ml-2"
                          title="Télécharger PDF"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal des détails de la réponse */}
        {showDetailsModal && selectedReponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header de la modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Détails de la réponse
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedReponse.user.prenom} {selectedReponse.user.nom} - {formulaires.find(f => f.id === selectedReponse.formulaireId)?.titre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReponse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenu de la modal */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Informations générales */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Stagiaire</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {selectedReponse.user.prenom} {selectedReponse.user.nom}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{selectedReponse.user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedReponse.dateReponse).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Score</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {selectedReponse.totalPoints}/{selectedReponse.pointsMax} ({selectedReponse.moyenne}/20)
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Détail des questions et réponses */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Questions et réponses</h4>
                  
                  {selectedReponse.reponses.map((reponseQuestion, index) => {
                    const formulaire = formulaires.find(f => f.id === selectedReponse.formulaireId);
                    const question = formulaire?.questions.find(q => q.id === reponseQuestion.questionId);
                    
                    if (!question) return null;
                    
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{question.question}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.type}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  {question.points} point{question.points !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              reponseQuestion.correcte 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {reponseQuestion.correcte ? '✅ Correct' : '❌ Incorrect'}
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              {reponseQuestion.pointsObtenus}/{question.points} pts
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-11 space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Réponse donnée</dt>
                            <dd className="text-sm text-gray-900">
                              {Array.isArray(reponseQuestion.reponse) 
                                ? reponseQuestion.reponse.join(', ') 
                                : reponseQuestion.reponse}
                            </dd>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3">
                            <dt className="text-sm font-medium text-blue-700 mb-1">Bonne(s) réponse(s)</dt>
                            <dd className="text-sm text-blue-900">
                              {question.correctAnswers.join(', ')}
                            </dd>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer de la modal */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Score total: {selectedReponse.totalPoints}/{selectedReponse.pointsMax} points 
                  ({Math.round((selectedReponse.totalPoints / selectedReponse.pointsMax) * 100)}%)
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDownloadReponse(selectedReponse)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    <DownloadIcon className="h-4 w-4 mr-2 inline" />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedReponse(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
