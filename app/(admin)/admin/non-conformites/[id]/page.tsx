'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NonConformite {
  id: string;
  numero: string;
  titre: string;
  type: string;
  gravite: string;
  statut: string;
  createdAt: string;
  userId: string;
  lieu?: string;
  dateDetection?: string;
  description?: string;
  detecteur: {
    nom?: string;
    prenom?: string;
    email: string;
  };
  // Champs CI.DES
  issuerName?: string;
  issuerSignature?: string;
  recipientName?: string;
  recipientDepartment?: string;
  recipientDate?: string;
  recipientNumber?: string;
  anomalyOrigin?: string;
  anomalyOriginOther?: string;
  anomalyDescription?: string;
  immediateCurativeAction?: string;
  actionPlanned?: string;
  correctiveActionDescription?: string;
  preventiveActionDescription?: string;
  recipientSignature?: string;
  collaboratorInCharge?: string;
  categoryOfAnomaly?: string;
  analysisCauses?: string;
  collaboratorAppointed?: string;
  limitTime?: string;
  effectivenessAction?: string;
  closingDate?: string;
  signatureRecipient?: string;
  closingDepartment?: string;
  conclusionType?: string;
  qualityManagerObservation?: string;
  qualityManagerDate?: string;
  qualityManagerSignature?: string;
}

