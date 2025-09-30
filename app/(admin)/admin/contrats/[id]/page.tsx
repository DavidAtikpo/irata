'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import SignaturePad from 'components/SignaturePad';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

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
  statut: string;
  referenceAffaire?: string; // optional: may be fetched via raw SQL
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
  // Champs adresse personnels (optionnels)
  ville?: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
  // Champs entreprise (convention)
  entrepriseNom?: string;
  entrepriseAdresse?: string;
  entrepriseVille?: string;
  entrepriseCodePostal?: string;
  entrepriseTelephone?: string;
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
    icon: DocumentDuplicateIcon,
    label: 'Signé'
  },
  VALIDE: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Validé'
  },
  REFUSE: {
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
    label: 'Refusé'
  },
  ANNULE: {
    color: 'bg-gray-100 text-gray-800',
    icon: ExclamationCircleIcon,
    label: 'Annulé'
  }
};

export default function AdminContratDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratId, setContratId] = useState<string>('');
  const [adminSignature, setAdminSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const sigRef = useRef<SignatureCanvas | null>(null);

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
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated' && contratId) {
      fetchContrat();
    }
  }, [status, session, router, contratId]);

  const fetchContrat = async () => {
    try {
      const response = await fetch(`/api/admin/contrats/${contratId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du contrat');
      }
      const data = await response.json();
      setContrat(data);
    } catch (error) {
      setError('Erreur lors de la récupération du contrat');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newStatus === 'VALIDE' && !adminSignature) {
        setSignatureError("La signature de l'administrateur est requise avant validation.");
        return;
      }
      const response = await fetch(`/api/admin/contrats/${contratId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, adminSignature }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
      }

      await fetchContrat();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  const generateContractPDF = async () => {
    if (!contrat) return;
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const isConvention = Boolean(
      contrat.entrepriseNom ||
      contrat.entrepriseAdresse ||
      contrat.entrepriseTelephone ||
      contrat.devis?.demande?.entreprise ||
      ((contrat.devis?.demande as any)?.typeInscription || '').toLowerCase() === 'entreprise'
    );
    const numeroPrefix = isConvention ? 'CI.ICE' : 'CI.ICP';
    const displayNumero = contrat.numero || (contrat.devis?.numero ? contrat.devis.numero.replace(/^CI\.DEV/i, numeroPrefix) : '');
    const displayReference = contrat.reference || (contrat.devis?.referenceAffaire ? contrat.devis.referenceAffaire.replace(/^CI\.DEV/i, numeroPrefix) : '');

    // En-tête
    page.drawText('CI.DES AGREEMENT SERVICE CONTRACT', {
      x: 50, y: height - 50, size: 14, font: boldFont, color: rgb(0,0,0)
    });
    page.drawText('Revision: 02', { x: 400, y: height - 50, size: 10, font, color: rgb(0,0,0) });
    page.drawText('Code Number: ENR-CIDESA-RH 023', { x: 50, y: height - 70, size: 10, font, color: rgb(0,0,0) });
    page.drawText('Creation Date: 29/07/2024', { x: 400, y: height - 70, size: 10, font, color: rgb(0,0,0) });

    // Titre
    let y = height - 120;
    page.drawText('CONTRAT DE FORMATION PROFESSIONNELLE', {
      x: (width - 300) / 2, y, size: 16, font: boldFont, color: rgb(0,0,0)
    });
    y -= 20;
    if (displayNumero) {
      page.drawText(`Numéro: ${displayNumero}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    }
    if (displayReference) {
      page.drawText(`Référence: ${displayReference}`, { x: 300, y, size: 10, font, color: rgb(0,0,0) });
    }
    
    y -= 40;
    page.drawText('A. Organisme de Formation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('CI.DES sasu, SIRET: 878407899 00011', { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('Chez Chagneau, 17270 Boresse et Martron France', { x: 70, y, size: 10, font, color: rgb(0,0,0) });

    y -= 30;
    page.drawText('B. Stagiaire :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Nom : ${contrat.nom}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Prénom : ${contrat.prenom}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Adresse : ${contrat.adresse}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Email : ${contrat.user.email}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    if (contrat.profession) {
      y -= 15;
      page.drawText(`Profession : ${contrat.profession}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    }

    y -= 30;
    page.drawText('Formation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Formation Cordiste IRATA - ${contrat.devis.demande.session}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Montant : ${(contrat.devis.montant || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} € net`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Date de formation : ${contrat.devis.dateFormation ? new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}`, { x: 70, y, size: 10, font, color: rgb(0,0,0) });

    y -= 30;
    page.drawText(`Date de signature : ${new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}`, { x: 50, y, size: 10, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Statut : ${statusInfo.label}`, { x: 50, y, size: 10, font: boldFont, color: rgb(0,0,0) });

    // Signature si disponible
    if (contrat.signature && y > 100) {
      y -= 30;
      page.drawText('Signature du stagiaire :', { x: 50, y, size: 10, font: boldFont, color: rgb(0,0,0) });
      try {
        const pngBytes = await fetch(contrat.signature).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);
        page.drawImage(pngImage, { x: 200, y: y-40, width: 120, height: 40 });
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la signature:', error);
        y -= 20;
        page.drawText('Signature électronique disponible', { x: 200, y, size: 8, font, color: rgb(0.5,0.5,0.5) });
      }
    }

    // Pied de page
    page.drawText('CI.DES sasu - Capital 2 500 Euros', { x: 50, y: 60, size: 8, font, color: rgb(0,0,0) });
    page.drawText('SIRET: 87840789900011 - VAT: FR71878407899', { x: 50, y: 45, size: 8, font, color: rgb(0,0,0) });

    const pdfBytes = await pdfDoc.save();
    // Copy into a fresh Uint8Array backed by ArrayBuffer (avoids ArrayBufferLike typing issues)
    const safeBytes = new Uint8Array(pdfBytes.length);
    safeBytes.set(pdfBytes);
    const blob = new Blob([safeBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrat_${contrat.nom}_${contrat.prenom}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadDevis = async () => {
    if (!contrat) return;
    
    try {
      const response = await fetch(`/api/admin/devis/${contrat.devis.id}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du devis');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis_${contrat.devis.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du devis');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contrat) {
    return null;
  }

  const statusInfo = statusConfig[contrat.statut] || {
    color: 'bg-gray-100 text-gray-800',
    icon: ExclamationCircleIcon,
    label: contrat.statut || 'Inconnu'
  };
  const StatusIcon = statusInfo.icon;
  const isConvention = Boolean(
    contrat.entrepriseNom ||
    contrat.entrepriseAdresse ||
    contrat.entrepriseTelephone ||
    contrat.devis?.demande?.entreprise ||
    ((contrat.devis?.demande as any)?.typeInscription || '').toLowerCase() === 'entreprise'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </button>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{isConvention ? 'Convention de formation' : 'Contrat de formation'}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {(isConvention ? 'Convention' : 'Contrat')} {contrat.numero || (contrat.devis?.numero ? contrat.devis.numero.replace(/^CI\.DEV/i, isConvention ? 'CI.CON' : 'CI.CON') : `#${contrat.id.slice(-6)}`)} - {contrat.prenom} {contrat.nom}
              </p>
              {contrat.devis?.referenceAffaire && (
                <p className="text-xs text-gray-500">
                  Référence: {contrat.reference || contrat.devis.referenceAffaire.replace(/^CI\.DEV/i, isConvention ? 'CI.CON' : 'CI.CON')}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="h-5 w-5 mr-1" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className=" w-full bg-white rounded-lg shadow-lg p-15">
          {/* En-tête du contrat (alignée avec le user: logo à gauche, tableau à droite) */}
          <div className=" mb-6 bg-white shadow-sm p-3">
            <div className="flex items-start gap-4">
              <img src="/logo.png" alt="Logo CI.DES" className="w-20 h-20 flex-shrink-0" />
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                  <td className="border p-2 font-semibold text-gray-800">Titre</td>
                    <td className="border p-2 font-semibold text-gray-800">Code Number</td>
                    <td className="border p-2 font-semibold text-gray-800">Revision</td>
                    <td className="border p-2 font-semibold text-gray-800">Creation date</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold underline text-gray-900">{isConvention ? 'CI.DES AGREEMENT SERVICE CONVENTION' : 'CI.DES AGREEMENT SERVICE CONTRACT'}</td>
                    <td className="border p-2 font-bold underline text-gray-900">ENR-CIDESA-RH 023</td>
                    <td className="border p-2 font-bold text-gray-900">02</td>
                    <td className="border p-2 font-bold text-gray-900">29/07/2024</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">CONTRAT DE FORMATION PROFESSIONNELLE</h2>
              <p className="text-sm text-gray-600">En application des articles L. 6353-3 à L. 6353-7 du Code du Travail</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">A. Organisme de Formation :</h3>
              <div className="pl-4 space-y-2 text-gray-700">
                <p>La société CI.DES sasu, immatriculée sous le numéro SIREN-SIRET : 878407899 00011,</p>
                <p>représentée par Monsieur Laurent ARDOUIN, gérant de la société et du centre de formation cordiste</p>
                <p>À l'adresse « Chez Chagneau » 17 270 Boresse et Martron France</p>
                <p>Déclaration d'activité enregistrée sous le n° : En cours auprès du Préfet de la région Nouvelle-Aquitaine</p>
                <p className="italic text-gray-600">(Ci-après dénommé le centre de formation).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">B. {isConvention ? 'Si Entreprise Cocontractante :' : 'Si Particulier Cocontractant :'}</h3>
              {isConvention ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-gray-700 font-medium">Nom de l'entreprise</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.entrepriseNom || '—'}</div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-gray-700 font-medium">Adresse de l'entreprise</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.entrepriseAdresse || contrat.adresse || '—'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Code postal</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.entrepriseCodePostal || contrat.codePostal || '—'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Ville</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.entrepriseVille || contrat.ville || '—'}</div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-gray-700 font-medium">Téléphone de l'entreprise</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.entrepriseTelephone || '—'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Nom du signataire</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.nom} {contrat.prenom}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Email</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Date de signature</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">NOM</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.nom}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Prénom</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.prenom}</div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-gray-700 font-medium">Adresse</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.adresse}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Profession</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.profession || 'Non renseigné'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Téléphone</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.telephone || '—'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Email</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{contrat.user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Date de signature</label>
                    <div className="p-3 bg-gray-50 border rounded text-gray-900">{new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              )}
              <p className="italic text-gray-600">(Ci-après dénommé le stagiaire).</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 1 - Objet :</h3>
              <p className="text-gray-700">En exécution du présent contrat, l'organisme de formation s'engage à organiser l'action de formation intitulée :</p>
              <p className="font-semibold text-gray-900">« Formation Cordiste IRATA - {contrat.devis.demande.session} »</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 2 - Nature et caractéristique des actions de formation :</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
                <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste apte à exercer des interventions cordiste et apte à évoluer sur cordes en sécurité.</li>
                <li>Sa durée est fixée à : 5 jours soit 40 heures à compter du {contrat.devis.dateFormation ? new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
                <li>Programme de formation (voir Manuel Stagiaire)</li>
                <li>Sanction de la formation : CERTIFICATION IRATA si aptitude reconnu l'hors de l'examen</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 3 - Niveau de connaissances préalables nécessaire :</h3>
              <p className="text-gray-700">Afin de suivre au mieux l'action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare, le stagiaire est informé qu'il est nécessaire de posséder, avant l'entrée en formation, le niveau de connaissances suivant :</p>
              <p className="font-semibold text-gray-900">« Être majeur, en bonne condition mentale et physique ».</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 4 - Délai de rétractation</h3>
              <p className="text-gray-700">Le stagiaire est informé qu'il dispose d'un délai de rétractation de 10 jours (14 jours si le contrat est conclu à distance ou hors établissement), à compter de la date de la conclusion du présent contrat.</p>
              <p className="text-gray-700">Le cas échéant, le stagiaire informe l'organisme de formation par lettre recommandée avec accusé de réception.</p>
              <p className="text-gray-700">Aucune somme ne peut être exigée du stagiaire qui a exercé son droit de rétractation dans les délais prévus.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 5 - Dispositions financières</h3>
              <p className="text-gray-700">Le prix de l'action de formation est fixé à : <span className="font-semibold">{(contrat.devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net</span></p>
              <p className="text-gray-700">Le stagiaire s'engage à payer la prestation selon les modalités de paiement suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Après un délai de rétractation mentionné à l'article 5 du présent contrat, le stagiaire effectue un premier versement d'un montant de 350 euros.</li>
                <li>Le paiement du solde, à la charge du stagiaire, est échelonné au fur et à mesure du déroulement de l'action de formation, selon le calendrier ci-dessous :</li>
                <li>900 euros le premier jour de formation et 100 euros au deuxième jour de formation</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 6 - Interruption du stage</h3>
              <p className="text-gray-700">En cas de cessation anticipée de la formation du fait de l'organisme de formation ou l'abandon du stage par le stagiaire pour un autre motif que la force majeure dûment reconnue, le présent contrat est résilié selon les modalités financières suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Paiement des heures réellement suivies selon règle du prorata temporis</li>
                <li>Versement à titre de dédommagement pour les heures non suivies du fait du stagiaire : 900 euros</li>
              </ul>
              <p className="text-gray-700">Si le stagiaire est empêché de suivre la formation par suite de force majeure dûment reconnue, le contrat de formation professionnelle est résilié. Dans ce cas, seules les prestations effectivement dispensées sont dues au prorata temporis de leur valeur prévue au présent contrat.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 7 - Cas de différend :</h3>
              <p className="text-gray-700">Si une contestation ou un différend n'ont pu être réglés à l'amiable, le tribunal de Saintes sera compétent pour régler le litige.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Signature du stagiaire</h3>
              <div className=" p-4 bg-gray-50">
                {contrat.signature ? (
                  <img 
                    src={contrat.signature} 
                    alt="Signature du stagiaire" 
                    className="max-w-xs h-10   bg-white"
                  />
                ) : (
                  <span className="text-gray-500">Aucune signature</span>
                )}
              </div>
            </div>

          {/* Signature administrateur requise avant validation */}
          <div className="space-y-2 flex justify-end">
            <h3 className="text-base font-semibold text-gray-900">Signature de l'administrateur (obligatoire pour valider)</h3>
            <div className="p-2 bg-white w-fit ml-auto">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  width: 240,
                  height: 80,
                  className: 'border rounded bg-white',
                  style: { touchAction: 'none' }
                }}
                onEnd={() => {
                  if (sigRef.current) {
                    setAdminSignature(sigRef.current.getCanvas().toDataURL('image/png'));
                    setSignatureError(null);
                  }
                }}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (sigRef.current) {
                      sigRef.current.clear();
                    }
                    setAdminSignature(null);
                    setSignatureError(null);
                  }}
                  className="border-gray-300 px-2 py-1 text-xs"
                >
                  Effacer
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (sigRef.current) {
                      setAdminSignature(sigRef.current.getCanvas().toDataURL('image/png'));
                      setSignatureError(null);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-xs"
                >
                  Enregistrer la signature
                </Button>
              </div>
              {signatureError && (
                <p className="mt-2 text-sm text-red-600">{signatureError}</p>
              )}
            </div>
          </div>

            {/* Gestion du statut */}
            <div className="border-t pt-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion administrative</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-gray-700 font-medium">Statut actuel</label>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 font-medium">Changer le statut</label>
                  <select
                    value={contrat.statut}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black"
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="SIGNE">Signé</option>
                    <option value="VALIDE">Validé</option>
                    <option value="REFUSE">Refusé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Boutons de téléchargement */}
              <div>
                <label className="text-gray-700 font-medium mb-3 block">Documents</label>
                <div className="flex space-x-4">
                  <Button
                    onClick={generateContractPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Télécharger le contrat
                  </Button>
                  <Button
                    onClick={downloadDevis}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Télécharger le devis
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page du contrat */}
          <footer className="mt-12 pt-8 border-t">
            <div className="text-xs text-orange-600 text-center mb-1">
              <sup>1</sup> Se rapporter aux dispositions des articles L 121-16 et -17 et R 121-1 du code de la consommation.
            </div>
            <div className="flex items-center justify-between text-xs text-gray-900">
              <div className="flex-1 text-center">
                CI.DES sasu &nbsp; Capital 2 500 Euros<br />
                SIRET: <span className="font-bold">87840789900011</span> &nbsp; VAT: FR71878407899<br />
                250501 CI.DES 2504SS03 11 Florent MIRBEAU Contrat Formation Professionnelle
              </div>
              <div className="flex flex-col items-center ml-4">
                <img src="/logo.png" alt="logo cides" className="w-10 h-10 mb-1" />
                <span className="text-[11px] text-gray-700">Page 2 sur 2</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
} 