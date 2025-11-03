'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Demande {
  id: string;
  userId: string;
  statut: string;
  session: string;
  message: string | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  sessionChangeRequest: string | null;
  sessionChangeStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  sessionChangeReason: string | null;
  sessionChangeDate: string | null;
}

export default function MesDemandesPage() {
  const { status } = useSession();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [showChangeSessionModal, setShowChangeSessionModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [newSession, setNewSession] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDemandes();
      fetchSessions();
    }
  }, [status]);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('/api/demandes');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      setError('Erreur lors de la récupération des demandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/user/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
    }
  };

  const handleChangeSession = (demande: Demande) => {
    setSelectedDemande(demande);
    setNewSession(demande.session);
    setShowChangeSessionModal(true);
  };

  const handleUpdateSession = async () => {
    if (!selectedDemande || !newSession) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/demandes/${selectedDemande.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          session: newSession,
          reason: changeReason 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la demande');
      }

      // Recharger les demandes
      await fetchDemandes();
      setShowChangeSessionModal(false);
      setSelectedDemande(null);
      setNewSession('');
      setChangeReason('');
      
      // Message de succès
      alert('Votre demande de changement de session a été envoyée à l\'administrateur');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création de la demande de changement');
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 px-2 sm:px-3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-2 sm:px-3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-3 px-2 sm:px-3">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">Mes demandes de formation</h2>
          <p className="text-[10px] text-gray-600">Consultez l'état de vos demandes</p>
        </div>

        {demandes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-gray-600">Vous n&apos;avez pas encore fait de demande de formation</p>
            <Link
              href="/demande"
              className="mt-3 inline-flex items-center px-3 py-1 text-[10px] font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              Faire une demande de formation
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm overflow-hidden rounded">
            <ul className="divide-y divide-gray-200">
              {demandes.map((demande) => (
                <li key={demande.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="px-3 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[12px] font-medium text-gray-900 truncate">
                          Formation Cordiste IRATA - {demande.session}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          Session: {demande.session}
                        </p>
                        
                        {/* Affichage demande de changement de session */}
                        {demande.sessionChangeStatus === 'PENDING' && demande.sessionChangeRequest && (
                          <div className="mt-1 bg-blue-50 border border-blue-200 p-1.5 rounded">
                            <p className="text-[10px] text-blue-800">
                              <strong>🔄 Changement en attente:</strong> {demande.sessionChangeRequest}
                            </p>
                            {demande.sessionChangeReason && (
                              <p className="text-[9px] text-blue-600 mt-0.5">
                                Raison: {demande.sessionChangeReason}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {demande.sessionChangeStatus === 'APPROVED' && (
                          <div className="mt-1 bg-green-50 border border-green-200 p-1.5 rounded">
                            <p className="text-[10px] text-green-800">
                              ✅ Changement approuvé
                            </p>
                          </div>
                        )}
                        
                        {demande.sessionChangeStatus === 'REJECTED' && demande.sessionChangeRequest && (
                          <div className="mt-1 bg-red-50 border border-red-200 p-1.5 rounded">
                            <p className="text-[10px] text-red-800">
                              ❌ Changement refusé (demandée: {demande.sessionChangeRequest})
                            </p>
                          </div>
                        )}
                        
                        {demande.message && (
                          <p className="mt-1 text-[10px] text-gray-600">
                            Message: {demande.message}
                          </p>
                        )}
                        {demande.commentaire && (
                          <p className="mt-1 text-[10px] text-gray-600 bg-gray-50 p-1.5 rounded">
                            <strong>Commentaire admin:</strong> {demande.commentaire}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-1 items-end sm:items-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium ${
                            demande.statut === 'EN_ATTENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : demande.statut === 'VALIDE'
                              ? 'bg-green-100 text-green-800'
                              : demande.statut === 'REFUSE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {demande.statut === 'EN_ATTENTE'
                            ? 'Attente'
                            : demande.statut === 'VALIDE'
                            ? 'Validée'
                            : demande.statut === 'REFUSE'
                            ? 'Refusée'
                            : demande.statut === 'ANNULE'
                            ? 'Annulée'
                            : demande.statut}
                        </span>
                        {demande.sessionChangeStatus !== 'PENDING' && (
                          <button
                            onClick={() => handleChangeSession(demande)}
                            className="inline-flex items-center px-2 py-0.5 text-[9px] font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            {demande.sessionChangeStatus === 'REJECTED' ? '🔄 Nouvelle' : '🔄 Changer'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      Demandée le {new Date(demande.createdAt).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                      {demande.updatedAt !== demande.createdAt && (
                        <span className="ml-2">
                          • MAJ le {new Date(demande.updatedAt).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal de demande de changement de session */}
        {showChangeSessionModal && selectedDemande && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded max-w-md w-full p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Demander un changement de session
              </h3>
              <div className="mb-3 bg-blue-50 border border-blue-200 p-2 rounded">
                <p className="text-[10px] text-blue-800">
                  <strong>Session actuelle:</strong> {selectedDemande.session}
                </p>
                <p className="text-[9px] text-blue-600 mt-1">
                  ℹ️ Votre demande sera envoyée à l&apos;admin pour approbation
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Nouvelle session souhaitée *
                </label>
                <select
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isUpdating}
                >
                  <option value="">Sélectionner une session</option>
                  {sessions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Raison du changement (optionnel)
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Expliquez pourquoi..."
                  disabled={isUpdating}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowChangeSessionModal(false);
                    setSelectedDemande(null);
                    setNewSession('');
                    setChangeReason('');
                  }}
                  disabled={isUpdating}
                  className="px-3 py-1 text-[10px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateSession}
                  disabled={isUpdating || !newSession || newSession === selectedDemande.session}
                  className="px-3 py-1 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 