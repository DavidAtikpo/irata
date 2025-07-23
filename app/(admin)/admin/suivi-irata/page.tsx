'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Le layout est maintenant géré automatiquement par le layout.tsx parent
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CertificationIRATA {
  id: string;
  stagiaire: {
    nom: string;
    prenom: string;
    email: string;
  };
  session: string;
  niveau: 'NIVEAU_1' | 'NIVEAU_2' | 'NIVEAU_3';
  statut: 'EN_COURS' | 'REUSSI' | 'ECHEC' | 'REPORTE';
  dateExamen: string;
  dateExpiration?: string;
  numeroCertificat?: string;
  noteTheorique?: number;
  notePratique?: number;
  commentaires?: string;
  examinateur?: string;
}

export default function SuiviIRATAPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certifications, setCertifications] = useState<CertificationIRATA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertification, setSelectedCertification] = useState<CertificationIRATA | null>(null);
  const [filterNiveau, setFilterNiveau] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      // Simuler des données pour l'instant
      setCertifications([
        {
          id: '1',
          stagiaire: {
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@email.com'
          },
          session: '2025 février 03 au 08',
          niveau: 'NIVEAU_1',
          statut: 'EN_COURS',
          dateExamen: '2025-02-08',
          noteTheorique: 85,
          notePratique: 78,
          examinateur: 'Dr. Martin'
        },
        {
          id: '2',
          stagiaire: {
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@email.com'
          },
          session: '2025 février 03 au 08',
          niveau: 'NIVEAU_1',
          statut: 'REUSSI',
          dateExamen: '2025-02-08',
          dateExpiration: '2028-02-08',
          numeroCertificat: 'IRATA-2025-001',
          noteTheorique: 92,
          notePratique: 88,
          examinateur: 'Dr. Martin',
          commentaires: 'Excellente performance'
        },
        {
          id: '3',
          stagiaire: {
            nom: 'Bernard',
            prenom: 'Pierre',
            email: 'pierre.bernard@email.com'
          },
          session: '2025 janvier',
          niveau: 'NIVEAU_2',
          statut: 'ECHEC',
          dateExamen: '2025-01-20',
          noteTheorique: 65,
          notePratique: 58,
          examinateur: 'Dr. Leblanc',
          commentaires: 'Doit améliorer les techniques de sauvetage'
        }
      ]);
      setLoading(false);
    }
  }, [status, session, router]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'REUSSI': return 'bg-green-100 text-green-800';
      case 'ECHEC': return 'bg-red-100 text-red-800';
      case 'REPORTE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return ClockIcon;
      case 'REUSSI': return CheckCircleIcon;
      case 'ECHEC': return XCircleIcon;
      case 'REPORTE': return ExclamationTriangleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'NIVEAU_1': return 'bg-green-100 text-green-800';
      case 'NIVEAU_2': return 'bg-blue-100 text-blue-800';
      case 'NIVEAU_3': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCertifications = certifications.filter(cert => {
    const niveauMatch = filterNiveau === 'all' || cert.niveau === filterNiveau;
    const statutMatch = filterStatut === 'all' || cert.statut === filterStatut;
    return niveauMatch && statutMatch;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suivi des certifications IRATA</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les examens et certifications IRATA de vos stagiaires
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total examens</dt>
                  <dd className="text-lg font-medium text-gray-900">{certifications.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Réussis</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {certifications.filter(c => c.statut === 'REUSSI').length}
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
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">En cours</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {certifications.filter(c => c.statut === 'EN_COURS').length}
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
                <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taux de réussite</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round((certifications.filter(c => c.statut === 'REUSSI').length / certifications.length) * 100)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <select
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tous les niveaux</option>
              <option value="NIVEAU_1">Niveau 1</option>
              <option value="NIVEAU_2">Niveau 2</option>
              <option value="NIVEAU_3">Niveau 3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="EN_COURS">En cours</option>
              <option value="REUSSI">Réussi</option>
              <option value="ECHEC">Échec</option>
              <option value="REPORTE">Reporté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des certifications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Certifications IRATA ({filteredCertifications.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Cliquez sur une certification pour voir les détails et modifier les résultats
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {filteredCertifications.map((certification) => {
            const StatusIcon = getStatutIcon(certification.statut);
            
            return (
              <li 
                key={certification.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedCertification(certification)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {certification.stagiaire.prenom.charAt(0)}{certification.stagiaire.nom.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {certification.stagiaire.prenom} {certification.stagiaire.nom}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${getNiveauColor(certification.niveau)}`}>
                            {certification.niveau.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(certification.statut)}`}>
                            {certification.statut.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{certification.stagiaire.email}</p>
                        <p className="text-sm text-gray-500">
                          Session: {certification.session} | Examen: {new Date(certification.dateExamen).toLocaleDateString('fr-FR')}
                        </p>
                        {certification.numeroCertificat && (
                          <p className="text-sm text-gray-500">Certificat: {certification.numeroCertificat}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Notes */}
                      {(certification.noteTheorique || certification.notePratique) && (
                        <div className="text-right">
                          <div className="text-sm text-gray-900">
                            {certification.noteTheorique && `Théorie: ${certification.noteTheorique}/100`}
                          </div>
                          <div className="text-sm text-gray-900">
                            {certification.notePratique && `Pratique: ${certification.notePratique}/100`}
                          </div>
                        </div>
                      )}
                      
                      <StatusIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal de détail de la certification */}
      {selectedCertification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Certification IRATA - {selectedCertification.stagiaire.prenom} {selectedCertification.stagiaire.nom}
                </h3>
                <button
                  onClick={() => setSelectedCertification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Niveau IRATA</label>
                    <select 
                      value={selectedCertification.niveau}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="NIVEAU_1">Niveau 1</option>
                      <option value="NIVEAU_2">Niveau 2</option>
                      <option value="NIVEAU_3">Niveau 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select 
                      value={selectedCertification.statut}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="EN_COURS">En cours</option>
                      <option value="REUSSI">Réussi</option>
                      <option value="ECHEC">Échec</option>
                      <option value="REPORTE">Reporté</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'examen</label>
                    <input
                      type="date"
                      value={selectedCertification.dateExamen}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Examinateur</label>
                    <input
                      type="text"
                      value={selectedCertification.examinateur || ''}
                      placeholder="Nom de l'examinateur"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Note théorique (/100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedCertification.noteTheorique || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Note pratique (/100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedCertification.notePratique || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                {selectedCertification.statut === 'REUSSI' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Numéro de certificat</label>
                      <input
                        type="text"
                        value={selectedCertification.numeroCertificat || ''}
                        placeholder="IRATA-2025-XXX"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date d'expiration</label>
                      <input
                        type="date"
                        value={selectedCertification.dateExpiration || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commentaires</label>
                  <textarea
                    rows={4}
                    value={selectedCertification.commentaires || ''}
                    placeholder="Commentaires sur l'examen, points forts, axes d'amélioration..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedCertification(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      // Ici on sauvegarderait les modifications
                      setSelectedCertification(null);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 