'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircleIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Diplome {
  id: string;
  qrCode: string;
  stagiaire: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  nom: string;
  prenom: string;
  formation: string;
  session: string;
  dateObtention: string;
  photoUrl?: string;
  pdfUrl?: string;
  generePar: {
    id: string;
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

export default function DiplomaViewPage() {
  const params = useParams();
  const code = params?.code as string;
  
  const [diplome, setDiplome] = useState<Diplome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      fetchDiplome();
    }
  }, [code]);

  const fetchDiplome = async () => {
    try {
      const response = await fetch(`/api/diplomes/${code}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Diplôme non trouvé. Veuillez vérifier le code QR.');
        } else {
          setError('Erreur lors de la récupération du diplôme.');
        }
        return;
      }

      const data = await response.json();
      setDiplome(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger le diplôme.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (diplome?.pdfUrl) {
      window.open(diplome.pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du diplôme...</p>
        </div>
      </div>
    );
  }

  if (error || !diplome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header avec logo IRATA */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
            <AcademicCapIcon className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Diplôme IRATA</h1>
          <p className="text-gray-600 mt-2">Centre de Formation CI.DES</p>
        </div>

        {/* Carte du diplôme */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Badge de vérification */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-center text-white">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold">Diplôme Vérifié et Authentique</span>
            </div>
          </div>

          <div className="p-8">
            {/* Photo du stagiaire */}
            {diplome.photoUrl && (
              <div className="flex justify-center mb-6">
                <img 
                  src={diplome.photoUrl} 
                  alt={`${diplome.prenom} ${diplome.nom}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-600 shadow-lg"
                />
              </div>
            )}

            {/* Informations du diplôme */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {diplome.prenom} {diplome.nom}
              </h2>
              <p className="text-lg text-indigo-600 font-semibold">
                {diplome.formation}
              </p>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Session</p>
                  <p className="text-base text-gray-900">{diplome.session}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date d'obtention</p>
                  <p className="text-base text-gray-900">
                    {new Date(diplome.dateObtention).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UserIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Généré par</p>
                  <p className="text-base text-gray-900">
                    {diplome.generePar.prenom} {diplome.generePar.nom}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Code de vérification</p>
                  <p className="text-base text-gray-900 font-mono">{diplome.qrCode}</p>
                </div>
              </div>
            </div>

            {/* Bouton de téléchargement */}
            {diplome.pdfUrl && (
              <div className="text-center">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Télécharger le diplôme (PDF)
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Ce diplôme est vérifié et authentifié par CI.DES Formations. 
              Pour toute question, veuillez contacter notre centre de formation.
            </p>
          </div>
        </div>

        {/* Information supplémentaire */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Généré le {new Date(diplome.createdAt).toLocaleDateString('fr-FR')} à{' '}
            {new Date(diplome.createdAt).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}

