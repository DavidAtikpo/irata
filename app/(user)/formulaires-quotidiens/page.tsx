'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  question: string;
  options?: string[];
  required: boolean;
}

interface FormulaireQuotidien {
  id: string;
  titre: string;
  description?: string;
  session: string;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  valide: boolean; 
  questions: Question[];
  dejaRepondu: boolean;
  dateDerniereReponse?: string;
}

interface ReponseFormulaire {
  id: string;
  formulaireId: string;
  dateReponse: string;
  reponses: any[];
  commentaires?: string;
  soumis: boolean;
}

export default function FormulairesQuotidiensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormulaire, setSelectedFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'completed'>('all');

  const [formData, setFormData] = useState<{
    [questionId: string]: any;
    commentaires: string;
  }>({
    commentaires: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (status === 'authenticated') {
      fetchFormulaires();
    }
  }, [status, session, router]);

  const fetchFormulaires = async () => {
    try {
      const response = await fetch('/api/user/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setFormulaires(data.filter((f: FormulaireQuotidien) => f.valide));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartForm = (formulaire: FormulaireQuotidien) => {
    setSelectedFormulaire(formulaire);
    setFormData({ commentaires: '' });
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormulaire) return;

    const questionsObligatoires = selectedFormulaire.questions.filter(q => q.required);
    const questionsNonRemplies = questionsObligatoires.filter(q => {
      const questionId = q.id || `question_${q.question.substring(0, 10)}`;
      const reponse = formData[questionId];
      return !reponse || (Array.isArray(reponse) && reponse.length === 0) || reponse.toString().trim() === '';
    });

    if (questionsNonRemplies.length > 0) {
      alert(`Veuillez répondre à toutes les questions obligatoires (${questionsNonRemplies.length} manquantes)`);
      return;
    }

    setSubmitting(true);

    try {
      const reponses = selectedFormulaire.questions.map(question => {
        const questionId = question.id || `question_${question.question.substring(0, 10)}`;
        return {
          questionId: question.id || questionId,
          question: question.question,
          reponse: formData[questionId] || ''
        };
      });

      const response = await fetch('/api/user/formulaires-quotidiens/reponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formulaireId: selectedFormulaire.id,
          reponses,
          commentaires: formData.commentaires
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }

      setShowForm(false);
      setSelectedFormulaire(null);
      setFormData({ commentaires: '' });
      await fetchFormulaires(); 
      
      alert('Formulaire soumis avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la soumission du formulaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: Question) => {
    const questionId = question.id || `question_${question.question.substring(0, 10)}`;
    const value = formData[questionId] || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Votre réponse..."
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Votre réponse détaillée..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Entrez un nombre..."
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Sélectionnez une option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(questionId, e.target.value)}
                  required={question.required}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(questionId, [...currentValues, option]);
                    } else {
                      handleInputChange(questionId, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const isFormulaireDansLaPeriode = (formulaire: FormulaireQuotidien) => {
    const now = new Date();
    const debut = new Date(formulaire.dateDebut);
    const fin = new Date(formulaire.dateFin);
    return now >= debut && now <= fin;
  };

  const getStatutFormulaire = (formulaire: FormulaireQuotidien) => {
    if (formulaire.dejaRepondu) {
      return { status: 'completed', label: 'Complété', color: 'bg-green-100 text-green-800' };
    }
    if (!isFormulaireDansLaPeriode(formulaire)) {
      const now = new Date();
      const debut = new Date(formulaire.dateDebut);
      if (now < debut) {
        return { status: 'upcoming', label: 'À venir', color: 'bg-blue-100 text-blue-800' };
      } else {
        return { status: 'expired', label: 'Expiré', color: 'bg-red-100 text-red-800' };
      }
    }
    return { status: 'available', label: 'Disponible', color: 'bg-yellow-100 text-yellow-800' };
  };

  const filteredFormulaires = formulaires.filter(formulaire => {
    const statut = getStatutFormulaire(formulaire);
    switch (filterStatus) {
      case 'available':
        return statut.status === 'available';
      case 'completed':
        return statut.status === 'completed';
      default:
        return true;
    }
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
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
        {/* En-tête */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Formulaires Quotidiens</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Répondez aux questionnaires de votre formation IRATA
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
              <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Connecté en tant que: {session?.user?.prenom} {session?.user?.nom}</span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Mes formulaires</h2>
            <div className="flex items-center space-x-4">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Filtrer:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
              >
                <option value="all">Tous les formulaires</option>
                <option value="available">Disponibles</option>
                <option value="completed">Complétés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des formulaires */}
        <div className="space-y-4">
          {filteredFormulaires.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filterStatus === 'all' 
                  ? 'Aucun formulaire disponible'
                  : filterStatus === 'available'
                  ? 'Aucun formulaire disponible actuellement'
                  : 'Aucun formulaire complété'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterStatus === 'all' 
                  ? 'Les formulaires apparaîtront ici une fois validés par votre formateur.'
                  : filterStatus === 'available'
                  ? 'Revenez plus tard ou changez le filtre pour voir d\'autres formulaires.'
                  : 'Vous n\'avez pas encore complété de formulaires.'
                }
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredFormulaires.map((formulaire) => {
                const statut = getStatutFormulaire(formulaire);
                const dansLaPeriode = isFormulaireDansLaPeriode(formulaire);
                
                return (
                  <li key={formulaire.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {formulaire.titre}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statut.color}`}>
                              {statut.label}
                            </span>
                          </div>
                          
                          {formulaire.description && (
                            <p className="mt-2 text-sm text-gray-600">{formulaire.description}</p>
                          )}
                          
                          <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Session: {formulaire.session}
                            </span>
                            <span className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {formulaire.questions.length} questions
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Du {new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au {new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}
                            </span>
                          </div>

                          {formulaire.dejaRepondu && formulaire.dateDerniereReponse && (
                            <div className="mt-2 flex items-center text-sm text-green-600">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Répondu le {new Date(formulaire.dateDerniereReponse).toLocaleDateString('fr-FR')} à {new Date(formulaire.dateDerniereReponse).toLocaleTimeString('fr-FR')}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6">
                          {formulaire.dejaRepondu ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              <span className="text-sm font-medium">Complété</span>
                            </div>
                          ) : dansLaPeriode ? (
                            <button
                              onClick={() => handleStartForm(formulaire)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Répondre
                              <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </button>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                              <span className="text-sm">
                                {new Date() < new Date(formulaire.dateDebut) ? 'Pas encore ouvert' : 'Période expirée'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modal du formulaire */}
        {showForm && selectedFormulaire && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedFormulaire.titre}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFormulaire.questions.length} questions • Session: {selectedFormulaire.session}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ commentaires: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {selectedFormulaire.description && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{selectedFormulaire.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-6">
                    {selectedFormulaire.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            <span className="inline-flex items-center">
                              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-2">
                                {index + 1}
                              </span>
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </label>
                          <div className="mt-2">
                            {renderQuestion(question)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commentaires */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaires ou observations (optionnel)
                    </label>
                    <textarea
                      value={formData.commentaires}
                      onChange={(e) => handleInputChange('commentaires', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Partagez vos commentaires, questions ou observations sur cette formation..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ commentaires: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Soumission...
                        </>
                      ) : (
                        'Soumettre le formulaire'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}