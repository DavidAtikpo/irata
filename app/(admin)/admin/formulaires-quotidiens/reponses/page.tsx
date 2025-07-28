'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SESSIONS } from '../../../../../lib/sessions';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon
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
  nombreReponses: number;
}

interface ReponseFormulaire {
  id: string;
  formulaireId: string;
  utilisateurId: string;
  utilisateurNom: string;
  utilisateurEmail: string;
  dateReponse: string;
  reponses: {
    questionId: string;
    question: string;
    reponse: any;
  }[];
  commentaires?: string;
  soumis: boolean;
}

export default function ReponsesFormulairesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [selectedFormulaire, setSelectedFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [reponses, setReponses] = useState<ReponseFormulaire[]>([]);
  const [selectedReponse, setSelectedReponse] = useState<ReponseFormulaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReponses, setLoadingReponses] = useState(false);
  const [filterSession, setFilterSession] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchFormulaires();
    }
  }, [status, session, router]);

  const fetchFormulaires = async () => {
    try {
      const response = await fetch('/api/admin/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setFormulaires(data.filter((f: FormulaireQuotidien) => f.valide && f.nombreReponses > 0));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReponses = async (formulaireId: string) => {
    setLoadingReponses(true);
    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaireId}/reponses`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réponses');
      }
      const data = await response.json();
      setReponses(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la récupération des réponses');
    } finally {
      setLoadingReponses(false);
    }
  };

  const handleSelectFormulaire = (formulaire: FormulaireQuotidien) => {
    setSelectedFormulaire(formulaire);
    fetchReponses(formulaire.id);
  };

  const handleDownloadPDF = async (reponseId?: string) => {
    if (!selectedFormulaire) return;

    try {
      const endpoint = reponseId 
        ? `/api/admin/formulaires-quotidiens/${selectedFormulaire.id}/reponses/${reponseId}/pdf`
        : `/api/admin/formulaires-quotidiens/${selectedFormulaire.id}/reponses/pdf`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = reponseId 
        ? `reponse-${selectedFormulaire.titre}-${new Date().toISOString().split('T')[0]}.pdf`
        : `reponses-${selectedFormulaire.titre}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const filteredFormulaires = formulaires.filter(form => 
    (filterSession === 'all' || form.session === filterSession) &&
    (searchTerm === '' || form.titre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredReponses = reponses.filter(reponse =>
    searchTerm === '' || 
    reponse.utilisateurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reponse.utilisateurEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
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
              <button
                onClick={() => router.push('/admin/formulaires-quotidiens')}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Retour aux formulaires
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Réponses aux Formulaires</h1>
              <p className="mt-1 text-sm text-gray-600">
                Consultez et téléchargez les réponses des stagiaires
              </p>
            </div>
          </div>
        </div>

        {!selectedFormulaire ? (
          <>
            {/* Filtres */}
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session
                    </label>
                    <select
                      value={filterSession}
                      onChange={(e) => setFilterSession(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">Toutes les sessions</option>
                      {SESSIONS.map((session) => (
                        <option key={session.value} value={session.value}>
                          {session.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rechercher
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Titre du formulaire..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des formulaires */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Formulaires avec réponses ({filteredFormulaires.length})
                </h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredFormulaires.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun formulaire avec réponses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Les formulaires validés avec des réponses apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredFormulaires.map((formulaire) => (
                    <div key={formulaire.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {formulaire.titre}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Validé
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>{formulaire.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {SESSIONS.find(s => s.value === formulaire.session)?.label || formulaire.session}
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {formulaire.questions.length} questions
                              </span>
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {formulaire.nombreReponses} réponses
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleSelectFormulaire(formulaire)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Voir les réponses
                          </button>
                          <button
                            onClick={() => handleDownloadPDF()}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Télécharger PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* En-tête du formulaire sélectionné */}
            <div className="mb-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <button
                      onClick={() => {
                        setSelectedFormulaire(null);
                        setReponses([]);
                        setSelectedReponse(null);
                      }}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Retour à la liste
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {selectedFormulaire.titre}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedFormulaire.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {SESSIONS.find(s => s.value === selectedFormulaire.session)?.label || selectedFormulaire.session}
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {reponses.length} réponses
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleDownloadPDF()}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Télécharger toutes les réponses
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des réponses */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Réponses individuelles
                </h3>
              </div>
              
              {loadingReponses ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : reponses.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réponse</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune réponse n'a encore été soumise pour ce formulaire.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reponses.map((reponse) => (
                    <div key={reponse.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {reponse.utilisateurNom}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              reponse.soumis 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reponse.soumis ? 'Soumis' : 'Brouillon'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>{reponse.utilisateurEmail}</p>
                            <p className="mt-1">
                              Répondu le {new Date(reponse.dateReponse).toLocaleDateString('fr-FR')} à {new Date(reponse.dateReponse).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => setSelectedReponse(reponse)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Voir détails
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(reponse.id)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de détail d'une réponse */}
        {selectedReponse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4">
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Détail de la réponse - {selectedReponse.utilisateurNom}
                    </h3>
                    <button
                      onClick={() => setSelectedReponse(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="sr-only">Fermer</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Stagiaire:</span>
                        <span className="ml-2 text-gray-900">{selectedReponse.utilisateurNom}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900 break-all">{selectedReponse.utilisateurEmail}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date de réponse:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedReponse.dateReponse).toLocaleDateString('fr-FR')} à {new Date(selectedReponse.dateReponse).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Statut:</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedReponse.soumis 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedReponse.soumis ? 'Soumis' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Réponses aux questions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Réponses aux questions</h4>
                    <div className="space-y-4">
                      {selectedReponse.reponses.map((reponse, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-start">
                            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="flex-1">{reponse.question}</span>
                          </h5>
                          <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded border-l-4 border-indigo-500 ml-9">
                            {Array.isArray(reponse.reponse) 
                              ? reponse.reponse.join(', ')
                              : reponse.reponse || 'Pas de réponse'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commentaires */}
                  {selectedReponse.commentaires && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Commentaires</h4>
                      <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {selectedReponse.commentaires}
                      </div>
                    </div>
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
