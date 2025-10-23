'use client';

import { useState, useEffect, useRef } from 'react';
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
  // Options spécifiques nombres (aligné avec l'admin)
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
  const [error, setError] = useState<string | null>(null);
  const [selectedFormulaire, setSelectedFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'completed'>('all');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autosaveTimerRef = useRef<any>(null);

  const [formData, setFormData] = useState<{
    [questionId: string]: any;
    commentaires: string;
  }>({
    commentaires: ''
  });

  // États pour le mode correction
  const [correctionMode, setCorrectionMode] = useState(false);
  const [reponseOriginale, setReponseOriginale] = useState<any>(null);
  const [pendingFormulaireId, setPendingFormulaireId] = useState<string | null>(null);
  const [correctionData, setCorrectionData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (status === 'authenticated') {
      fetchFormulaires();
      
      // Vérifier si on est en mode correction
      const urlParams = new URLSearchParams(window.location.search);
      const correctionId = urlParams.get('correction');
      if (correctionId) {
        setCorrectionMode(true);
        fetchReponseOriginale(correctionId);
      }
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

  const fetchReponseOriginale = async (reponseId: string) => {
    try {
      const response = await fetch(`/api/user/formulaires-quotidiens/reponses/${reponseId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la réponse originale');
      }
      const data = await response.json();
      setReponseOriginale(data);
      setCorrectionData(data.correction);
      setPendingFormulaireId(data.formulaireId);

      // Pré-remplir le formulaire avec les réponses originales
      const initialFormData: any = { commentaires: data.commentaires || '' };
      data.reponses.forEach((reponse: any) => {
        initialFormData[reponse.questionId] = reponse.reponse;
      });
      setFormData(initialFormData);

      // La sélection effective du formulaire se fera quand la liste est chargée
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger la réponse originale');
    }
  };

  // Une fois les formulaires chargés, si on vient d'une correction, sélectionner et ouvrir
  useEffect(() => {
    if (pendingFormulaireId && formulaires.length > 0) {
      const formulaire = formulaires.find(f => f.id === pendingFormulaireId);
      if (formulaire) {
        setSelectedFormulaire(formulaire);
        setShowForm(true);
        setPendingFormulaireId(null);
      }
    }
  }, [pendingFormulaireId, formulaires]);

  const handleStartForm = (formulaire: FormulaireQuotidien) => {
    setSelectedFormulaire(formulaire);
    // Load draft if exists
    try {
      const draftKey = `fq_draft_${formulaire.id}`;
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData({ ...parsed });
        setLastSavedAt(parsed.__savedAt || null);
      } else {
        setFormData({ commentaires: '' });
        setLastSavedAt(null);
      }
    } catch {
      setFormData({ commentaires: '' });
      setLastSavedAt(null);
    }
    setShowForm(true);
  };

  // Fonction pour normaliser une réponse textuelle (enlever accents, espaces, symboles)
  const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      // Enlever les accents
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Enlever les symboles courants (°, %, €, etc.)
      .replace(/[°%€$£¥]/g, '')
      // Enlever les espaces multiples
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fonction pour vérifier si deux réponses textuelles sont équivalentes
  const areTextAnswersEquivalent = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);
    
    // Comparaison exacte après normalisation
    if (normalizedUser === normalizedCorrect) {
      return true;
    }
    
    // Vérifier si la réponse utilisateur contient la réponse correcte (ou vice-versa)
    // Utile pour "90" vs "90 degrés" ou "90°"
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
      // Vérifier que ce n'est pas une sous-chaîne accidentelle
      const lengthDiff = Math.abs(normalizedUser.length - normalizedCorrect.length);
      // Accepter si la différence est petite (< 5 caractères)
      if (lengthDiff <= 5) {
        return true;
      }
    }
    
    return false;
  };

  // Function to calculate score for scored questions
  const calculateScore = (questions: Question[], userResponses: { [questionId: string]: any }) => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(question => {
      const points = question.points || 1;
      const questionId = question.id || `question_${question.question.substring(0, 10)}`;
      const userAnswer = userResponses[questionId];

      // Sélection/radio/checkbox via correctAnswers
      if (question.scoringEnabled && question.correctAnswers && question.correctAnswers.length > 0) {
        maxScore += points;
        if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
          if (question.type === 'radio' || question.type === 'select') {
            if (question.correctAnswers.includes(userAnswer)) {
              totalScore += points;
            }
          } else if (question.type === 'checkbox') {
            const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
            const correctAnswersSet = new Set(question.correctAnswers);
            const userAnswersSet = new Set(userAnswersArray);
            if (correctAnswersSet.size === userAnswersSet.size &&
                [...correctAnswersSet].every(answer => userAnswersSet.has(answer))) {
              totalScore += points;
            }
          } else if (question.type === 'text' || question.type === 'textarea') {
            // Comparaison flexible pour les réponses textuelles
            const userAnswerStr = String(userAnswer);
            const isCorrect = question.correctAnswers.some(correctAnswer => 
              areTextAnswersEquivalent(userAnswerStr, correctAnswer)
            );
            if (isCorrect) {
              totalScore += points;
            }
          }
        }
      }

      // Nombre: comparaison exacte avec numberCorrect si activé
      if (question.scoringEnabled && question.type === 'number' && typeof question.numberCorrect === 'number') {
        maxScore += points;
        const numericAnswer = typeof userAnswer === 'number' ? userAnswer : Number(userAnswer);
        if (!Number.isNaN(numericAnswer) && numericAnswer === question.numberCorrect) {
          totalScore += points;
        }
      }
    });

    return { totalScore, maxScore };
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

      // Calculate score if there are scored questions
      const { totalScore, maxScore } = calculateScore(selectedFormulaire.questions, formData);

      // Choisir l'endpoint selon le mode
      const endpoint = correctionMode 
        ? '/api/user/formulaires-quotidiens/resubmit'
        : '/api/user/formulaires-quotidiens/reponses';
      
      const requestBody = correctionMode 
        ? {
            reponseOriginaleId: reponseOriginale.id,
            reponses,
            commentaires: formData.commentaires
          }
        : {
            formulaireId: selectedFormulaire.id,
            reponses,
            commentaires: formData.commentaires,
            score: maxScore > 0 ? totalScore : undefined,
            maxScore: maxScore > 0 ? maxScore : undefined
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }

      setShowForm(false);
      setSelectedFormulaire(null);
      setFormData({ commentaires: '' });
      clearDraft(selectedFormulaire.id);
      await fetchFormulaires(); 
      
      // Show success message
      if (correctionMode) {
        alert('Correction soumise avec succès !\n\nVotre nouvelle version a été envoyée pour révision.');
        // Rediriger vers les corrections
        router.push('/formulaires-quotidiens/corrections');
      } else {
        // Show success message with score if available
        if (maxScore > 0) {
          const percentage = Math.round((totalScore / maxScore) * 100);
          alert(`Formulaire soumis avec succès !\n\nVotre score : ${totalScore}/${maxScore} (${percentage}%)`);
        } else {
          alert('Formulaire soumis avec succès !');
        }
      }
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
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Votre réponse..."
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            rows={3}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Votre réponse détaillée..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            min={question.numberMin !== undefined ? question.numberMin : undefined}
            max={question.numberMax !== undefined ? question.numberMax : undefined}
            step={question.numberStep !== undefined ? question.numberStep : 'any'}
            onChange={(e) => {
              const val = e.target.value;
              handleInputChange(questionId, val === '' ? '' : Number(val));
            }}
            required={question.required}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Entrez un nombre${question.numberUnit ? ` (${question.numberUnit})` : ''}...`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={question.required}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <div className="space-y-1">
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
                <span className="text-xs text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-1">
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
                <span className="text-xs text-gray-700">{option}</span>
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

  // Autosave draft when formData changes (debounced)
  useEffect(() => {
    if (!showForm || !selectedFormulaire) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      try {
        const draftKey = `fq_draft_${selectedFormulaire.id}`;
        const payload = { ...formData, __savedAt: new Date().toISOString() };
        localStorage.setItem(draftKey, JSON.stringify(payload));
        setLastSavedAt(payload.__savedAt);
      } catch {}
    }, 600);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [formData, showForm, selectedFormulaire]);

  const saveDraftManually = () => {
    if (!selectedFormulaire) return;
    try {
      const draftKey = `fq_draft_${selectedFormulaire.id}`;
      const payload = { ...formData, __savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setLastSavedAt(payload.__savedAt);
    } catch {}
  };

  const clearDraft = (formulaireId: string) => {
    try {
      localStorage.removeItem(`fq_draft_${formulaireId}`);
    } catch {}
  };

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
    <div className="py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-3 sm:mb-4">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Formulaires Quotidiens</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Répondez aux questionnaires de votre formation IRATA
            </p>
            <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500">
              <UserIcon className="h-3 w-3" />
              <span>Connecté: {session?.user?.prenom} {session?.user?.nom}</span>
            </div>
            <div className="mt-3">
              <button
                onClick={() => router.push('/formulaires-quotidiens/corrections')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                Voir mes corrections
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h2 className="text-sm sm:text-base font-medium text-gray-900">Mes formulaires</h2>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Filtrer:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="all">Tous</option>
                <option value="available">Disponibles</option>
                <option value="completed">Complétés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des formulaires */}
        <div className="space-y-2 sm:space-y-3">
          {filteredFormulaires.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 text-center">
              <DocumentTextIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">
                {filterStatus === 'all' 
                  ? 'Aucun formulaire disponible'
                  : filterStatus === 'available'
                  ? 'Aucun formulaire disponible actuellement'
                  : 'Aucun formulaire complété'
                }
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {filterStatus === 'all' 
                  ? 'Les formulaires apparaîtront ici une fois validés.'
                  : filterStatus === 'available'
                  ? 'Revenez plus tard ou changez le filtre.'
                  : 'Vous n\'avez pas encore complété de formulaires.'
                }
              </p>
            </div>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {filteredFormulaires.map((formulaire) => {
                const statut = getStatutFormulaire(formulaire);
                const dansLaPeriode = isFormulaireDansLaPeriode(formulaire);
                
                return (
                  <li key={formulaire.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                              {formulaire.titre}
                            </h3>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${statut.color} w-fit`}>
                              {statut.label}
                            </span>
                          </div>
                          
                          {formulaire.description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">{formulaire.description}</p>
                          )}
                          
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500">
                            <span className="flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Session: {formulaire.session}
                            </span>
                            <span className="flex items-center">
                              <DocumentTextIcon className="h-3 w-3 mr-1" />
                              {formulaire.questions.length} questions
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Du {new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au {new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Niveau {formulaire.niveau}
                              </span>
                            </span>
                          </div>

                          {formulaire.dejaRepondu && formulaire.dateDerniereReponse && (
                            <div className="mt-1 flex items-center text-xs text-green-600">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Répondu le {new Date(formulaire.dateDerniereReponse).toLocaleDateString('fr-FR')} à {new Date(formulaire.dateDerniereReponse).toLocaleTimeString('fr-FR')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end sm:ml-4">
                          {formulaire.dejaRepondu ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Complété</span>
                            </div>
                          ) : dansLaPeriode ? (
                            <button
                              onClick={() => handleStartForm(formulaire)}
                              className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Répondre
                              <ArrowRightIcon className="ml-1 h-3 w-3" />
                            </button>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">
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
            <div className="relative top-2 sm:top-4 mx-auto p-2 sm:p-4 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
              <div className="mt-2">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {selectedFormulaire.titre}
                      {correctionMode && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Mode Correction
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedFormulaire.questions.length} questions • Session: {selectedFormulaire.session}
                      {correctionMode && correctionData && (
                        <span className="block text-orange-600 mt-1">
                          Correction reçue le {new Date(correctionData.dateCorrection).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </p>
                    {lastSavedAt && (
                      <p className="text-[10px] sm:text-xs text-green-600 mt-1">Brouillon enregistré le {new Date(lastSavedAt).toLocaleString('fr-FR')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ commentaires: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitForm} className="space-y-3 sm:space-y-4">
                  {selectedFormulaire.description && (
                    <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded-lg">
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-blue-800">{selectedFormulaire.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Avertissement en mode correction */}
                  {correctionMode && correctionData && (
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Mode correction</h3>
                          <div className="mt-1 text-sm text-yellow-700">
                            <p>Seules les questions incorrectes sont affichées. Concentrez-vous sur vos erreurs et corrigez-les.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-3 sm:space-y-4">
                    {selectedFormulaire.questions
                      .filter((question) => {
                        // En mode correction, afficher seulement les questions incorrectes
                        if (correctionMode && reponseOriginale) {
                          const reponseQuestion = reponseOriginale.reponses.find((r: any) => r.questionId === question.id);
                          return reponseQuestion && !reponseQuestion.correcte;
                        }
                        // Sinon, afficher toutes les questions
                        return true;
                      })
                      .map((question, filteredIndex) => {
                        // Utiliser l'index original de la question pour la numérotation
                        const originalIndex = selectedFormulaire.questions.findIndex(q => q.id === question.id);
                        return (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-gray-50">
                        <div className="mb-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            <span className="inline-flex items-center">
                              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium mr-2">
                                {originalIndex + 1}
                              </span>
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </label>
                          <div className="mt-1">
                            {renderQuestion(question)}
                          </div>
                        </div>
                      </div>
                        );
                      })}
                  </div>

                  {/* Affichage des commentaires de correction */}
                  {correctionMode && correctionData && correctionData.commentaire && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-800 mb-2">Commentaires de correction</h4>
                      <p className="text-sm text-orange-700 whitespace-pre-wrap">{correctionData.commentaire}</p>
                    </div>
                  )}

                  {/* Commentaires */}
                  <div className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-gray-50">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Commentaires ou observations (optionnel)
                    </label>
                    <textarea
                      value={formData.commentaires}
                      onChange={(e) => handleInputChange('commentaires', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Partagez vos commentaires, questions ou observations..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={saveDraftManually}
                      className="px-3 py-1 sm:px-4 sm:py-2 border border-green-600 text-green-700 rounded text-xs font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Enregistrer le brouillon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ commentaires: '' });
                      }}
                      className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-1 sm:px-6 sm:py-2 border border-transparent rounded shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline-block"></div>
                          Soumission...
                        </>
                      ) : (
                        correctionMode ? 'Soumettre la correction' : 'Soumettre'
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