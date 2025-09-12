'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../../hooks/useNotifications';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Correction {
  id: string;
  formulaireId: string;
  formulaireTitre: string;
  formulaireSession: string;
  dateReponse: string;
  dateCorrection: string;
  decision: 'ACCEPTE' | 'A_REVOIR' | 'REFUSE';
  commentaire: string | null;
  score: number | null;
  adminNom: string;
  reponseId: string;
  questions: any[];
  reponses: any[];
  reponsesApres?: any[] | null;
  versionApres?: number | null;
  dateReponseApres?: string | null;
}

export default function CorrectionsFormulairesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'USER') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchCorrections();
    }
  }, [status, session, router]);

  const fetchCorrections = async () => {
    try {
      setError(null);
      const response = await fetch('/api/user/formulaires-quotidiens/corrections', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des corrections');
      }
      const data = await response.json();
      setCorrections(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les corrections');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'ACCEPTE':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'A_REVOIR':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'REFUSE':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'ACCEPTE':
        return 'Accepté';
      case 'A_REVOIR':
        return 'À revoir';
      case 'REFUSE':
        return 'Refusé';
      default:
        return decision;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'ACCEPTE':
        return 'text-green-600 bg-green-100';
      case 'A_REVOIR':
        return 'text-yellow-600 bg-yellow-100';
      case 'REFUSE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewDetails = (correction: Correction) => {
    setSelectedCorrection(correction);
    setShowDetailsModal(true);
  };

  const renderQuestionResponse = (question: any, index: number) => {
    // Associer la réponse à la question par questionId pour éviter les décalages d'index
    const response = selectedCorrection?.reponses?.find((r: any) => r.questionId === question.id);
    
    // Extraire la réponse simple de l'objet complexe
    const getSimpleResponse = (responseObj: any) => {
      if (!responseObj) return null;
      
      // Si c'est un objet avec une propriété 'reponse', l'utiliser
      if (typeof responseObj === 'object' && responseObj.reponse !== undefined) {
        return responseObj.reponse;
      }
      
      // Si c'est déjà une chaîne simple, la retourner
      if (typeof responseObj === 'string') {
        return responseObj;
      }
      
      // Si c'est un tableau, le retourner tel quel (pas de join pour les checkboxes)
      if (Array.isArray(responseObj)) {
        return responseObj;
      }
      
      // Sinon, convertir en chaîne
      return String(responseObj);
    };

    const simpleResponse = getSimpleResponse(response);
    
    // Utiliser les données de scoring calculées côté serveur
    const isResponseCorrect = response?.correcte || false;
    const pointsObtenus = response?.pointsObtenus || 0;
    
    return (
      <div key={index} className="border border-gray-200 rounded-lg p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h5 className="text-sm font-medium text-gray-900">
              Question {index + 1}: {question.question}
            </h5>
            <p className="text-xs text-gray-500 mt-1">
              Type: {question.type} | Points: {question.points}
            </p>
          </div>
          <div className="ml-4 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isResponseCorrect 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isResponseCorrect ? '✅ Correct' : '❌ Incorrect'}
            </span>
            <span className="text-xs text-gray-500">
              {pointsObtenus}/{question.points} pts
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Votre réponse:</label>
            <div className={`mt-1 p-2 rounded border text-sm ${
              isResponseCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {simpleResponse ? (
                <span className={isResponseCorrect ? 'text-green-900' : 'text-red-900'}>
                  {Array.isArray(simpleResponse) ? simpleResponse.join(', ') : simpleResponse}
                </span>
              ) : (
                <span className="text-gray-500 italic">Aucune réponse</span>
              )}
            </div>
          </div>
          
          {(question.type === 'CHOIX_MULTIPLE' || question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && question.options && (
            <div>
              <label className="text-xs font-medium text-gray-700">Options disponibles:</label>
              <div className="mt-1 space-y-1">
                {question.options.map((option: string, optIndex: number) => {
                  let isSelected = false;
                  
                  if (question.type === 'checkbox') {
                    // Pour les checkboxes, vérifier si l'option est dans le tableau
                    const userArray = Array.isArray(simpleResponse) ? simpleResponse : [simpleResponse];
                    isSelected = userArray.includes(option);
                  } else {
                    // Pour radio et choix multiple, comparaison directe
                    isSelected = simpleResponse === option;
                  }
                  
                  const isCorrectOption = question.correctAnswers?.includes(option);
                  return (
                    <div key={optIndex} className={`text-xs p-1 rounded ${
                      isSelected && isCorrectOption 
                        ? 'bg-green-100 text-green-800' 
                        : isSelected && !isCorrectOption
                        ? 'bg-red-100 text-red-800'
                        : isCorrectOption
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600'
                    }`}>
                      {isSelected && isCorrectOption && '✅ '}
                      {isSelected && !isCorrectOption && '❌ '}
                      {!isSelected && isCorrectOption && '✓ '}
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(question.type === 'radio' || question.type === 'select' || question.type === 'checkbox' || question.type === 'CHOIX_MULTIPLE') && question.correctAnswers && question.correctAnswers.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-700">Bonne(s) réponse(s):</label>
              <div className="mt-1 p-2 bg-blue-50 rounded border text-sm text-blue-900">
                {Array.isArray(question.correctAnswers) ? question.correctAnswers.join(', ') : String(question.correctAnswers)}
              </div>
            </div>
          )}
          
          {question.type === 'VRAI_FAUX' && (
            <div>
              <label className="text-xs font-medium text-gray-700">Réponse correcte:</label>
              <div className="mt-1 text-xs text-gray-600">
                {question.correctAnswers?.[0] ? 'Vrai' : 'Faux'}
              </div>
            </div>
          )}
          
          {(question.type === 'TEXTE_LIBRE' || question.type === 'text') && question.correctAnswers?.[0] && (
            <div>
              <label className="text-xs font-medium text-gray-700">Réponse attendue:</label>
              <div className="mt-1 p-2 bg-blue-50 rounded border text-sm text-blue-900">
                {question.correctAnswers[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement des corrections...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 mb-4"
          >
            ← Retour aux formulaires
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Mes Corrections</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Consultez les corrections de vos formulaires quotidiens
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

        {/* Liste des corrections */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Corrections reçues ({corrections.length})
            </h3>
          </div>
          
          {corrections.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <DocumentTextIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune correction</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Vous n'avez pas encore reçu de corrections pour vos formulaires
              </p>
            </div>
          ) : (
            <>
              {/* Version mobile - cartes */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {corrections.map((correction) => (
                    <div key={correction.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {correction.formulaireTitre}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {correction.formulaireSession}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(correction)}
                          className="ml-2 p-1 text-indigo-600 hover:text-indigo-900 rounded"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Soumis:</span>
                          <div className="text-gray-900">
                            {new Date(correction.dateReponse).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Corrigé:</span>
                          <div className="text-gray-900">
                            {new Date(correction.dateCorrection).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Décision:</span>
                          <div className="flex items-center mt-1">
                            {getDecisionIcon(correction.decision)}
                            <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(correction.decision)}`}>
                              {getDecisionText(correction.decision)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <div className="text-gray-900">
                            {(correction as any).scoreAffiche ? `${(correction as any).scoreAffiche}/20` : (correction.score ? `${correction.score}/20` : '-')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Correcteur: {correction.adminNom}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version desktop - tableau */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formulaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de soumission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de correction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Décision
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correcteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {corrections.map((correction) => (
                      <tr key={correction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {correction.formulaireTitre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {correction.formulaireSession}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(correction.dateReponse).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(correction.dateCorrection).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getDecisionIcon(correction.decision)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(correction.decision)}`}>
                              {getDecisionText(correction.decision)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(correction as any).scoreAffiche ? `${(correction as any).scoreAffiche}/20` : (correction.score ? `${correction.score}/20` : '-')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {correction.adminNom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(correction)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Modal des détails de la correction */}
        {showDetailsModal && selectedCorrection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header de la modal */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getDecisionIcon(selectedCorrection.decision)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                      Détails de la correction
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {selectedCorrection.formulaireTitre} - {selectedCorrection.formulaireSession}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCorrection(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenu de la modal */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Informations générales */}
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Informations de la correction</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Date de soumission</dt>
                        <dd className="text-xs sm:text-sm text-gray-900">
                          {new Date(selectedCorrection.dateReponse).toLocaleDateString('fr-FR')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Date de correction</dt>
                        <dd className="text-xs sm:text-sm text-gray-900">
                          {new Date(selectedCorrection.dateCorrection).toLocaleDateString('fr-FR')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Décision</dt>
                        <dd className="text-xs sm:text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(selectedCorrection.decision)}`}>
                            {getDecisionText(selectedCorrection.decision)}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Correcteur</dt>
                        <dd className="text-xs sm:text-sm text-gray-900">{selectedCorrection.adminNom}</dd>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  {(((selectedCorrection as any).scoreAffiche ?? selectedCorrection.score) !== null && ((selectedCorrection as any).scoreAffiche ?? selectedCorrection.score) !== undefined) && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Score</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {((selectedCorrection as any).scoreAffiche ?? selectedCorrection.score)}/20
                      </div>
                    </div>
                  )}

                  {/* Commentaire */}
                  {selectedCorrection.commentaire && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">Commentaires et corrections</h4>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedCorrection.commentaire}
                      </div>
                    </div>
                  )}

                  {/* Questions et réponses */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Questions et réponses</h4>
                    <div className="space-y-4">
                      {selectedCorrection.questions && selectedCorrection.questions.map((question: any, index: number) => 
                        renderQuestionResponse(question, index)
                      )}
                    </div>
                  </div>

                  {/* Réponses après correction (si une nouvelle version a été soumise) */}
                  {Array.isArray((selectedCorrection as any).reponsesApres) && (selectedCorrection as any).reponsesApres.length > 0 && (
                    <div className="bg-white border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Après correction</h4>
                        <div className="text-xs text-gray-500">
                          Version {(selectedCorrection as any).versionApres ?? ''}
                          {(selectedCorrection as any).dateReponseApres && (
                            <span className="ml-2">· {new Date((selectedCorrection as any).dateReponseApres).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {selectedCorrection.questions && selectedCorrection.questions.map((question: any, index: number) => {
                          // Remplacer temporairement la liste des réponses par celles "après" pour le rendu
                          const saved = selectedCorrection.reponses;
                          (selectedCorrection as any).reponses = (selectedCorrection as any).reponsesApres;
                          const node = renderQuestionResponse(question, index);
                          (selectedCorrection as any).reponses = saved;
                          return node;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message d'action si à revoir */}
                  {selectedCorrection.decision === 'A_REVOIR' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-orange-800">Action requise</h3>
                          <div className="mt-1 text-sm text-orange-700">
                            <p>Veuillez consulter les commentaires ci-dessus et apporter les corrections nécessaires à votre formulaire.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer de la modal */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Correction reçue le {new Date(selectedCorrection.dateCorrection).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCorrection(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  {selectedCorrection.decision === 'A_REVOIR' && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedCorrection(null);
                        router.push(`/formulaires-quotidiens?correction=${selectedCorrection.reponseId}`);
                      }}
                      className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Revoir le formulaire
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

