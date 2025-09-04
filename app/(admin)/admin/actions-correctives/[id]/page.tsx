'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ActionCorrective {
  id: string;
  titre: string;
  description: string;
  type: string;
  statut: string;
  priorite: string;
  dateDebut: string;
  dateEcheance?: string;
  dateRealisation?: string;
  resultats?: string;
  efficacite?: string;
  nonConformite: {
    id: string;
    numero: string;
    titre: string;
    type: string;
    gravite: string;
    statut: string;
    detecteur: {
      id: string;
      nom?: string;
      prenom?: string;
      email: string;
    };
    responsable?: {
      id: string;
      nom?: string;
      prenom?: string;
      email: string;
    };
  };
  responsable: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  commentaires: Commentaire[];
  documents: Document[];
}

interface Commentaire {
  id: string;
  commentaire: string;
  createdAt: string;
  user: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
}

interface Document {
  id: string;
  nom: string;
  description?: string;
  url: string;
  type: string;
  createdAt: string;
}

const typeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const statutLabels = {
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  EN_ATTENTE: 'En attente',
  ANNULEE: 'Annulée'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const efficaciteLabels = {
  TRES_EFFICACE: 'Très efficace',
  EFFICACE: 'Efficace',
  PARTIELLEMENT_EFFICACE: 'Partiellement efficace',
  INEFFICACE: 'Inefficace'
};

const statutColors = {
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  TERMINEE: 'bg-green-100 text-green-800',
  EN_ATTENTE: 'bg-blue-100 text-blue-800',
  ANNULEE: 'bg-gray-100 text-gray-800'
};

const prioriteColors = {
  BASSE: 'bg-gray-100 text-gray-800',
  MOYENNE: 'bg-blue-100 text-blue-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

export default function AdminActionCorrectiveDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [actionCorrective, setActionCorrective] = useState<ActionCorrective | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    titre: '',
    description: '',
    type: '',
    statut: '',
    priorite: '',
    responsableId: '',
    dateEcheance: '',
    dateRealisation: '',
    resultats: '',
    efficacite: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchActionCorrective();
    }
  }, [params.id]);

  const fetchActionCorrective = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/actions-correctives/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setActionCorrective(data);
        setEditForm({
          titre: data.titre,
          description: data.description,
          type: data.type,
          statut: data.statut,
          priorite: data.priorite,
          responsableId: data.responsableId,
          dateEcheance: data.dateEcheance ? new Date(data.dateEcheance).toISOString().split('T')[0] : '',
          dateRealisation: data.dateRealisation ? new Date(data.dateRealisation).toISOString().split('T')[0] : '',
          resultats: data.resultats || '',
          efficacite: data.efficacite || ''
        });
      } else {
        console.error('Erreur lors du chargement de l\'action corrective');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (actionCorrective) {
      setEditForm({
        titre: actionCorrective.titre,
        description: actionCorrective.description,
        type: actionCorrective.type,
        statut: actionCorrective.statut,
        priorite: actionCorrective.priorite,
        responsableId: (actionCorrective as any).responsableId,
        dateEcheance: actionCorrective.dateEcheance ? new Date(actionCorrective.dateEcheance).toISOString().split('T')[0] : '',
        dateRealisation: actionCorrective.dateRealisation ? new Date(actionCorrective.dateRealisation).toISOString().split('T')[0] : '',
        resultats: actionCorrective.resultats || '',
        efficacite: actionCorrective.efficacite || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/actions-correctives/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchActionCorrective();
        setEditing(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateEcheance?: string) => {
    if (!dateEcheance) return false;
    return new Date(dateEcheance) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!actionCorrective) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Action corrective non trouvée</h1>
            <p className="text-gray-600 mb-6">L'action corrective que vous recherchez n'existe pas.</p>
            <Link
              href="/admin/actions-correctives"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{actionCorrective.titre}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${prioriteColors[actionCorrective.priorite as keyof typeof prioriteColors]}`}>
              {prioriteLabels[actionCorrective.priorite as keyof typeof prioriteColors]}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statutColors[actionCorrective.statut as keyof typeof statutColors]}`}>
              {statutLabels[actionCorrective.statut as keyof typeof statutColors]}
            </span>
            {isOverdue(actionCorrective.dateEcheance) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                En retard
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
                {!editing && (
                  <button
                    onClick={handleEdit}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editForm.titre}
                      onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priorité
                      </label>
                      <select
                        value={editForm.priorite}
                        onChange={(e) => setEditForm({ ...editForm, priorite: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {Object.entries(prioriteLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={editForm.statut}
                        onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {Object.entries(statutLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Efficacité
                      </label>
                      <select
                        value={editForm.efficacite}
                        onChange={(e) => setEditForm({ ...editForm, efficacite: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Non évaluée</option>
                        {Object.entries(efficaciteLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'échéance
                      </label>
                      <input
                        type="date"
                        value={editForm.dateEcheance}
                        onChange={(e) => setEditForm({ ...editForm, dateEcheance: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de réalisation
                      </label>
                      <input
                        type="date"
                        value={editForm.dateRealisation}
                        onChange={(e) => setEditForm({ ...editForm, dateRealisation: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Résultats
                    </label>
                    <textarea
                      value={editForm.resultats}
                      onChange={(e) => setEditForm({ ...editForm, resultats: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Décrivez les résultats obtenus..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-gray-700 mb-6">{actionCorrective.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Type:</span>
                      <span className="ml-2 text-gray-600">{typeLabels[actionCorrective.type as keyof typeof typeLabels]}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Début:</span>
                      <span className="ml-2 text-gray-600">{formatDate(actionCorrective.dateDebut)}</span>
                    </div>
                    {actionCorrective.dateEcheance && (
                      <div>
                        <span className="font-medium text-gray-900">Échéance:</span>
                        <span className="ml-2 text-gray-600">{formatDate(actionCorrective.dateEcheance)}</span>
                      </div>
                    )}
                    {actionCorrective.dateRealisation && (
                      <div>
                        <span className="font-medium text-gray-900">Réalisée le:</span>
                        <span className="ml-2 text-gray-600">{formatDate(actionCorrective.dateRealisation)}</span>
                      </div>
                    )}
                    {actionCorrective.efficacite && (
                      <div>
                        <span className="font-medium text-gray-900">Efficacité:</span>
                        <span className="ml-2 text-gray-600">{efficaciteLabels[actionCorrective.efficacite as keyof typeof efficaciteLabels]}</span>
                      </div>
                    )}
                  </div>

                  {actionCorrective.resultats && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-900">Résultats:</span>
                      <p className="mt-1 text-gray-700">{actionCorrective.resultats}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Commentaires */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commentaires</h3>
              
              {actionCorrective.commentaires.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun commentaire</p>
              ) : (
                <div className="space-y-4">
                  {actionCorrective.commentaires.map((commentaire) => (
                    <div key={commentaire.id} className="border-l-4 border-indigo-200 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {commentaire.user.nom || commentaire.user.email}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(commentaire.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{commentaire.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Non-conformité associée */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Non-conformité associée</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-900">Numéro:</span>
                  <p className="text-gray-600">{actionCorrective.nonConformite.numero}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Titre:</span>
                  <p className="text-gray-600">{actionCorrective.nonConformite.titre}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Détecteur:</span>
                  <p className="text-gray-600">{actionCorrective.nonConformite.detecteur.nom || actionCorrective.nonConformite.detecteur.email}</p>
                </div>
                <Link
                  href={`/admin/non-conformites/${actionCorrective.nonConformite.id}`}
                  className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors mt-2"
                >
                  Voir la non-conformité
                </Link>
              </div>
            </div>

            {/* Responsable */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsable</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-900">Nom:</span>
                  <p className="text-gray-600">{actionCorrective.responsable.nom || actionCorrective.responsable.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Email:</span>
                  <p className="text-gray-600">{actionCorrective.responsable.email}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {actionCorrective.documents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-2">
                  {actionCorrective.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{doc.nom}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
