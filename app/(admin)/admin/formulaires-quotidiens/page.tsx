'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SESSIONS, Session } from '../../../../lib/sessions';
import { useNotifications } from '../../../../hooks/useNotifications';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
  ArrowDownTrayIcon as DownloadIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  question: string;
  options?: string[];
  required: boolean;
  // Options spécifiques aux nombres
  numberMin?: number;
  numberMax?: number;
  numberStep?: number;
  numberUnit?: string;
  numberCorrect?: number;
  // Scoring functionality for multiple choice questions
  correctAnswers?: string[];
  points?: number;
  scoringEnabled?: boolean;
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

export default function FormulairesQuotidiensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFormulaire, setEditingFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [filterSession, setFilterSession] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    reponses: 0,
    taux_participation: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { addNotification } = useNotifications();

  const [createForm, setCreateForm] = useState({
    titre: '',
    description: '',
    session: '',
    niveau: '1',
    dateDebut: '',
    dateFin: '',
    questions: [] as Question[]
  });

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
      setError(null);
      const response = await fetch('/api/admin/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setFormulaires(data);
      
      // Calculer les statistiques
      const total = data.length;
      const actifs = data.filter((f: FormulaireQuotidien) => f.valide && f.actif).length;
      const totalReponses = data.reduce((sum: number, f: FormulaireQuotidien) => sum + f.nombreReponses, 0);
      const tauxParticipation = actifs > 0 ? Math.round((totalReponses / (actifs * 10)) * 100) : 0; // Estimation sur 10 stagiaires par formulaire
      
      setStats({
        total,
        actifs,
        reponses: totalReponses,
        taux_participation: tauxParticipation
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les formulaires. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.questions.length === 0) {
      setError('Veuillez ajouter au moins une question avant de créer le formulaire.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/formulaires-quotidiens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          valide: false 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du formulaire');
      }

      setShowCreateForm(false);
      resetCreateForm();
      await fetchFormulaires();
      
      // Ajouter une notification
      addNotification(
        'NEW_FORMULAIRE',
        `Nouveau formulaire "${createForm.titre}" créé pour la session ${createForm.session}`,
        '/admin/formulaires-quotidiens'
      );
      
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du formulaire');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      titre: '',
      description: '',
      session: '',
      niveau: '1',
      dateDebut: '',
      dateFin: '',
      questions: []
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: true,
      scoringEnabled: false,
      points: 1,
      correctAnswers: []
    };
    setCreateForm({
      ...createForm,
      questions: [...createForm.questions, newQuestion]
    });
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...createForm.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setCreateForm({ ...createForm, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = createForm.questions.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, questions: updatedQuestions });
  };

  // Helpers: options management per question
  const addOptionToQuestion = (questionIndex: number) => {
    setCreateForm(prev => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])];
      options.push('');
      questions[questionIndex] = { ...questions[questionIndex], options };
      return { ...prev, questions };
    });
  };

  const updateOptionValue = (questionIndex: number, optionIndex: number, value: string) => {
    setCreateForm(prev => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])];
      options[optionIndex] = value;
      questions[questionIndex] = { ...questions[questionIndex], options };
      return { ...prev, questions };
    });
  };

  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    setCreateForm(prev => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])].filter((_, i) => i !== optionIndex);
      // Clean correct answers too
      const correctAnswers = (questions[questionIndex].correctAnswers || []).filter((a, i) => options.includes(a));
      questions[questionIndex] = { ...questions[questionIndex], options, correctAnswers };
      return { ...prev, questions };
    });
  };

  const toggleCorrectAnswer = (questionIndex: number, option: string, checked: boolean) => {
    setCreateForm(prev => {
      const questions = [...prev.questions];
      const q = questions[questionIndex];
      const type = q.type;
      let correctAnswers = [...(q.correctAnswers || [])];
      if (type === 'radio') {
        // Single choice: only one correct answer
        correctAnswers = checked ? [option] : [];
      } else {
        // Multiple choice
        correctAnswers = checked ? [...new Set([...correctAnswers, option])] : correctAnswers.filter(a => a !== option);
      }
      questions[questionIndex] = { ...q, correctAnswers };
      return { ...prev, questions };
    });
  };

  const handleValidateFormulaire = async (formulaireId: string, valide: boolean) => {
    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaireId}/validate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valide }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la validation');
      }

      const result = await response.json();
      await fetchFormulaires();
      
      if (valide && result.notifications) {
        const { total, successful, failed } = result.notifications;
        
        // Ajouter une notification pour l'admin
        if (result.adminNotification) {
          addNotification(
            result.adminNotification.type,
            result.adminNotification.message,
            result.adminNotification.link
          );
        }
        
        if (failed > 0) {
          alert(`Formulaire validé ! Notifications envoyées: ${successful}/${total} succès, ${failed} échecs.`);
        } else {
          alert(`Formulaire validé ! Notifications envoyées avec succès à ${total} stagiaires.`);
        }
      } else {
        alert(valide ? 'Formulaire validé et visible pour les stagiaires !' : 'Formulaire masqué aux stagiaires');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation du formulaire');
    }
  };

  const handleOpenNow = async (formulaireId: string) => {
    try {
      const now = new Date();
      const dateDebut = new Date();
      dateDebut.setHours(0, 0, 0, 0); // Début de la journée
      
      const dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + 7); // +7 jours

      const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaireId}/dates`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dateDebut: dateDebut.toISOString(),
          dateFin: dateFin.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification des dates');
      }

      await fetchFormulaires();
      alert('Formulaire ouvert immédiatement ! Les stagiaires peuvent maintenant y répondre.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ouverture du formulaire');
    }
  };

  const handleEditFormulaire = (formulaire: FormulaireQuotidien) => {
    setEditingFormulaire(formulaire);
    setCreateForm({
      titre: formulaire.titre,
      description: formulaire.description || '',
      session: formulaire.session,
      niveau: formulaire.niveau || '1',
      dateDebut: formulaire.dateDebut,
      dateFin: formulaire.dateFin,
      questions: [...formulaire.questions]
    });
    setShowCreateForm(true);
  };

  const handleUpdateFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFormulaire) return;
    
    if (createForm.questions.length === 0) {
      setError('Veuillez ajouter au moins une question avant de sauvegarder.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${editingFormulaire.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du formulaire');
      }

      setShowCreateForm(false);
      setEditingFormulaire(null);
      resetCreateForm();
      await fetchFormulaires();
      
      // Ajouter une notification
      addNotification(
        'NEW_FORMULAIRE',
        `Formulaire "${createForm.titre}" mis à jour avec succès`,
        '/admin/formulaires-quotidiens'
      );
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du formulaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormulaire = async (formulaireId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${formulaireId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchFormulaires();
      
      // Ajouter une notification
      addNotification(
        'FORMULAIRE_DELETED',
        `Formulaire supprimé avec succès`,
        '/admin/formulaires-quotidiens'
      );
      
      alert('Formulaire supprimé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du formulaire');
    }
  };

  const filteredFormulaires = formulaires.filter(form => 
    filterSession === 'all' || form.session === filterSession
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement des formulaires quotidiens...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête principal */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              📋 Formulaires Quotidiens
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Créez et gérez les questionnaires quotidiens pour le suivi des formations
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => router.push('/admin/formulaires-quotidiens/reponses')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Voir les Réponses
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouveau Formulaire
            </button>
          </div>
        </div>

        {/* Indicateur de statut temps réel */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  Système actif - {formulaires.length} formulaires
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  {stats.actifs} formulaires actifs
                </span>
                <span>•</span>
                <span>
                  {stats.reponses} réponses reçues
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                Dernière MAJ: {new Date().toLocaleTimeString('fr-FR')}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-600">En ligne</span>
              </div>
            </div>
          </div>
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
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setError(null);
                      fetchFormulaires();
                    }}
                    className="text-sm bg-red-100 text-red-800 rounded-md px-3 py-1 hover:bg-red-200 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
                              </div>
                            </div>
                          )}
                          

        {/* Dashboard des statistiques */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Formulaires
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Formulaires Actifs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.actifs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Réponses Reçues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.reponses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Taux Participation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.taux_participation}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Options */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filtres et Options</h3>
            <p className="text-sm text-gray-500 mt-1">Affinez votre recherche dans les formulaires</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Toutes les sessions</option>
                  {SESSIONS.map((session: Session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilterSession('all')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Réinitialiser
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchFormulaires}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des formulaires */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
                  Liste des Formulaires
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredFormulaires.length} formulaire{filteredFormulaires.length !== 1 ? 's' : ''} • 
                  {stats.actifs} actif{stats.actifs !== 1 ? 's' : ''} • 
                  {stats.reponses} réponse{stats.reponses !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {Math.round((stats.actifs / Math.max(stats.total, 1)) * 100)}% de formulaires actifs
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.actifs / Math.max(stats.total, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        
        {filteredFormulaires.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p>Aucun formulaire trouvé</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Créer le premier formulaire
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="divide-y divide-gray-200">
              {filteredFormulaires.map((formulaire) => (
                <div key={formulaire.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {formulaire.titre}
                        </h4>
                        <div className="flex space-x-2">
                          {formulaire.valide ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Brouillon
                            </span>
                          )}
                          {formulaire.actif && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Actif
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p className="line-clamp-2">{formulaire.description || 'Aucune description'}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Session:</span>
                          <span className="ml-1">{SESSIONS.find(s => s.value === formulaire.session)?.label || formulaire.session}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Niveau {formulaire.niveau}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Questions:</span>
                          <span className="ml-1">{formulaire.questions.length}</span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Réponses:</span>
                          <span className="ml-1 font-semibold text-indigo-600">{formulaire.nombreReponses}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Créé le {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')} • 
                        Du {new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au {new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleValidateFormulaire(formulaire.id, !formulaire.valide)}
                        className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                          formulaire.valide
                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                        title={formulaire.valide ? 'Masquer aux stagiaires' : 'Valider pour les stagiaires et envoyer des notifications par email'}
                      >
                        {formulaire.valide ? (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Valider
                          </>
                        )}
                      </button>

                      {formulaire.valide && new Date() < new Date(formulaire.dateDebut) && (
                        <button
                          onClick={() => handleOpenNow(formulaire.id)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Ouvrir le formulaire immédiatement pour les stagiaires"
                        >
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Ouvrir maintenant
                        </button>
                      )}

                      <button
                        onClick={() => handleEditFormulaire(formulaire)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        title="Modifier le formulaire"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDeleteFormulaire(formulaire.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        title="Supprimer le formulaire"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Modal de création/modification */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header de la modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingFormulaire ? 'Modifier le formulaire' : 'Créer un nouveau formulaire'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingFormulaire ? 'Modifiez les informations et questions' : 'Configurez votre questionnaire quotidien'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFormulaire(null);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenu scrollable de la modal */}
              <div className="flex-1 overflow-y-auto p-6">
                
                <form onSubmit={editingFormulaire ? handleUpdateFormulaire : handleCreateFormulaire} className="space-y-8">
                  {/* Informations générales */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Informations générales</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre du formulaire *
                          </label>
                          <input
                            type="text"
                            required
                            value={createForm.titre}
                            onChange={(e) => setCreateForm({ ...createForm, titre: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ex: Évaluation quotidienne formation IRATA"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session *
                          </label>
                          <select
                            required
                            value={createForm.session}
                            onChange={(e) => setCreateForm({ ...createForm, session: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Sélectionner une session</option>
                            {SESSIONS.map((session: Session) => (
                              <option key={session.value} value={session.value}>
                                {session.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Niveau IRATA ciblé *
                          </label>
                          <select
                            required
                            value={createForm.niveau}
                            onChange={(e) => setCreateForm({ ...createForm, niveau: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="1">Niveau 1 - Débutant</option>
                            <option value="2">Niveau 2 - Intermédiaire</option>
                            <option value="3">Niveau 3 - Avancé</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de début *
                          </label>
                          <input
                            type="date"
                            required
                            value={createForm.dateDebut}
                            onChange={(e) => setCreateForm({ ...createForm, dateDebut: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de fin *
                          </label>
                          <input
                            type="date"
                            required
                            value={createForm.dateFin}
                            onChange={(e) => setCreateForm({ ...createForm, dateFin: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={createForm.description}
                          onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                          placeholder="Description du formulaire pour expliquer son objectif aux stagiaires (optionnel)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">
                          Questions du formulaire ({createForm.questions.length})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Ajouter une question
                      </button>
                    </div>

                    {createForm.questions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune question ajoutée</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Créez des questions pour collecter les retours des stagiaires
                        </p>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Créer la première question
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {createForm.questions.map((question, index) => (
                          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                                </div>
                                <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-md transition-colors"
                                title="Supprimer cette question"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Question *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={question.question}
                                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="Ex: Comment évaluez-vous votre compréhension du jour ?"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type de réponse
                                  </label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="text">📝 Texte court</option>
                                    <option value="textarea">📄 Texte long</option>
                                    <option value="select">📋 Liste déroulante</option>
                                    <option value="radio">⚪ Choix unique</option>
                                    <option value="checkbox">☑️ Choix multiple</option>
                                    <option value="number">🔢 Nombre</option>
                                  </select>
                                </div>
                                
                                <div className="flex items-center justify-center">
                                  <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                    <input
                                      type="checkbox"
                                      checked={question.required}
                                      onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Question obligatoire</span>
                                  </label>
                                </div>
                              </div>
                              
                              {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Options de réponse
                                    </label>
                                    <div className="space-y-2">
                                      {(question.options || []).map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOptionValue(index, optIdx, e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder={`Option ${optIdx + 1}`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeOptionFromQuestion(index, optIdx)}
                                            className="px-2 py-1 text-sm text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                                            title="Supprimer l'option"
                                          >
                                            Supprimer
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => addOptionToQuestion(index)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        + Ajouter une option
                                      </button>
                                    </div>
                                  </div>

                                  {/* Sélection de la/les bonne(s) réponse(s) */}
                              {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (question.options && question.options.length > 0) && (
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {question.type === 'radio' ? 'Bonne réponse' : 'Bonnes réponses'}
                                      </label>
                                      <div className="space-y-2 max-h-40 overflow-y-auto bg-white p-3 border border-gray-200 rounded-md">
                                        {question.options.map((option, optIdx) => (
                                          <label key={optIdx} className="flex items-center gap-3">
                                            <input
                                              type={question.type === 'radio' ? 'radio' : 'checkbox'}
                                              name={`correct_${question.id}`}
                                              checked={question.correctAnswers?.includes(option) || false}
                                              onChange={(e) => toggleCorrectAnswer(index, option, e.target.checked)}
                                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700 flex-1">{option || `(Option ${optIdx + 1})`}</span>
                                            {question.correctAnswers?.includes(option) && (
                                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                            )}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                              {/* Options pour type Nombre */}
                              {createForm.questions[index].type === 'number' && (
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 border rounded">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                                    <input
                                      type="number"
                                      value={question.numberMin ?? ''}
                                      onChange={(e) => updateQuestion(index, 'numberMin', e.target.value === '' ? undefined : Number(e.target.value))}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="ex: 0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                                    <input
                                      type="number"
                                      value={question.numberMax ?? ''}
                                      onChange={(e) => updateQuestion(index, 'numberMax', e.target.value === '' ? undefined : Number(e.target.value))}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="ex: 100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pas</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={question.numberStep ?? ''}
                                      onChange={(e) => updateQuestion(index, 'numberStep', e.target.value === '' ? undefined : Number(e.target.value))}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="ex: 1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Unité (optionnel)</label>
                                    <input
                                      type="text"
                                      value={question.numberUnit ?? ''}
                                      onChange={(e) => updateQuestion(index, 'numberUnit', e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="ex: kg, %, m, ..."
                                    />
                                  </div>
                                  <div className="md:col-span-2 lg:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonne réponse (optionnel)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={question.numberCorrect ?? ''}
                                      onChange={(e) => updateQuestion(index, 'numberCorrect', e.target.value === '' ? undefined : Number(e.target.value))}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="ex: 42"
                                    />
                                  </div>
                                </div>
                              )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </form>
              </div>

              {/* Footer de la modal */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {createForm.questions.length === 0 ? (
                    <span className="flex items-center text-amber-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Ajoutez au moins une question pour continuer
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      {createForm.questions.length} question{createForm.questions.length !== 1 ? 's' : ''} configurée{createForm.questions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingFormulaire(null);
                      resetCreateForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createForm.questions.length === 0 || submitting}
                    onClick={editingFormulaire ? handleUpdateFormulaire : handleCreateFormulaire}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingFormulaire ? 'Mise à jour...' : 'Création...'}
                      </div>
                    ) : (
                      editingFormulaire ? 'Mettre à jour le formulaire' : 'Créer le formulaire'
                    )}
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