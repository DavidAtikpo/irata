'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

interface Devis {
  id: string;
  numero: string;
  montant: number;
  dateFormation?: string;
  demande: {
    session: string;
    message?: string;
    entreprise?: string | null;
    typeInscription?: string | null;
  };
}

interface Contrat {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  profession?: string;
  dateSignature: string;
  signature: string;
  statut: string;
  createdAt: string;
  numero?: string | null;
  reference?: string | null;
  ville?: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
  entrepriseNom?: string;
  entrepriseAdresse?: string;
  entrepriseVille?: string;
  entrepriseCodePostal?: string;
  entrepriseTelephone?: string;
  adminSignature?: string | null;
  user: User;
  devis: Devis;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  EN_ATTENTE: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon,
    label: 'En attente'
  },
  SIGNE: {
    color: 'bg-blue-100 text-blue-800',
    icon: DocumentTextIcon,
    label: 'Signé'
  },
  VALIDE: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Validé'
  },
  REFUSE: {
    color: 'bg-red-100 text-red-800',
    icon: ExclamationTriangleIcon,
    label: 'Refusé'
  },
  ANNULE: {
    color: 'bg-gray-100 text-gray-800',
    icon: ExclamationTriangleIcon,
    label: 'Annulé'
  }
};

export default function ContratDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratId, setContratId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setContratId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && contratId) {
      fetchContrat();
    }
  }, [status, session, router, contratId]);

  const fetchContrat = async () => {
    try {
      const response = await fetch(`/api/user/contrats/${contratId}`);
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          throw new Error('Contrat non trouvé ou accès non autorisé');
        }
        throw new Error('Erreur lors de la récupération du contrat');
      }
      const data = await response.json();
      setContrat(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération du contrat');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadContrat = async () => {
    if (!contrat) return;
    
    try {
      const response = await fetch(`/api/user/contrats/${contrat.id}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du contrat');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${contrat.devis.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du contrat');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-3">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-2 text-sm font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-3">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 rounded p-3 mb-4">
            <div className="text-[10px] text-red-800">{error}</div>
          </div>
          <button
            onClick={() => router.push('/mon-contrat')}
            className="inline-flex items-center text-[10px] font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-3 w-3 mr-0.5" />
            Retour à mes contrats
          </button>
        </div>
      </div>
    );
  }

  if (!contrat) {
    return null;
  }

  const statusInfo = statusConfig[contrat.statut] || {
    color: 'bg-gray-100 text-gray-800',
    icon: ExclamationTriangleIcon,
    label: contrat.statut || 'Inconnu'
  };
  const StatusIcon = statusInfo.icon;
  const isConvention = Boolean(
    contrat.entrepriseNom ||
    contrat.entrepriseAdresse ||
    contrat.entrepriseTelephone ||
    contrat.devis?.demande?.entreprise ||
    ((contrat.devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise')
  );

  return (
    <div className="py-2 sm:py-3 px-2 sm:px-3" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-2 sm:mb-3">
          <button
            onClick={() => router.push('/mon-contrat')}
            className="inline-flex items-center text-[10px] font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-3 w-3 mr-0.5" />
            Retour à mes contrats
          </button>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">
                {isConvention ? 'Convention' : 'Contrat'} de formation
              </h1>
              <p className="text-[10px] text-gray-600">
                {isConvention ? 'Convention' : 'Contrat'} {contrat.numero || `#${contrat.id.slice(-6)}`} - Devis {contrat.devis.numero}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-medium ${statusInfo.color}`}>
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {statusInfo.label}
              </span>
              {contrat.statut === 'VALIDE' && (
                <button
                  onClick={downloadContrat}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-[9px] font-medium rounded text-white bg-green-600 hover:bg-green-700"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-0.5" />
                  Télécharger PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenu du contrat */}
        <div className="bg-white shadow-sm rounded overflow-hidden">
          <div className="p-3">
            {/* En-tête du contrat */}
            <div className="mb-4 bg-white shadow-sm p-2 rounded">
              <div className="flex items-start gap-2">
                <img src="/logo.png" alt="Logo CI.DES" className="w-16 h-16 flex-shrink-0" />
                <table className="w-full border-collapse text-[8px]">
                  <tbody>
                    <tr>
                      <td className="border p-1 font-semibold text-gray-800">Titre</td>
                      <td className="border p-1 font-semibold text-gray-800">Code Number</td>
                      <td className="border p-1 font-semibold text-gray-800">Revision</td>
                      <td className="border p-1 font-semibold text-gray-800">Creation date</td>
                    </tr>
                    <tr>
                      <td className="border p-1 font-bold underline text-gray-900 text-[7px]">
                        {isConvention ? 'CI.DES AGREEMENT SERVICE CONVENTION' : 'CI.DES AGREEMENT SERVICE CONTRACT'}
                      </td>
                      <td className="border p-1 font-bold underline text-gray-900">ENR-CIDESA-RH 023</td>
                      <td className="border p-1 font-bold text-gray-900">02</td>
                      <td className="border p-1 font-bold text-gray-900">29/07/2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-sm font-bold mb-1 text-gray-900">
                {isConvention ? 'CONVENTION' : 'CONTRAT'} DE FORMATION PROFESSIONNELLE
              </h2>
              <p className="text-[9px] text-gray-600">
                En application des articles L. 6353-3 à L. 6353-7 du Code du Travail
              </p>
            </div>

            {/* Organisme de Formation */}
            <div className="mb-4">
              <h3 className="text-[11px] font-semibold text-gray-900 mb-2">A. Organisme de Formation :</h3>
              <div className="pl-2 space-y-1 text-[10px] text-gray-700">
                <p>La société CI.DES sasu, immatriculée sous le numéro SIREN-SIRET : 878407899 00011,</p>
                <p>représentée par Monsieur Laurent ARDOUIN, gérant de la société et du centre de formation cordiste</p>
                <p>À l'adresse « Chez Chagneau » 17 270 Boresse et Martron France</p>
                <p>Déclaration d'activité enregistrée sous le n° : En cours auprès du Préfet de la région Nouvelle-Aquitaine</p>
                <p className="italic text-gray-600">(Ci-après dénommé le centre de formation).</p>
              </div>
            </div>

            {/* Cocontractant */}
            <div className="mb-4">
              <h3 className="text-[11px] font-semibold text-gray-900 mb-2">
                B. {isConvention ? 'Si Entreprise Cocontractante :' : 'Si Particulier Cocontractant :'}
              </h3>
              {isConvention ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-gray-700 font-medium">Nom de l'entreprise</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.entrepriseNom || '—'}</div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-gray-700 font-medium">Adresse de l'entreprise</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.entrepriseAdresse || contrat.adresse || '—'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Code postal</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.entrepriseCodePostal || contrat.codePostal || '—'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Ville</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.entrepriseVille || contrat.ville || '—'}</div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-gray-700 font-medium">Téléphone de l'entreprise</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.entrepriseTelephone || '—'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Nom du signataire</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.nom} {contrat.prenom}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Email</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.user.email}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Date de signature</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">
                      {new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">NOM</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.nom}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Prénom</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.prenom}</div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-gray-700 font-medium">Adresse</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.adresse}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Profession</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.profession || 'Non renseigné'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Téléphone</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.telephone || '—'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Email</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">{contrat.user.email}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-700 font-medium">Date de signature</label>
                    <div className="p-2 bg-gray-50 border rounded text-[10px] text-gray-900">
                      {new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}
              <p className="italic text-[9px] text-gray-600 mt-2">(Ci-après dénommé le stagiaire).</p>
            </div>

            {/* Articles */}
            <div className="space-y-3">
              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 1 - Objet :</h3>
                <p className="text-[10px] text-gray-700">En exécution du présent {isConvention ? 'convention' : 'contrat'}, l'organisme de formation s'engage à organiser l'action de formation intitulée :</p>
                <p className="text-[10px] font-semibold text-gray-900">« Formation Cordiste IRATA - {contrat.devis.demande.session} »</p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 2 - Nature et caractéristique des actions de formation :</h3>
                <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-700">
                  <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
                  <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste apte à exercer des interventions cordiste et apte à évoluer sur cordes en sécurité.</li>
                  <li>Sa durée est fixée à : 5 jours soit 40 heures {contrat.devis.dateFormation ? `à compter du ${new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR')}` : ''}</li>
                  <li>Programme de formation (voir Manuel Stagiaire)</li>
                  <li>Sanction de la formation : CERTIFICATION IRATA si aptitude reconnu l'hors de l'examen</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 3 - Niveau de connaissances préalables nécessaire :</h3>
                <p className="text-[10px] text-gray-700">Afin de suivre au mieux l'action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare, le stagiaire est informé qu'il est nécessaire de posséder, avant l'entrée en formation, le niveau de connaissances suivant :</p>
                <p className="text-[10px] font-semibold text-gray-900">« Être majeur, en bonne condition mentale et physique ».</p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 4 - Délai de rétractation</h3>
                <p className="text-[10px] text-gray-700">Le stagiaire est informé qu'il dispose d'un délai de rétractation de 10 jours (14 jours si le {isConvention ? 'convention' : 'contrat'} est conclu à distance ou hors établissement), à compter de la date de la conclusion du présent {isConvention ? 'convention' : 'contrat'}.</p>
                <p className="text-[10px] text-gray-700">Le cas échéant, le stagiaire informe l'organisme de formation par lettre recommandée avec accusé de réception.</p>
                <p className="text-[10px] text-gray-700">Aucune somme ne peut être exigée du stagiaire qui a exercé son droit de rétractation dans les délais prévus.</p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 5 - Dispositions financières</h3>
                <p className="text-[10px] text-gray-700">Le prix de l'action de formation est fixé à : <span className="font-semibold">{(contrat.devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net</span></p>
                <p className="text-[10px] text-gray-700">Le stagiaire s'engage à payer la prestation selon les modalités de paiement suivantes :</p>
                <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-700">
                  <li>Après un délai de rétractation mentionné à l'article 5 du présent {isConvention ? 'convention' : 'contrat'}, le stagiaire effectue un premier versement d'un montant de 350 euros.</li>
                  <li>Le paiement du solde, à la charge du stagiaire, est échelonné au fur et à mesure du déroulement de l'action de formation, selon le calendrier ci-dessous :</li>
                  <li>900 euros le premier jour de formation et 100 euros au deuxième jour de formation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 6 - Interruption du stage</h3>
                <p className="text-[10px] text-gray-700">En cas de cessation anticipée de la formation du fait de l'organisme de formation ou l'abandon du stage par le stagiaire pour un autre motif que la force majeure dûment reconnue, le présent {isConvention ? 'convention' : 'contrat'} est résilié selon les modalités financières suivantes :</p>
                <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-700">
                  <li>Paiement des heures réellement suivies selon règle du prorata temporis</li>
                  <li>Versement à titre de dédommagement pour les heures non suivies du fait du stagiaire : 900 euros</li>
                </ul>
                <p className="text-[10px] text-gray-700">Si le stagiaire est empêché de suivre la formation par suite de force majeure dûment reconnue, le {isConvention ? 'convention' : 'contrat'} de formation professionnelle est résilié. Dans ce cas, seules les prestations effectivement dispensées sont dues au prorata temporis de leur valeur prévue au présent {isConvention ? 'convention' : 'contrat'}.</p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-1">Article 7 - Cas de différend :</h3>
                <p className="text-[10px] text-gray-700">Si une contestation ou un différend n'ont pu être réglés à l'amiable, le tribunal de Saintes sera compétent pour régler le litige.</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-4 space-y-3 border-t pt-3">
              <div>
                <h3 className="text-[11px] font-semibold text-gray-900 mb-2">Signature du stagiaire</h3>
                <div className="p-2 bg-gray-50 border rounded">
                  {contrat.signature ? (
                    <img 
                      src={contrat.signature} 
                      alt="Signature du stagiaire" 
                      className="max-w-[200px] h-8 bg-white"
                    />
                  ) : (
                    <span className="text-[9px] text-gray-500">Aucune signature</span>
                  )}
                </div>
                <p className="text-[9px] text-gray-600 mt-1">{contrat.prenom} {contrat.nom}</p>
              </div>

              {contrat.adminSignature && (
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-900 mb-2">Signature de l'administrateur</h3>
                  <div className="p-2 bg-gray-50 border rounded flex justify-end">
                    <img
                      src={contrat.adminSignature}
                      alt="Signature administrateur"
                      className="max-w-[200px] h-8 bg-white"
                    />
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1 text-right">CI.DES</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