export default function NonConformiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const nonConformiteId = params.id as string;

  const [nonConformite, setNonConformite] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      fetchNonConformite();
  }, [nonConformiteId]);

  const fetchNonConformite = async () => {
    try {
      const response = await fetch(`/api/admin/non-conformites/${nonConformiteId}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformite(data);
      } else {
        setError('Non-conformité non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement de la non-conformité');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nonConformite) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">{error || 'Non-conformité non trouvée'}</p>
            <Link
              href="/admin/non-conformites"
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
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
              <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/non-conformites"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Non-conformité #{nonConformite.numero}</h1>
          </div>
          <div className="flex gap-2">
            {nonConformite.qualityManagerObservation && (
              <Link
                href={`/admin/non-conformites/${nonConformiteId}/documents`}
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Voir les documents
              </Link>
            )}
            <Link
              href={`/admin/non-conformites/${nonConformiteId}/actions-correctives/nouvelle`}
              className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
            >
              Nouvelle action corrective
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 print:hidden"
            >
              Imprimer / Exporter
            </button>
          </div>
        </div>

      
      <div className="max-w-6xl mx-auto bg-white shadow-md border border-gray-200 print:border-none print:shadow-none p-15">
        {/* Header */}
        <header className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="CI.DES Logo" className="w-16 h-20 object-contain" />
                  </div>
            <div className="flex-1">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="border p-1 font-bold">Titre</td>
                    <td className="border p-1 font-bold">Numéro de code</td>
                    <td className="border p-1 font-bold">Révision</td>
                    <td className="border p-1 font-bold">Création date</td>
                  </tr>
                  <tr>
                    <td className="border p-1">CI.DES NO CONFORMITY - COMPLAINT - MALFUNCTION - (DIGITAL)</td>
                    <td className="border p-1">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-1">00</td>
                    <td className="border p-1">{new Date(nonConformite.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                </tbody>
              </table>
                  </div>
                    </div>
        </header>

        {/* Buttons */}


        {/* Form body with data */}
        <main className="p-6">
          <section className="grid grid-cols-5 gap-4 mb-4">
            <label className="col-span-1 text-sm font-medium">Theme</label>
            <div className="col-span-2 border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.titre || '—'}</div>

            <label className="col-span-1 text-sm font-medium">Localisation / Site</label>
            <div className="col-span-1 border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.lieu || '—'}</div>

            <label className="col-span-1 text-sm font-medium">Date of discovery</label>
            <div className="col-span-1 border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.dateDetection ? new Date(nonConformite.dateDetection).toLocaleDateString('fr-FR') : '—'}</div>

            <label className="col-span-1 text-sm font-medium">Issuer</label>
            <div className="col-span-2 border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.issuerName || '—'}</div>

            <label className="col-span-1 text-sm font-medium">N° d'ordre</label>
            <div className="col-span-1 border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.recipientNumber || nonConformite.numero}</div>
          </section>

          {/* Description box */}
          <section className="mb-4">
            <div className="text-sm font-medium mb-2">1. Description</div>
            <div className="border border-gray-300 rounded">
              <div className="p-3 grid grid-cols-1 gap-2">
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.categoryOfAnomaly?.includes('no conformity') ? '✓' : ''}
                  </span>
                  no conformity (deviation / baseline)
                    </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.categoryOfAnomaly?.includes('claim') ? '✓' : ''}
                  </span>
                  claim (customer satisfaction incident)
                    </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.categoryOfAnomaly?.includes('malfunction') ? '✓' : ''}
                  </span>
                  malfunction (internal anomaly)
                    </div>
                <div className="w-full h-24 border border-gray-200 rounded p-2 bg-gray-50 text-sm">
                  {nonConformite.anomalyDescription || nonConformite.description || '—'}
                  </div>

                {/* Affichage des documents/photos uploadés */}
                {nonConformite.qualityManagerObservation && (
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Documents/Photos joints :</div>
                    <div className="space-y-1">
                      {nonConformite.qualityManagerObservation.split(', ').map((fileUrl, index) => {
                        const fileName = fileUrl.includes('http') 
                          ? fileUrl.split('/').pop()?.split('?')[0] || `Document ${index + 1}`
                          : fileUrl;
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                        
                        return (
                          <div key={index} className="flex items-center justify-between bg-blue-50 px-2 py-1 rounded text-xs">
                            <span className="flex items-center">
                              {isImage ? (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              {fileName}
                            </span>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {isImage ? 'Voir' : 'Télécharger'}
                            </a>
                  </div>
                        );
                      })}
                    </div>
                  </div>
              )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium mb-2">2. Consequences</div>
              <div className="border border-gray-300 rounded p-3 space-y-2">
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.analysisCauses?.includes('Observed') ? '✓' : ''}
                  </span>
                  Observed
                </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.analysisCauses?.includes('Reported') ? '✓' : ''}
                  </span>
                  Reported
                </div>
              </div>
              </div>
              
            <div className="col-span-2">
              <div className="text-sm font-medium mb-2">3. Treatment proposal</div>
              <div className="border border-gray-300 rounded p-3 grid grid-cols-2 gap-2">
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('Acceptance') ? '✓' : ''}
                          </span>
                  Acceptance as is with exemption
                </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('repair') ? '✓' : ''}
                          </span>
                  Trade-in or repair authorization
                        </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('Adaptation') ? '✓' : ''}
                  </span>
                  Adaptation, modification
                      </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('Return') ? '✓' : ''}
                  </span>
                  Return to supplier
                      </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('Downgrading') ? '✓' : ''}
                  </span>
                  Downgrading
                    </div>
                <div className="text-xs flex items-start gap-2">
                  <span className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
                    {nonConformite.correctiveActionDescription?.includes('Put Off') ? '✓' : ''}
                  </span>
                  Put Off
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="text-sm font-medium mb-2">Possible Witness</div>
              <div className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.collaboratorInCharge || '—'}</div>
                      </div>
            <div>
              <div className="text-sm font-medium mb-2">Visa</div>
              <div className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.recipientSignature || '—'}</div>
                    </div>
          </section>

          <section className="mb-4">
            <div className="text-sm font-medium mb-2">4. Curative action (repair) already performed</div>
            <div className="w-full h-24 border border-gray-200 rounded p-2 bg-gray-50 text-sm">
              {nonConformite.immediateCurativeAction || '—'}
                </div>
          </section>

          <section className="mb-4">
            <div className="text-sm font-medium mb-2">5. Proposal of corrective actions to act on the causes</div>
            <div className="w-full h-32 border border-gray-200 rounded p-2 bg-gray-50 text-sm">
              {nonConformite.correctiveActionDescription || '—'}
            </div>
          </section>


          <section className="mb-4">
            <div className="text-sm font-medium mb-2">6. Registration and Monitoring (Digital Form)</div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                <div className="text-xs">Manager QHSE / Technical Authority :</div>
                <div className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.recipientName || '—'}</div>
                </div>
                  <div>
                <div className="text-xs">Date :</div>
                <div className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.recipientDate ? new Date(nonConformite.recipientDate).toLocaleDateString('fr-FR') : '—'}</div>
                  </div>
              <div>
                <div className="text-xs">Visa :</div>
                <div className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50">{nonConformite.qualityManagerSignature || '—'}</div>
              </div>
            </div>
          </section>


          {/* Informations utilisateur */}
          <section className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Informations utilisateur</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Créé par :</span> {nonConformite.detecteur?.nom && nonConformite.detecteur?.prenom ? `${nonConformite.detecteur.prenom} ${nonConformite.detecteur.nom}` : nonConformite.detecteur?.email || 'Utilisateur inconnu'}
                </div>
              <div>
                <span className="font-medium">Date de création :</span> {new Date(nonConformite.createdAt).toLocaleString('fr-FR')}
              </div>
              <div>
                <span className="font-medium">Statut :</span> {nonConformite.statut}
          </div>
        </div>
          </section>

          {/* Footer with company info */}
          <footer className="text-xs text-gray-600 border-t border-gray-100 pt-4 pb-6 grid grid-cols-3 gap-4">
            <div>
              CI.DES sasu<br />Capital 2 500 Euros<br />SIRET: 87840789900011
            </div>
            <div className="text-center">
              ENR-CIFRA-QHSE 002 CI.DES No-Conformity Form
            </div>
            <div className="text-right">
              Page 1 sur 1
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
