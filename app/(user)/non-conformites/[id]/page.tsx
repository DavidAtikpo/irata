'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NonConformite {
  id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  gravite: string;
  statut: string;
  dateDetection: string;
  dateEcheance?: string;
  lieu?: string;
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
  actionsCorrectives: ActionCorrective[];
  commentaires: Commentaire[];
  documents: Document[];
}

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
  responsable: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  commentaires: Commentaire[];
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
  SECURITE: 'Sécurité',
  QUALITE: 'Qualité',
  PROCEDURE: 'Procédure',
  EQUIPEMENT: 'Équipement',
  FORMATION: 'Formation',
  DOCUMENTATION: 'Documentation',
  ENVIRONNEMENT: 'Environnement',
  AUTRE: 'Autre'
};

const graviteLabels = {
  MINEURE: 'Mineure',
  MAJEURE: 'Majeure',
  CRITIQUE: 'Critique'
};

const statutLabels = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  FERMEE: 'Fermée',
  ANNULEE: 'Annulée'
};

const actionTypeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const graviteColors = {
  MINEURE: 'bg-yellow-100 text-yellow-800',
  MAJEURE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

const statutColors = {
  OUVERTE: 'bg-blue-100 text-blue-800',
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  FERMEE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-gray-100 text-gray-800'
};

const prioriteColors = {
  BASSE: 'bg-gray-100 text-gray-800',
  MOYENNE: 'bg-blue-100 text-blue-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

export default function NonConformiteDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [nonConformite, setNonConformite] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchNonConformite();
    }
  }, [params.id]);

  const fetchNonConformite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/non-conformites/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformite(data);
      } else {
        console.error('Erreur lors du chargement de la non-conformité');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/user/non-conformites/${params.id}/commentaires`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentaire: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchNonConformite(); // Recharger les données
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
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

  if (!nonConformite) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Non-conformité non trouvée</h1>
            <p className="text-gray-600 mb-6">La non-conformité que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de la consulter.</p>
            <Link
              href="/non-conformites"
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
            <h1 className="text-3xl font-bold text-gray-900">{nonConformite.numero}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${graviteColors[nonConformite.gravite as keyof typeof graviteColors]}`}>
              {graviteLabels[nonConformite.gravite as keyof typeof graviteLabels]}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statutColors[nonConformite.statut as keyof typeof statutColors]}`}>
              {statutLabels[nonConformite.statut as keyof typeof statutLabels]}
            </span>
            {isOverdue(nonConformite.dateEcheance) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                En retard
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{nonConformite.titre}</h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{nonConformite.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="font-medium text-gray-900">Type:</span>
                  <span className="ml-2 text-gray-600">{typeLabels[nonConformite.type as keyof typeof typeLabels]}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Lieu:</span>
                  <span className="ml-2 text-gray-600">{nonConformite.lieu || 'Non spécifié'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Détectée le:</span>
                  <span className="ml-2 text-gray-600">{formatDate(nonConformite.dateDetection)}</span>
                </div>
                {nonConformite.dateEcheance && (
                  <div>
                    <span className="font-medium text-gray-900">Échéance:</span>
                    <span className="ml-2 text-gray-600">{formatDate(nonConformite.dateEcheance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions correctives */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actions correctives</h3>
                <Link
                  href={`/actions-correctives/nouvelle?nonConformiteId=${nonConformite.id}`}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors text-center sm:text-left"
                >
                  Ajouter une action
                </Link>
              </div>
              
              {nonConformite.actionsCorrectives.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune action corrective définie</p>
              ) : (
                <div className="space-y-4">
                  {nonConformite.actionsCorrectives.map((action) => (
                    <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{action.titre}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${prioriteColors[action.priorite as keyof typeof prioriteColors]}`}>
                            {prioriteLabels[action.priorite as keyof typeof prioriteLabels]}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statutColors[action.statut as keyof typeof statutColors]}`}>
                            {statutLabels[action.statut as keyof typeof statutLabels]}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{action.description}</p>
                      <div className="text-xs text-gray-500">
                        <span>Type: {actionTypeLabels[action.type as keyof typeof actionTypeLabels]}</span>
                        <span className="mx-2">•</span>
                        <span>Responsable: {action.responsable.nom || action.responsable.email}</span>
                        {action.dateEcheance && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Échéance: {formatDate(action.dateEcheance)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commentaires */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Commentaires</h3>
              
              {/* Formulaire d'ajout de commentaire */}
              <form onSubmit={handleAddComment} className="mb-4 sm:mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {submittingComment ? 'Ajout...' : 'Ajouter le commentaire'}
                </button>
              </form>

              {/* Liste des commentaires */}
              {nonConformite.commentaires.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun commentaire</p>
              ) : (
                <div className="space-y-4">
                  {nonConformite.commentaires.map((commentaire) => (
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
          <div className="space-y-4 sm:space-y-6">
            {/* Informations sur les participants */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Participants</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-900">Détecteur:</span>
                  <p className="text-gray-600">{nonConformite.detecteur.nom || nonConformite.detecteur.email}</p>
                </div>
                {nonConformite.responsable && (
                  <div>
                    <span className="font-medium text-gray-900">Responsable:</span>
                    <p className="text-gray-600">{nonConformite.responsable.nom || nonConformite.responsable.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {nonConformite.documents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Documents</h3>
                <div className="space-y-2">
                  {nonConformite.documents.map((doc) => (
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
