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
  MagnifyingGlassIcon,
  CheckCircleIcon
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
  score?: number;
  maxScore?: number;
}

export default function ReponsesFormulairesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [selectedFormulaire, setSelectedFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [reponses, setReponses] = useState<ReponseFormulaire[]>([]);
  const [selectedReponse, setSelectedReponse] = useState<ReponseFormulaire | null>(null);
  const [adminDecision, setAdminDecision] = useState<'ACCEPTE' | 'REFUSE' | 'A_REVOIR' | ''>('');
  const [adminComment, setAdminComment] = useState('');
  const [adminScore, setAdminScore] = useState<string>('');
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <button
                onClick={() => router.push('/admin/formulaires-quotidiens')}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour aux formulaires
              </button>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <EyeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Réponses aux Formulaires</h1>
                  <p className="mt-2 text-lg text-gray-600">
                    Analysez et évaluez les réponses de vos stagiaires
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!selectedFormulaire ? (
          <>
            {/* Filtres */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-200/60 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                      <FunnelIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Filtres de Recherche</h3>
                      <p className="text-sm text-gray-600 mt-0.5">Trouvez rapidement les formulaires qui vous intéressent</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Session de formation
                      </label>
                      <select
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      >
                        <option value="all">Toutes les sessions</option>
                        {SESSIONS.map((session) => (
                          <option key={session.value} value={session.value}>
                            {session.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Recherche par mot-clé
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Titre du formulaire..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des formulaires */}
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-200/60 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Formulaires avec Réponses
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {filteredFormulaires.length} formulaire{filteredFormulaires.length !== 1 ? 's' : ''} disponible{filteredFormulaires.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredFormulaires.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun formulaire avec réponses</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Les formulaires validés ayant reçu des réponses de stagiaires apparaîtront dans cette section.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {filteredFormulaires.map((formulaire) => (
                    <div key={formulaire.id} className="bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/60 rounded-xl p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-sm">
                              <DocumentTextIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {formulaire.titre}
                                </h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-sm">
                                  <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                                  Validé
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-600 mb-3">{formulaire.description || 'Aucune description disponible'}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/60">
                                <div className="flex items-center space-x-2">
                                  <CalendarIcon className="h-4 w-4 text-indigo-600" />
                                  <span className="text-sm font-medium text-gray-700">Session</span>
                                </div>
                                <p className="text-sm text-gray-900 mt-1 font-semibold">
                                  {SESSIONS.find(s => s.value === formulaire.session)?.label || formulaire.session}
                                </p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/60">
                                <div className="flex items-center space-x-2">
                                  <DocumentTextIcon className="h-4 w-4 text-emerald-600" />
                                  <span className="text-sm font-medium text-gray-700">Questions</span>
                                </div>
                                <p className="text-sm text-gray-900 mt-1 font-semibold">
                                  {formulaire.questions.length} question{formulaire.questions.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3 border border-gray-200/60">
                                <div className="flex items-center space-x-2">
                                  <UserIcon className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-gray-700">Réponses</span>
                                </div>
                                <p className="text-lg text-indigo-600 mt-1 font-bold">
                                  {formulaire.nombreReponses}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-48">
                          <button
                            onClick={() => handleSelectFormulaire(formulaire)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <EyeIcon className="h-5 w-5 mr-2" />
                            Consulter les Réponses
                          </button>
                          <button
                            onClick={() => handleDownloadPDF()}
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
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
            <div className="mb-8">
              <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-200/60 rounded-t-xl">
                  <button
                    onClick={() => {
                      setSelectedFormulaire(null);
                      setReponses([]);
                      setSelectedReponse(null);
                    }}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors duration-200"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Retour à la liste des formulaires
                  </button>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedFormulaire.titre}
                          </h2>
                          <p className="mt-2 text-gray-600">
                            {selectedFormulaire.description || 'Aucune description disponible'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-lg border border-gray-200/60">
                          <CalendarIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {SESSIONS.find(s => s.value === selectedFormulaire.session)?.label || selectedFormulaire.session}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-lg border border-gray-200/60">
                          <UserIcon className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {reponses.length} réponse{reponses.length !== 1 ? 's' : ''} reçue{reponses.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:w-64">
                      <button
                        onClick={() => handleDownloadPDF()}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Télécharger Toutes les Réponses
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des réponses */}
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-200/60 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Réponses Individuelles
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Détail des soumissions par stagiaire
                    </p>
                  </div>
                </div>
              </div>
              
              {loadingReponses ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : reponses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réponse reçue</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Les réponses des stagiaires apparaîtront ici dès qu'ils auront soumis le formulaire.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {reponses.map((reponse) => (
                    <div key={reponse.id} className="bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/60 rounded-xl p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-sm">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-xl font-semibold text-gray-900">
                                  {reponse.utilisateurNom}
                                </h4>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                  reponse.soumis 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {reponse.soumis ? (
                                    <>
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div>
                                      Soumis
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-1.5 animate-pulse"></div>
                                      Brouillon
                                    </>
                                  )}
                                </span>
                                {reponse.score !== undefined && reponse.maxScore !== undefined && (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                    (reponse.score / reponse.maxScore) >= 0.8 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : (reponse.score / reponse.maxScore) >= 0.6 
                                      ? 'bg-orange-100 text-orange-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    🎯 {reponse.score}/{reponse.maxScore} ({Math.round((reponse.score / reponse.maxScore) * 100)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/60 rounded-lg p-3 border border-gray-200/60">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-700">Email</span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">{reponse.utilisateurEmail}</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 border border-gray-200/60">
                              <div className="flex items-center space-x-2 mb-1">
                                <CalendarIcon className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-700">Date de réponse</span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">
                                {new Date(reponse.dateReponse).toLocaleDateString('fr-FR')} à {new Date(reponse.dateReponse).toLocaleTimeString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 lg:w-48">
                          <button
                            onClick={() => setSelectedReponse(reponse)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          >
                            <EyeIcon className="h-5 w-5 mr-2" />
                            Voir Détails
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(reponse.id)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
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
        )}

        {/* Page de détail d'une réponse */}
        {selectedReponse && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* En-tête de la page */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedReponse(null)}
                    className="inline-flex items-center text-white hover:text-blue-100 transition-colors duration-200 font-medium"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    ← Retour aux réponses
                  </button>
                  <div className="h-6 w-px bg-white/30"></div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <EyeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Détail de la Réponse
                      </h3>
                      <p className="text-blue-100 text-sm mt-0.5">
                        {selectedReponse.utilisateurNom} • {selectedFormulaire?.titre}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownloadPDF(selectedReponse.id)}
                    className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    📄 Télécharger PDF
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Informations générales */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Informations Générales</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-200/60">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-700">Stagiaire</span>
                    </div>
                    <p className="text-gray-900 font-medium">{selectedReponse.utilisateurNom}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-200/60">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-gray-700">Email</span>
                    </div>
                    <p className="text-gray-900 font-medium break-all">{selectedReponse.utilisateurEmail}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-200/60">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-700">Date de réponse</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedReponse.dateReponse).toLocaleDateString('fr-FR')} à {new Date(selectedReponse.dateReponse).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-200/60">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-gray-700">Statut</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                      selectedReponse.soumis 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        selectedReponse.soumis ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}></div>
                      {selectedReponse.soumis ? 'Soumis' : 'Brouillon'}
                    </span>
                    
                    {selectedReponse.score !== undefined && selectedReponse.maxScore !== undefined && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                          (selectedReponse.score / selectedReponse.maxScore) >= 0.8 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : (selectedReponse.score / selectedReponse.maxScore) >= 0.6 
                            ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          🎯 {selectedReponse.score}/{selectedReponse.maxScore} ({Math.round((selectedReponse.score / selectedReponse.maxScore) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Réponses aux questions */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Réponses aux Questions</h4>
                </div>
                
                <div className="space-y-6">
                  {selectedReponse.reponses.map((reponse, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-lg leading-relaxed">
                            {reponse.question}
                          </h5>
                        </div>
                      </div>
                      
                      <div className="ml-12">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                          <div className="text-gray-800 font-medium">
                            {Array.isArray(reponse.reponse) 
                              ? reponse.reponse.join(', ')
                              : reponse.reponse || (
                                <span className="text-gray-500 italic">Pas de réponse fournie</span>
                              )
                            }
                          </div>
                        </div>
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

              {/* Décision/feedback admin */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-500 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-indigo-900">
                    Feedback et Évaluation
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Décision</label>
                    <select
                      value={adminDecision}
                      onChange={(e) => setAdminDecision(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">— Sélectionner —</option>
                      <option value="ACCEPTE">Accepté</option>
                      <option value="REFUSE">Refusé</option>
                      <option value="A_REVOIR">À revoir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score (optionnel)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminScore}
                      onChange={(e) => setAdminScore(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="ex: 8"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Retour pour le stagiaire..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!selectedFormulaire || !selectedReponse) return;
                      try {
                        const resp = await fetch(`/api/admin/formulaires-quotidiens/${selectedFormulaire.id}/reponses`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            reponseId: selectedReponse.id,
                            decision: adminDecision || undefined,
                            commentaire: adminComment || undefined,
                            score: adminScore !== '' ? Number(adminScore) : undefined,
                          })
                        });
                        if (!resp.ok) throw new Error('Erreur lors de l\'envoi');
                        alert('Décision envoyée au stagiaire.');
                        setAdminDecision('');
                        setAdminComment('');
                        setAdminScore('');
                      } catch (err) {
                        console.error(err);
                        alert('Erreur lors de l\'envoi de la décision');
                      }
                    }}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer au Stagiaire
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
