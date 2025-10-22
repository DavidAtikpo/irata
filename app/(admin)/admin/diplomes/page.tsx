'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  AcademicCapIcon, 
  PlusIcon, 
  QrCodeIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Diplome {
  id: string;
  qrCode: string;
  nom: string;
  prenom: string;
  formation: string;
  session: string;
  dateObtention: string;
  photoUrl?: string;
  pdfUrl?: string;
  url: string;
  stagiaire: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  createdAt: string;
}

interface Stagiaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export default function DiplomesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiplome, setSelectedDiplome] = useState<Diplome | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    stagiaireId: '',
    nom: '',
    prenom: '',
    formation: 'IRATA Niveau 1',
    session: '',
    dateObtention: new Date().toISOString().split('T')[0],
    photoUrl: '',
    pdfUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchDiplomes();
        fetchStagiaires();
      }
    }
  }, [status, session, router]);

  const fetchDiplomes = async () => {
    try {
      const response = await fetch('/api/admin/diplomes');
      if (response.ok) {
        const data = await response.json();
        setDiplomes(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des diplômes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStagiaires = async () => {
    try {
      // Récupérer les utilisateurs avec le rôle USER (stagiaires)
      const response = await fetch('/api/admin/users?role=USER');
      if (response.ok) {
        const data = await response.json();
        setStagiaires(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stagiaires:', error);
      setStagiaires([]);
    }
  };

  const handleStagiaireChange = (stagiaireId: string) => {
    const stagiaire = stagiaires.find(s => s.id === stagiaireId);
    if (stagiaire) {
      setFormData(prev => ({
        ...prev,
        stagiaireId,
        nom: stagiaire.nom || '',
        prenom: stagiaire.prenom || '',
      }));
    }
  };

  const handleGenerateDiplome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/diplomes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Diplôme généré avec succès ! Code QR: ${data.diplome.qrCode}`);
        setShowModal(false);
        fetchDiplomes();
        // Reset form
        setFormData({
          stagiaireId: '',
          nom: '',
          prenom: '',
          formation: 'IRATA Niveau 1',
          session: '',
          dateObtention: new Date().toISOString().split('T')[0],
          photoUrl: '',
          pdfUrl: '',
        });
      } else {
        setError(data.error || 'Erreur lors de la génération du diplôme');
      }
    } catch (error) {
      setError('Erreur lors de la génération du diplôme');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (diplomeId: string) => {
    setIsSendingEmail(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/diplomes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diplomeId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email envoyé avec succès au stagiaire !');
      } else {
        setError(data.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      setError('Erreur lors de l\'envoi de l\'email');
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const showQRCode = (diplome: Diplome) => {
    setSelectedDiplome(diplome);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Diplômes</h1>
                <p className="text-sm text-gray-500">Générer et envoyer les diplômes IRATA</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau Diplôme
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Liste des diplômes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Diplômes générés ({diplomes.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stagiaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code QR
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diplomes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun diplôme généré pour le moment
                    </td>
                  </tr>
                ) : (
                  diplomes.map((diplome) => (
                    <tr key={diplome.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {diplome.prenom} {diplome.nom}
                        </div>
                        <div className="text-sm text-gray-500">{diplome.stagiaire.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {diplome.formation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {diplome.session}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 font-mono">
                          {diplome.qrCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => showQRCode(diplome)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Voir le QR code"
                        >
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(diplome.id)}
                          disabled={isSendingEmail}
                          className="text-green-600 hover:text-green-900 mr-4"
                          title="Envoyer par email"
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                        <a
                          href={diplome.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir le diplôme"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de création */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
              
              <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Générer un nouveau diplôme</h3>
                
                <form onSubmit={handleGenerateDiplome}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stagiaire</label>
                      <select
                        value={formData.stagiaireId}
                        onChange={(e) => handleStagiaireChange(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Sélectionner un stagiaire</option>
                        {stagiaires.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.prenom} {s.nom} ({s.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prénom</label>
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Formation</label>
                      <select
                        value={formData.formation}
                        onChange={(e) => setFormData({...formData, formation: e.target.value})}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="IRATA Niveau 1">IRATA Niveau 1</option>
                        <option value="IRATA Niveau 2">IRATA Niveau 2</option>
                        <option value="IRATA Niveau 3">IRATA Niveau 3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Session</label>
                      <input
                        type="text"
                        value={formData.session}
                        onChange={(e) => setFormData({...formData, session: e.target.value})}
                        placeholder="Ex: 10. 2025 / octobre: du 06 au 10 (Examen 11)"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date d'obtention</label>
                      <input
                        type="date"
                        value={formData.dateObtention}
                        onChange={(e) => setFormData({...formData, dateObtention: e.target.value})}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL Photo (optionnel)</label>
                      <input
                        type="url"
                        value={formData.photoUrl}
                        onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                        placeholder="https://..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isGenerating ? 'Génération...' : 'Générer le diplôme'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal QR Code */}
        {selectedDiplome && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedDiplome(null)}></div>
              
              <div className="relative bg-white rounded-lg max-w-md w-full p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code du Diplôme</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedDiplome.prenom} {selectedDiplome.nom}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">{selectedDiplome.formation}</p>
                  
                  {/* QR Code via service externe */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedDiplome.url)}`}
                    alt="QR Code"
                    className="mx-auto border border-gray-300 rounded"
                  />
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500 mb-1">URL du diplôme :</p>
                    <p className="text-sm font-mono text-gray-700 break-all">{selectedDiplome.url}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDiplome(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

