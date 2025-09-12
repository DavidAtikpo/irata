'use client';

import { useState, useEffect, useRef } from 'react';
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
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  question: string;
  required: boolean;
  // Options pour les questions à choix
  options?: string[];
  // Bonne(s) réponse(s) pour la notation automatique
  correctAnswers: string[];
  // Points pour cette question
  points: number;
  // Options spécifiques aux nombres
  numberMin?: number;
  numberMax?: number;
  numberStep?: number;
  numberUnit?: string;
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
  
  // Fonction utilitaire pour formater les dates pour les champs input[type="date"]
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };
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
  const [modalError, setModalError] = useState<string | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const [errorQuestionIndex, setErrorQuestionIndex] = useState<number | null>(null);
  const questionRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  useEffect(() => {
    if (modalError) {
      // If we know the specific question, scroll to it; otherwise scroll to top for the sticky banner
      if (errorQuestionIndex != null && questionRefs.current[errorQuestionIndex]) {
        try {
          questionRefs.current[errorQuestionIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {}
      } else if (modalScrollRef.current) {
        try {
          modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
      }
    }
  }, [modalError]);

  useEffect(() => {
    if (errorQuestionIndex != null && questionRefs.current[errorQuestionIndex]) {
      try {
        questionRefs.current[errorQuestionIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    }
  }, [errorQuestionIndex]);

  const fetchFormulaires = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      console.log('🔍 Formulaires reçus:', data);
      console.log('🔍 Sessions uniques dans les formulaires:', [...new Set(data.map((f: any) => f.session))]);
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

  const validateQuestions = () => {
    // Calculer le total des points
    const totalPoints = createForm.questions.reduce((sum, q) => sum + (q.points || 0.5), 0);
    
    // Vérifier que le total est exactement 20
    if (Math.abs(totalPoints - 20) > 0.01) { // Tolérance de 0.01 pour les erreurs d'arrondi
      const msg = `Le total des points doit être exactement 20. Actuellement : ${totalPoints.toFixed(1)}/20 points.`;
      setError(msg);
      setModalError(msg);
      setErrorQuestionIndex(0);
      return false;
    }
    
    for (let i = 0; i < createForm.questions.length; i++) {
      const question = createForm.questions[i];
      
      // Vérifier que la question a des points (minimum 0.5)
      if (!question.points || question.points < 0.5) {
        const msg = `Question ${i + 1} : Veuillez définir un nombre de points valide (minimum 0.5).`;
        setError(msg);
        setModalError(msg);
        setErrorQuestionIndex(i);
        return false;
      }
      
      // Vérifier que la question a une bonne réponse selon son type
      if (question.type === 'text' || question.type === 'textarea' || question.type === 'number') {
        if (!question.correctAnswers?.[0] || question.correctAnswers[0].trim() === '') {
          const msg = `Question ${i + 1} : Veuillez définir la bonne réponse.`;
          setError(msg);
          setModalError(msg);
          setErrorQuestionIndex(i);
          return false;
        }
      } else if (question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') {
        if (!question.options || question.options.length === 0) {
          const msg = `Question ${i + 1} : Veuillez ajouter au moins une option de réponse.`;
          setError(msg);
          setModalError(msg);
          setErrorQuestionIndex(i);
          return false;
        }
        if (!question.correctAnswers || question.correctAnswers.length === 0) {
          const msg = `Question ${i + 1} : Veuillez sélectionner au moins une bonne réponse.`;
          setError(msg);
          setModalError(msg);
          setErrorQuestionIndex(i);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleCreateFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.questions.length === 0) {
      const msg = 'Veuillez ajouter au moins une question avant de créer le formulaire.';
      setError(msg);
      setModalError(msg);
      return;
    }

    // Valider toutes les questions
    if (!validateQuestions()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setModalError(null);
    setErrorQuestionIndex(null);

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
        let errorMessage = 'Erreur lors de la création du formulaire';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // ignore parse error, keep default message
        }
        throw new Error(errorMessage);
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
      const msg = error instanceof Error ? error.message : 'Erreur lors de la création du formulaire';
      setError(msg);
      setModalError(msg);
      const match = msg.match(/Question\s+(\d+)/i);
      setErrorQuestionIndex(match ? Math.max(0, parseInt(match[1], 10) - 1) : null);
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
      options: [],
      correctAnswers: [],
      points: 0.5
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
      dateDebut: formatDateForInput(formulaire.dateDebut),
      dateFin: formatDateForInput(formulaire.dateFin),
      questions: [...formulaire.questions]
    });
    setModalError(null);
    setErrorQuestionIndex(null);
    setShowCreateForm(true);
  };

  const handleUpdateFormulaire = async () => {
    if (!editingFormulaire) {
      const msg = 'Aucun formulaire en cours d\'édition';
      setError(msg);
      setModalError(msg);
      return;
    }
    
    if (createForm.questions.length === 0) {
      const msg = 'Veuillez ajouter au moins une question avant de sauvegarder.';
      setError(msg);
      setModalError(msg);
      return;
    }

    // Valider toutes les questions
    if (!validateQuestions()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setModalError(null);
    setErrorQuestionIndex(null);

    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${editingFormulaire.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour du formulaire';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // ignore parse error, keep default message
        }
        throw new Error(errorMessage);
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
      console.error('Erreur lors de la mise à jour:', error);
      const msg = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du formulaire';
      setError(msg);
      setModalError(msg);
      const match = msg.match(/Question\s+(\d+)/i);
      setErrorQuestionIndex(match ? Math.max(0, parseInt(match[1], 10) - 1) : null);
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

  const handleDuplicateFormulaire = (formulaire: FormulaireQuotidien) => {
    // Créer une copie du formulaire avec un nouveau titre
    const duplicatedFormulaire = {
      ...formulaire,
      titre: `${formulaire.titre}`,
      description: formulaire.description ? `${formulaire.description}` : '',
      dateCreation: new Date().toISOString(),
      valide: false, // Le formulaire dupliqué n'est pas validé par défaut
      actif: false, // Le formulaire dupliqué n'est pas actif par défaut
      nombreReponses: 0, // Réinitialiser le nombre de réponses
      questions: formulaire.questions.map(q => ({
        ...q,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Nouvel ID unique
        correctAnswers: q.correctAnswers || [], // Assurer que les bonnes réponses sont copiées
        points: q.points || 0.5 // Assurer que les points sont copiés
      }))
    };

    // Pré-remplir le formulaire de création avec les données dupliquées
    setCreateForm({
      titre: duplicatedFormulaire.titre,
      description: duplicatedFormulaire.description || '',
      session: duplicatedFormulaire.session,
      niveau: duplicatedFormulaire.niveau || '1',
      dateDebut: formatDateForInput(duplicatedFormulaire.dateDebut),
      dateFin: formatDateForInput(duplicatedFormulaire.dateFin),
      questions: [...duplicatedFormulaire.questions]
    });

    // Ouvrir la modal de création
    setShowCreateForm(true);
    setEditingFormulaire(null); // Pas en mode édition, mais en mode création avec données pré-remplies
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
        {/* En-tête principal avec design amélioré */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 rounded-2xl shadow-2xl border-0 p-8 mb-8">
          {/* Éléments décoratifs */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/30">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Formulaires Quotidiens
                </h1>
                <p className="text-xl text-blue-100/90 font-medium">
                  Gérez les questionnaires de suivi pour vos formations IRATA
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-blue-100/80">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Système opérationnel</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100/80">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">{formulaires.length} formulaires</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push('/admin/formulaires-quotidiens/reponses')}
                className="group relative inline-flex items-center justify-center px-2 py-1 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 shadow-xl hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <EyeIcon className="w-5 h-5 mr-3 relative z-10" />
                <span className="relative z-10">Consulter les Réponses</span>
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="group relative inline-flex items-center justify-center px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <PlusIcon className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10 text-lg">Créer un Formulaire</span>
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur de statut temps réel */}
        <div className="mb-8 bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200/60 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping"></div>
                </div>
                <div>
                  <span className="text-base font-semibold text-gray-900">
                    Système opérationnel
                  </span>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {formulaires.length} formulaires configurés
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {stats.actifs} actifs
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-lg">
                  <UsersIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {stats.reponses} réponses
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-gray-500 block">
                  Dernière synchronisation
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-800">En ligne</span>
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
                          

        {/* Dashboard des statistiques avec design moderne */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-gradient-to-br from-white via-blue-50 to-indigo-100 border border-blue-200/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Total Formulaires
                    </dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                      {stats.total}
                    </dd>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-emerald-50 to-green-100 border border-emerald-200/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Formulaires Actifs
                    </dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                      {stats.actifs}
                    </dd>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-blue-50 to-cyan-100 border border-blue-200/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UsersIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Réponses Reçues
                    </dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
                      {stats.reponses}
                    </dd>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-purple-50 to-violet-100 border border-purple-200/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CalendarIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Taux Participation
                    </dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
                      {stats.taux_participation}%
                    </dd>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    <CalendarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Options avec design moderne */}
        <div className="bg-white border-0 rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <FunnelIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Filtres et Options</h3>
                <p className="text-indigo-100 mt-1">Personnalisez l'affichage de vos formulaires</p>
              </div>
            </div>
          </div>
          <div className="px-8 py-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-indigo-600" />
                  Session de formation
                </label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white hover:border-indigo-300"
                >
                  <option value="all">🎯 Toutes les sessions</option>
                  {SESSIONS.map((session: Session) => (
                    <option key={session.value} value={session.value}>
                      📅 {session.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilterSession('all')}
                  className="w-full group inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300">🔄</div>
                  Réinitialiser
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchFormulaires}
                  className="w-full group inline-flex justify-center items-center px-6 py-3 border-0 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-4 h-4 mr-2 group-hover:animate-spin transition-all duration-300">⚡</div>
                  Actualiser
                </button>
              </div>
              <div className="flex items-end">
                <div className="w-full bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3 text-center">
                  <div className="text-sm font-medium text-emerald-800">
                    {filteredFormulaires.length} formulaire{filteredFormulaires.length !== 1 ? 's' : ''} trouvé{filteredFormulaires.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des formulaires avec design moderne */}
        <div className="bg-white border-0 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Vos Formulaires
                  </h3>
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center space-x-2 text-blue-100">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {filteredFormulaires.length} formulaire{filteredFormulaires.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-100">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {stats.actifs} actif{stats.actifs !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-100">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {stats.reponses} réponse{stats.reponses !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right text-white">
                  <div className="text-2xl font-bold text-emerald-400">
                    {Math.round((stats.actifs / Math.max(stats.total, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-gray-300">de formulaires actifs</div>
                </div>
                <div className="relative">
                  <div className="w-32 h-4 bg-gray-700 rounded-full shadow-inner overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 h-4 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${Math.min((stats.actifs / Math.max(stats.total, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {stats.actifs}/{stats.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        {filteredFormulaires.length === 0 ? (
          <div className="text-center py-20 px-8">
            <div className="relative">
              {/* Éléments décoratifs */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full w-32 h-32 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white to-indigo-50/30 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8 border-2 border-indigo-200/40 shadow-2xl">
                <DocumentTextIcon className="h-16 w-16 text-indigo-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Aucun formulaire trouvé</h3>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Commencez par créer votre premier formulaire quotidien pour suivre les progrès de vos stagiaires et améliorer la qualité de vos formations.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <PlusIcon className="w-6 h-6 mr-4 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              <span className="relative z-10">🚀 Créer mon premier formulaire</span>
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              {filteredFormulaires.map((formulaire) => (
                <div key={formulaire.id} className="group relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* En-tête de la carte */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">
                            {formulaire.titre}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {formulaire.description || 'Aucune description disponible'}
                          </p>
                        </div>
                      </div>
                      {/* Badges de statut */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {formulaire.valide ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Brouillon
                          </span>
                        )}
                        {formulaire.actif && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                            En cours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Corps de la carte avec les informations */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Session</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {SESSIONS.find(s => s.value === formulaire.session)?.label || formulaire.session}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            {formulaire.niveau}
                          </div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Niveau</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          IRATA Niveau {formulaire.niveau}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentTextIcon className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Questions</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {formulaire.questions.length} question{formulaire.questions.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Total: {formulaire.questions.reduce((sum, q) => sum + (q.points || 0.5), 0).toFixed(1)} points
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <UsersIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Réponses</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {formulaire.nombreReponses}
                        </p>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">
                            <strong>Période:</strong> Du {new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au {new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          Créé le {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Section des boutons d'action réorganisée */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Boutons principaux à gauche */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleValidateFormulaire(formulaire.id, !formulaire.valide)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                              formulaire.valide
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg'
                            }`}
                            title={formulaire.valide ? 'Masquer aux stagiaires' : 'Valider et notifier les stagiaires'}
                          >
                            {formulaire.valide ? (
                              <>
                                <XCircleIcon className="h-4 w-4 mr-2" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Valider
                              </>
                            )}
                          </button>

                          {formulaire.valide && new Date() < new Date(formulaire.dateDebut) && (
                            <button
                              onClick={() => handleOpenNow(formulaire.id)}
                              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
                              title="Ouvrir immédiatement"
                            >
                              <ClockIcon className="h-4 w-4 mr-2" />
                              Ouvrir maintenant
                            </button>
                          )}
                        </div>

                        {/* Boutons secondaires à droite */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDuplicateFormulaire(formulaire)}
                            className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors duration-200"
                            title="Dupliquer"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />
                            Dupliquer
                          </button>

                          <button
                            onClick={() => handleEditFormulaire(formulaire)}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4 mr-1.5" />
                            Modifier
                          </button>

                          <button
                            onClick={() => handleDeleteFormulaire(formulaire.id)}
                            className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[78vh] overflow-hidden flex flex-col mt-28">
              {/* Header de la modal */}
              {modalError && (
                  <div className="sticky top-0 z-100">
                    <div className="rounded-md bg-red-50 p-2 border border-red-200 shadow">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-red-800">Erreur</h4>
                          <div className="mt-1 text-sm text-red-700">{modalError}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/* <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50"> */}
                
                {/* <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingFormulaire ? 'Modifier le formulaire' : createForm.titre.includes('(Copie)') ? 'Dupliquer le formulaire' : 'Créer un nouveau formulaire'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingFormulaire 
                        ? 'Modifiez les informations et questions' 
                        : createForm.titre.includes('(Copie)') 
                          ? 'Modifiez le niveau, les questions et les informations du formulaire dupliqué'
                          : 'Configurez votre questionnaire quotidien'
                      }
                    </p>
                  </div>
                </div> */}
                {/* <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFormulaire(null);
                    resetCreateForm();
                    setModalError(null);
                    setErrorQuestionIndex(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button> */}
              {/* </div> */}

              {/* Contenu scrollable de la modal */}
              <div ref={modalScrollRef} className="flex-1 overflow-y-auto p-6">

                <form id="formulaireForm" className="space-y-8">
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
                      <div className="flex items-center space-x-4">
                        {/* Indicateur du total des points */}
                        <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm ${
                          createForm.questions.length > 0 
                            ? (() => {
                                const total = createForm.questions.reduce((sum, q) => sum + (q.points || 0.5), 0);
                                if (Math.abs(total - 20) < 0.01) {
                                  return 'bg-green-100 border-green-500 text-green-800';
                                } else if (total > 20) {
                                  return 'bg-red-100 border-red-500 text-red-800';
                                } else {
                                  return 'bg-yellow-100 border-yellow-500 text-yellow-800';
                                }
                              })()
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        }`}>
                          Total: {createForm.questions.length > 0 
                            ? createForm.questions.reduce((sum, q) => sum + (q.points || 0.5), 0).toFixed(1)
                            : '0.0'
                          }/20 points
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
                          <div
                            key={question.id}
                            ref={(el) => {
                              questionRefs.current[index] = el;
                            }}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                                                                <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  {question.points || 0.5} point{(question.points || 0.5) !== 1 ? 's' : ''}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.type === 'text' ? '📝 Texte' : 
                                   question.type === 'textarea' ? '📄 Texte long' :
                                   question.type === 'select' ? '📋 Choix unique' :
                                   question.type === 'radio' ? '⚪ Choix unique' :
                                   question.type === 'checkbox' ? '☑️ Choix multiple' :
                                   '🔢 Nombre'}
                                </span>
                                {/* Indicateur des points restants */}
                                {(() => {
                                  const currentTotal = createForm.questions.reduce((sum, q) => sum + (q.points || 0.5), 0);
                                  const remaining = 20 - currentTotal;
                                  if (Math.abs(remaining) < 0.01) {
                                    return (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ 20/20
                                      </span>
                                    );
                                  } else if (remaining > 0) {
                                    return (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        ⚠️ +{remaining.toFixed(1)}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        ✗ -{Math.abs(remaining).toFixed(1)}
                                      </span>
                                    );
                                  }
                                })()}
                              </div>
                                </div>
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
                              
                              {/* Options pour les questions à choix */}
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
                                  {(question.options && question.options.length > 0) && (
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
                                </>
                              )}

                              {/* Champs pour la bonne réponse et les points (questions texte et nombre) */}
                              {(question.type === 'text' || question.type === 'textarea' || question.type === 'number') && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bonne réponse *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={question.correctAnswers?.[0] || ''}
                                    onChange={(e) => updateQuestion(index, 'correctAnswers', [e.target.value])}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ex: Très bien, 42, Excellent..."
                                  />
                                </div>
                              )}

                              {/* Champ points pour TOUTES les questions */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Points pour cette question * (minimum 0.5)
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="0.5"
                                  max="100"
                                  step="0.5"
                                  value={question.points}
                                  onChange={(e) => updateQuestion(index, 'points', parseFloat(e.target.value) || 0.5)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="0.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Vous pouvez attribuer 0.5, 1, 1.5, 2, etc. points par question
                                </p>
                              </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      <span className="text-amber-600">⚠️</span> Pour les questions de type nombre, utilisez le champ "Bonne réponse" ci-dessus
                                    </label>
                                  </div>
                                </div>
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
                      <div className="space-y-1">
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {createForm.questions.length} question{createForm.questions.length !== 1 ? 's' : ''} configurée{createForm.questions.length !== 1 ? 's' : ''}
                          {createForm.titre.includes('(Copie)') && (
                            <span className="ml-2 text-purple-600">
                              • Formulaire dupliqué
                            </span>
                          )}
                        </span>
                        {/* Statut des points */}
                        {(() => {
                          const total = createForm.questions.reduce((sum, q) => sum + (q.points || 0.5), 0);
                          if (Math.abs(total - 20) < 0.01) {
                            return (
                              <span className="flex items-center text-green-600">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Total des points : {total.toFixed(1)}/20 ✓
                              </span>
                            );
                          } else if (total > 20) {
                            return (
                              <span className="flex items-center text-red-600">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Total des points : {total.toFixed(1)}/20 ✗ (trop de points)
                              </span>
                            );
                          } else {
                            return (
                              <span className="flex items-center text-yellow-600">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Total des points : {total.toFixed(1)}/20 ⚠️ (points manquants)
                              </span>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingFormulaire(null);
                      resetCreateForm();
                      setModalError(null);
                      setErrorQuestionIndex(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={createForm.questions.length === 0 || submitting}
                    onClick={editingFormulaire ? handleUpdateFormulaire : handleCreateFormulaire}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingFormulaire ? 'Mise à jour...' : createForm.titre.includes('(Copie)') ? 'Duplication...' : 'Création...'}
                      </div>
                    ) : (
                      editingFormulaire 
                        ? 'Mettre à jour le formulaire' 
                        : createForm.titre.includes('(Copie)') 
                          ? 'Créer la copie du formulaire'
                          : 'Créer le formulaire'
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