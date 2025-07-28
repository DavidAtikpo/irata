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
  AdjustmentsHorizontalIcon
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

export default function FormulairesQuotidiensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formulaires, setFormulaires] = useState<FormulaireQuotidien[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFormulaire, setEditingFormulaire] = useState<FormulaireQuotidien | null>(null);
  const [filterSession, setFilterSession] = useState('all');

  const { addNotification } = useNotifications();

  const [createForm, setCreateForm] = useState({
    titre: '',
    description: '',
    session: '',
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
      const response = await fetch('/api/admin/formulaires-quotidiens');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setFormulaires(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.questions.length === 0) {
      alert('Veuillez ajouter au moins une question');
      return;
    }

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
        throw new Error('Erreur lors de la création du formulaire');
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
      
      alert('Formulaire créé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du formulaire');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      titre: '',
      description: '',
      session: '',
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
      required: true
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

  const handleEditFormulaire = (formulaire: FormulaireQuotidien) => {
    setEditingFormulaire(formulaire);
    setCreateForm({
      titre: formulaire.titre,
      description: formulaire.description || '',
      session: formulaire.session,
      dateDebut: formulaire.dateDebut,
      dateFin: formulaire.dateFin,
      questions: [...formulaire.questions]
    });
    setShowCreateForm(true);
  };

  const handleUpdateFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFormulaire) return;

    try {
      const response = await fetch(`/api/admin/formulaires-quotidiens/${editingFormulaire.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du formulaire');
      }

      setShowCreateForm(false);
      setEditingFormulaire(null);
      resetCreateForm();
      await fetchFormulaires();
      alert('Formulaire mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du formulaire');
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
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Formulaires Quotidiens</h1>
              <p className="mt-2 text-sm text-gray-600">
                Créez des questionnaires pour les stagiaires et validez leur affichage
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/formulaires-quotidiens/reponses')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Voir les réponses
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau formulaire
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Toutes les sessions</option>
                {SESSIONS.map((session: Session) => (
                  <option key={session.value} value={session.value}>
                    {session.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des formulaires */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Formulaires créés ({filteredFormulaires.length})
            </h2>
          </div>
          
          {filteredFormulaires.length === 0 ? (
            <div className="p-6 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun formulaire</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer un nouveau formulaire quotidien.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredFormulaires.map((formulaire) => (
                <li key={formulaire.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formulaire.titre}
                        </h3>
                        <div className="flex space-x-2">
                          {formulaire.valide ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <XCircleIcon className="h-3 w-3 mr-1" />
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
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{formulaire.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Session: {formulaire.session}
                          </span>
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {formulaire.questions.length} questions
                          </span>
                          <span className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-1" />
                            {formulaire.nombreReponses} réponses
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Bouton Valider/Invalider */}
                      <button
                        onClick={() => handleValidateFormulaire(formulaire.id, !formulaire.valide)}
                        className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
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
                            Valider & Notifier
                          </>
                        )}
                      </button>

                      {/* Bouton Modifier */}
                      <button
                        onClick={() => handleEditFormulaire(formulaire)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        title="Modifier le formulaire"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDeleteFormulaire(formulaire.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                        title="Supprimer le formulaire"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal de création/modification */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingFormulaire ? 'Modifier le formulaire' : 'Créer un nouveau formulaire'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingFormulaire(null);
                      resetCreateForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={editingFormulaire ? handleUpdateFormulaire : handleCreateFormulaire} className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Informations générales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre du formulaire *
                        </label>
                        <input
                          type="text"
                          required
                          value={createForm.titre}
                          onChange={(e) => setCreateForm({ ...createForm, titre: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Ex: Évaluation quotidienne formation IRATA"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session *
                        </label>
                        <select
                          required
                          value={createForm.session}
                          onChange={(e) => setCreateForm({ ...createForm, session: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          required
                          value={createForm.dateDebut}
                          onChange={(e) => setCreateForm({ ...createForm, dateDebut: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de fin *
                        </label>
                        <input
                          type="date"
                          required
                          value={createForm.dateFin}
                          onChange={(e) => setCreateForm({ ...createForm, dateFin: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Description du formulaire (optionnel)"
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Questions ({createForm.questions.length})
                      </h4>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Ajouter une question
                      </button>
                    </div>

                    {createForm.questions.length === 0 ? (
                      <div className="text-center py-8">
                        <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune question</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Cliquez sur "Ajouter une question" pour commencer.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {createForm.questions.map((question, index) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer cette question"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={question.question}
                                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                  placeholder="Saisissez votre question"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Type de réponse
                                </label>
                                <select
                                  value={question.type}
                                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                  <option value="text">Texte court</option>
                                  <option value="textarea">Texte long</option>
                                  <option value="select">Liste déroulante</option>
                                  <option value="radio">Choix unique</option>
                                  <option value="checkbox">Choix multiple</option>
                                  <option value="number">Nombre</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Question obligatoire</span>
                                </label>
                              </div>
                              
                              {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Options (une par ligne)
                                  </label>
                                  <textarea
                                    value={question.options?.join('\n') || ''}
                                    onChange={(e) => updateQuestion(index, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingFormulaire(null);
                        resetCreateForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createForm.questions.length === 0}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingFormulaire ? 'Mettre à jour' : 'Créer le formulaire'}
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