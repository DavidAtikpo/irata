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
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nonConformite) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="text-center py-6">
            <h1 className="text-sm font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-[10px] text-gray-600 mb-3">{error || 'Non-conformité non trouvée'}</p>
            <Link
              href="/admin/non-conformites"
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-50 min-h-screen font-sans text-gray-800">
              <div className="p-1.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/non-conformites"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-[10px] font-bold text-gray-900">NC #{nonConformite.numero}</h1>
          </div>
          <div className="flex flex-wrap gap-1">
            {nonConformite.qualityManagerObservation && (
              <Link
                href={`/admin/non-conformites/${nonConformiteId}/documents`}
                className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] hover:bg-blue-700"
              >
                Docs
              </Link>
            )}
            <Link
              href={`/admin/non-conformites/${nonConformiteId}/actions-correctives/nouvelle`}
              className="px-1.5 py-0.5 rounded bg-green-600 text-white text-[9px] hover:bg-green-700"
            >
              Nouvelle AC
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] hover:bg-indigo-700 print:hidden"
            >
              Imprimer
            </button>
          </div>
        </div>

      
      <div className="max-w-6xl mx-auto bg-white shadow border border-gray-200 print:border-none print:shadow-none p-2">
        {/* Header */}
        <header className="p-1.5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="CI.DES Logo" className="w-8 h-10 object-contain" />
                  </div>
            <div className="flex-1">
              <table className="w-full border-collapse text-[8px]">
                <tbody>
                  <tr>
                    <td className="border p-0.5 font-bold">Titre</td>
                    <td className="border p-0.5 font-bold">Code</td>
                    <td className="border p-0.5 font-bold">Révision</td>
                    <td className="border p-0.5 font-bold">Date</td>
                  </tr>
                  <tr>
                    <td className="border p-0.5">CI.DES NO CONFORMITY</td>
                    <td className="border p-0.5">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-0.5">00</td>
                    <td className="border p-0.5">{new Date(nonConformite.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                  </tr>
                </tbody>
              </table>
                  </div>
                    </div>
        </header>

        {/* Buttons */}


        {/* Form body with data */}
        <main className="p-2">
          <section className="grid grid-cols-3 sm:grid-cols-5 gap-1 mb-1.5">
            <label className="col-span-1 text-[9px] font-medium">Theme</label>
            <div className="col-span-2 border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.titre || '—'}</div>

            <label className="col-span-1 text-[9px] font-medium">Localisation</label>
            <div className="col-span-1 border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.lieu || '—'}</div>

            <label className="col-span-1 text-[9px] font-medium">Date découverte</label>
            <div className="col-span-1 border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.dateDetection ? new Date(nonConformite.dateDetection).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—'}</div>

            <label className="col-span-1 text-[9px] font-medium">Issuer</label>
            <div className="col-span-2 border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.issuerName || '—'}</div>

            <label className="col-span-1 text-[9px] font-medium">N°</label>
            <div className="col-span-1 border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.recipientNumber || nonConformite.numero}</div>
          </section>

          {/* Description box */}
          <section className="mb-1.5">
            <div className="text-[9px] font-medium mb-1">1. Description</div>
            <div className="border border-gray-300 rounded">
              <div className="p-1.5 grid grid-cols-1 gap-1">
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.categoryOfAnomaly?.includes('no conformity') ? '✓' : ''}
                  </span>
                  no conformity
                    </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.categoryOfAnomaly?.includes('claim') ? '✓' : ''}
                  </span>
                  claim
                    </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.categoryOfAnomaly?.includes('malfunction') ? '✓' : ''}
                  </span>
                  malfunction
                    </div>
                <div className="w-full h-12 border border-gray-200 rounded p-1 bg-gray-50 text-[9px]">
                  {nonConformite.anomalyDescription || nonConformite.description || '—'}
                  </div>

                {/* Affichage des documents/photos uploadés */}
                {nonConformite.qualityManagerObservation && (
                  <div className="mt-1">
                    <div className="text-[9px] font-medium mb-0.5">Docs/Photos :</div>
                    <div className="space-y-0.5">
                      {nonConformite.qualityManagerObservation.split(', ').map((fileUrl, index) => {
                        const fileName = fileUrl.includes('http') 
                          ? fileUrl.split('/').pop()?.split('?')[0] || `Doc ${index + 1}`
                          : fileUrl;
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                        
                        return (
                          <div key={index} className="flex items-center justify-between bg-blue-50 px-1 py-0.5 rounded text-[8px]">
                            <span className="flex items-center truncate flex-1">
                              {isImage ? (
                                <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              <span className="truncate">{fileName}</span>
                            </span>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline ml-1 flex-shrink-0"
                            >
                              {isImage ? 'Voir' : 'DL'}
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

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-1.5">
            <div>
              <div className="text-[9px] font-medium mb-1">2. Consequences</div>
              <div className="border border-gray-300 rounded p-1.5 space-y-1">
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.analysisCauses?.includes('Observed') ? '✓' : ''}
                  </span>
                  Observed
                </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.analysisCauses?.includes('Reported') ? '✓' : ''}
                  </span>
                  Reported
                </div>
              </div>
              </div>
              
            <div className="col-span-2">
              <div className="text-[9px] font-medium mb-1">3. Treatment</div>
              <div className="border border-gray-300 rounded p-1.5 grid grid-cols-2 gap-1">
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('Acceptance') ? '✓' : ''}
                          </span>
                  Acceptance as is
                </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('repair') ? '✓' : ''}
                          </span>
                  Repair auth.
                        </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('Adaptation') ? '✓' : ''}
                  </span>
                  Adaptation
                      </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('Return') ? '✓' : ''}
                  </span>
                  Return supplier
                      </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('Downgrading') ? '✓' : ''}
                  </span>
                  Downgrading
                    </div>
                <div className="text-[8px] flex items-start gap-1">
                  <span className="w-3 h-3 border border-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    {nonConformite.correctiveActionDescription?.includes('Put Off') ? '✓' : ''}
                  </span>
                  Put Off
                </div>
              </div>
            </div>
          </section>

          <section className="mb-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <div className="col-span-2">
              <div className="text-[9px] font-medium mb-1">Witness</div>
              <div className="w-full border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.collaboratorInCharge || '—'}</div>
                      </div>
            <div>
              <div className="text-[9px] font-medium mb-1">Visa</div>
              <div className="w-full border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.recipientSignature || '—'}</div>
                    </div>
          </section>

          <section className="mb-1.5">
            <div className="text-[9px] font-medium mb-1">4. Curative action</div>
            <div className="w-full h-12 border border-gray-200 rounded p-1 bg-gray-50 text-[9px]">
              {nonConformite.immediateCurativeAction || '—'}
                </div>
          </section>

          <section className="mb-1.5">
            <div className="text-[9px] font-medium mb-1">5. Corrective actions</div>
            <div className="w-full h-16 border border-gray-200 rounded p-1 bg-gray-50 text-[9px]">
              {nonConformite.correctiveActionDescription || '—'}
            </div>
          </section>


          <section className="mb-1.5">
            <div className="text-[9px] font-medium mb-1">6. Registration</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <div>
                <div className="text-[8px]">Manager QHSE :</div>
                <div className="w-full border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.recipientName || '—'}</div>
                </div>
                  <div>
                <div className="text-[8px]">Date :</div>
                <div className="w-full border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.recipientDate ? new Date(nonConformite.recipientDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—'}</div>
                  </div>
              <div>
                <div className="text-[8px]">Visa :</div>
                <div className="w-full border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-[9px]">{nonConformite.qualityManagerSignature || '—'}</div>
              </div>
            </div>
          </section>


          {/* Informations utilisateur */}
          <section className="mb-1.5 p-1.5 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-[9px] font-medium text-blue-800 mb-1">Infos utilisateur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9px]">
              <div>
                <span className="font-medium">Créé par :</span> {nonConformite.detecteur?.nom && nonConformite.detecteur?.prenom ? `${nonConformite.detecteur.prenom} ${nonConformite.detecteur.nom}` : nonConformite.detecteur?.email || 'N/A'}
                </div>
              <div>
                <span className="font-medium">Date :</span> {new Date(nonConformite.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </div>
              <div>
                <span className="font-medium">Statut :</span> {nonConformite.statut}
          </div>
        </div>
          </section>

          {/* Footer with company info */}
          <footer className="text-[8px] text-gray-600 border-t border-gray-100 pt-2 pb-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <div>
              CI.DES sasu<br />Capital 2 500 €<br />SIRET: 87840789900011
            </div>
            <div className="text-center">
              ENR-CIFRA-QHSE 002
            </div>
            <div className="text-right">
              Page 1/1
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
