'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface IntegratedContractPDFProps {
  devis: any;
  onSubmit: (data: any) => Promise<void>;
}

export function IntegratedContractPDF({ devis, onSubmit }: IntegratedContractPDFProps) {
  const { data: session } = useSession();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState<any>({
    // Informations entreprise (pour convention)
    entrepriseNom: '',
    entrepriseAdresse: '',
    entrepriseCodePostal: '',
    entrepriseVille: '',
    entrepriseTelephone: '',
    // Informations stagiaire
    nom: '',
    prenom: '',
    adresse: '',
    profession: '',
    statut: '',
    pays: '',
    codePostal: '',
    ville: '',
    telephone: '',
    dateSignature: new Date().toISOString().split('T')[0],
    signature: '',
  });

  const isConvention = Boolean(
    devis?.demande?.entreprise ||
    devis?.entreprise ||
    ((devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise')
  );

  useEffect(() => {
    const entrepriseNom = devis?.demande?.entreprise || devis?.entreprise || '';
    const nom = devis?.demande?.user?.nom || session?.user?.nom || '';
    const prenom = devis?.demande?.user?.prenom || session?.user?.prenom || '';
    
    setFormData((prev: any) => ({
      ...prev,
      entrepriseNom,
      nom,
      prenom,
    }));
  }, [devis, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setFormData((prev: any) => ({ ...prev, signature: '' }));
    }
  };

  const handleSaveSignature = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
      setFormData((prev: any) => ({ ...prev, signature: dataUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Capture signature if drawn but not yet saved
      if ((!formData.signature || formData.signature.length < 50) && sigRef.current && !sigRef.current.isEmpty()) {
        const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
        setFormData((prev: any) => ({ ...prev, signature: dataUrl }));
      }

      // Validation
      const cleaned = {
        ...formData,
        entrepriseCodePostal: (formData.entrepriseCodePostal || '').toString().trim(),
        entrepriseVille: (formData.entrepriseVille || '').toString().trim(),
      };
      
      if (isConvention && !cleaned.entrepriseCodePostal) {
        throw new Error('Code postal de l\'entreprise requis');
      }
      if (!cleaned.signature || cleaned.signature.length < 50) {
        throw new Error('Signature requise');
      }

      await onSubmit({
        ...cleaned,
        isEntreprise: isConvention,
      });
      
      setSubmittedData({ ...cleaned, signature: cleaned.signature });
      setShowSuccessMessage(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!submittedData) return;
    
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // En-tête
      const titreHeader = isConvention ? 'CONVENTION DE FORMATION PROFESSIONNELLE' : 'CONTRAT DE FORMATION PROFESSIONNELLE';
      page.drawText('CI.DES AGREEMENT SERVICE', { x: 50, y: height - 50, size: 12, font: boldFont, color: rgb(0,0,0) });
      page.drawText(titreHeader, { x: 50, y: height - 70, size: 12, font: boldFont, color: rgb(0,0,0) });
      page.drawText('Révision: 02', { x: 400, y: height - 50, size: 10, font, color: rgb(0,0,0) });
      page.drawText('Code: ENR-CIDESA-RH 023', { x: 50, y: height - 90, size: 10, font, color: rgb(0,0,0) });
      page.drawText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { x: 400, y: height - 70, size: 10, font, color: rgb(0,0,0) });

      // Contenu du contrat/convention
      let y = height - 120;
      
      // Organisme de formation
      page.drawText('A. Organisme de Formation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('La société CI.DES sasu, immatriculée sous le numéro SIREN-SIRET : 878407899 00011,', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('représentée par Monsieur Laurent ARDOUIN, gérant de la société et du centre de formation cordiste', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('À l\'adresse « Chez Chagneau » 17 270 Boresse et Martron France', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('Déclaration d\'activité enregistrée sous le n° : En cours auprès du Préfet de la région Nouvelle-Aquitaine', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      // Informations entreprise ou particulier
      if (isConvention) {
        page.drawText('B. Si Entreprise Cocontractante :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
        y -= 20;
        page.drawText(`Entreprise : ${submittedData.entrepriseNom}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        page.drawText(`Adresse : ${submittedData.entrepriseAdresse}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        if (submittedData.entrepriseVille) {
          page.drawText(`Ville : ${submittedData.entrepriseVille}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        if (submittedData.entrepriseCodePostal) {
          page.drawText(`Code postal : ${submittedData.entrepriseCodePostal}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        if (submittedData.entrepriseTelephone) {
          page.drawText(`Téléphone : ${submittedData.entrepriseTelephone}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        page.drawText(`Signataire : ${submittedData.nom} ${submittedData.prenom}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 30;
      } else {
        page.drawText('B. Si Particulier Cocontractant :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
        y -= 20;
        page.drawText(`Nom : ${submittedData.nom}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        page.drawText(`Prénom : ${submittedData.prenom}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        page.drawText(`Adresse : ${submittedData.adresse}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        if (submittedData.ville) {
          page.drawText(`Ville : ${submittedData.ville}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        if (submittedData.codePostal) {
          page.drawText(`Code postal : ${submittedData.codePostal}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        if (submittedData.pays) {
          page.drawText(`Pays : ${submittedData.pays}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        if (submittedData.telephone) {
          page.drawText(`Téléphone : ${submittedData.telephone}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
          y -= 15;
        }
        page.drawText(`Profession : ${submittedData.profession}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 15;
        page.drawText(`Statut : ${submittedData.statut}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
        y -= 30;
      }

      // Articles du contrat/convention
      page.drawText('Article 1 - Objet :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('En exécution de la présente convention, l\'organisme de formation s\'engage à organiser l\'action de formation intitulée :', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('« Formation Cordiste IRATA - Industrial Rope Access Trade Association »', { x: 50, y, size: 10, font: boldFont, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 2 - Nature et caractéristiques des actions de formation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('• L\'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications »', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Elle a pour objectif de qualifier et certifier le stagiaire comme Technicien cordiste apte à exercer des interventions cordistes', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText(`• Sa durée est fixée à : 5 jours soit 40 heures à compter du ${devis?.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Programme de formation (voir Manuel Stagiaire)', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Sanction de la formation : CERTIFICATION IRATA si aptitude reconnue lors de l\'examen', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 3 - Niveau de connaissances préalables nécessaire :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('Afin de suivre au mieux l\'action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare,', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('il est nécessaire de posséder, avant l\'entrée en formation, le niveau de connaissances suivant :', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('« Être majeur, en bonne condition mentale et physique ».', { x: 50, y, size: 10, font: boldFont, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 4 - Délai de rétractation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('Le bénéficiaire est informé qu\'il dispose d\'un délai de rétractation de 10 jours (14 jours si la convention est conclue à distance),', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('à compter de la date de la conclusion de la présente convention.', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 5 - Dispositions financières :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText(`Le prix de l'action de formation est fixé à : ${(devis?.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('Le règlement s\'effectue selon les modalités suivantes :', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Après un délai de rétractation mentionné à l\'article 4, un premier versement d\'un montant de 350 euros.', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Le paiement du solde est échelonné au fur et à mesure du déroulement de l\'action de formation', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• 900 euros le premier jour de formation et 100 euros au deuxième jour de formation', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 6 - Interruption :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('En cas de cessation anticipée de la formation du fait de l\'organisme de formation ou d\'interruption par le bénéficiaire', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('pour un autre motif que la force majeure dûment reconnue, la présente convention est résiliée selon les modalités financières suivantes :', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Paiement des heures réellement suivies selon la règle du prorata temporis', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 15;
      page.drawText('• Versement à titre de dédommagement pour les heures non suivies du fait du bénéficiaire : 900 euros', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      page.drawText('Article 7 - Cas de différend :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('Si une contestation ou un différend n\'ont pu être réglés à l\'amiable, le tribunal de Saintes sera compétent pour régler le litige.', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 40;

      // Signature
      page.drawText('Signature du signataire :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      if (submittedData.signature) {
        try {
          const pngBytes = await fetch(submittedData.signature).then(res => res.arrayBuffer());
          const pngImage = await pdfDoc.embedPng(pngBytes);
          page.drawImage(pngImage, { x: 200, y: y-10, width: 120, height: 40 });
        } catch (error) {
          page.drawText('Signature non disponible', { x: 200, y, size: 10, font, color: rgb(0,0,0) });
        }
      }
      y -= 60;

      page.drawText('Pour l\'organisme de formation :', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('ARDOUIN Laurent, Président', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
      y -= 30;

      page.drawText(`Date de signature : ${submittedData.dateSignature}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });

      // Pied de page
      page.drawText('CI.DES sasu   Capital 2 500 Euros', { x: 50, y: 60, size: 9, font, color: rgb(0,0,0) });
      page.drawText('SIRET: 87840789900011   VAT: FR71878407899', { x: 50, y: 45, size: 9, font, color: rgb(0,0,0) });
      page.drawText('250501 CI.DES 2504SS03 11 Florent MIRBEAU Contrat Formation Professionnelle', { x: 50, y: 30, size: 8, font, color: rgb(0,0,0) });
      page.drawText('Page 1 sur 1', { x: width - 90, y: 30, size: 9, font, color: rgb(0,0,0) });

      const pdfBytes = await pdfDoc.save();
      const safeBytes = new Uint8Array(pdfBytes.length);
      safeBytes.set(pdfBytes);
      const blob = new Blob([safeBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${isConvention ? 'convention' : 'contrat'}_${submittedData.nom || 'stagiaire'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setError('Erreur lors de la génération du PDF');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête du contrat */}
      <div className="mb-6 bg-white shadow-sm p-3">
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
                <td className="border p-2 font-bold underline text-gray-900">
                  {isConvention ? 'CI.DES AGREEMENT SERVICE CONVENTION' : 'CI.DES AGREEMENT SERVICE CONTRACT'}
                </td>
                <td className="border p-2 font-bold underline text-gray-900">ENR-CIDESA-RH 023</td>
                <td className="border p-2 font-bold text-gray-900">02</td>
                <td className="border p-2 font-bold text-gray-900">29/07/2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Titre et textes du contrat/convention */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            {isConvention ? 'CONVENTION DE FORMATION PROFESSIONNELLE' : 'CONTRAT DE FORMATION PROFESSIONNELLE'}
          </h2>
          <p className="text-sm text-gray-600">En application des articles L. 6353-1 et suivants du Code du Travail</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">A. Organisme de Formation :</h3>
          <div className="pl-4 space-y-2 text-gray-700">
            <p>La société CI.DES sasu, immatriculée sous le numéro SIREN-SIRET : 878407899 00011,</p>
            <p>représentée par Monsieur Laurent ARDOUIN, gérant de la société et du centre de formation cordiste</p>
            <p>À l'adresse « Chez Chagneau » 17 270 Boresse et Martron France</p>
            <p>Déclaration d'activité enregistrée sous le n° : En cours auprès du Préfet de la région Nouvelle-Aquitaine</p>
            <p className="italic text-gray-600">(Ci-après dénommé l'organisme de formation).</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 1 - Objet :</h3>
          <p className="text-gray-700">En exécution de la présente convention, l'organisme de formation s'engage à organiser l'action de formation intitulée :</p>
          <p className="font-semibold text-gray-900">« Formation Cordiste IRATA - {devis?.demande?.session || 'Session à préciser'} »</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 2 - Nature et caractéristiques des actions de formation :</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
            <li>Elle a pour objectif de qualifier et certifier le stagiaire comme Technicien cordiste apte à exercer des interventions cordistes et apte à évoluer sur cordes en sécurité.</li>
            <li>Sa durée est fixée à : 5 jours soit 40 heures à compter du {devis?.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
            <li>Programme de formation (voir Manuel Stagiaire)</li>
            <li>Sanction de la formation : CERTIFICATION IRATA si aptitude reconnue lors de l'examen</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 3 - Niveau de connaissances préalables nécessaire :</h3>
          <p className="text-gray-700">Afin de suivre au mieux l'action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare, il est nécessaire de posséder, avant l'entrée en formation, le niveau de connaissances suivant :</p>
          <p className="font-semibold text-gray-900">« Être majeur, en bonne condition mentale et physique ».</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 4 - Délai de rétractation :</h3>
          <p className="text-gray-700">Le bénéficiaire est informé qu'il dispose d'un délai de rétractation de 10 jours (14 jours si la convention est conclue à distance ou hors établissement), à compter de la date de la conclusion de la présente convention.</p>
          <p className="text-gray-700">Le cas échéant, le bénéficiaire informe l'organisme de formation par lettre recommandée avec accusé de réception.</p>
          <p className="text-gray-700">Aucune somme ne peut être exigée du bénéficiaire qui a exercé son droit de rétractation dans les délais prévus.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 5 - Dispositions financières :</h3>
          <p className="text-gray-700">Le prix de l'action de formation est fixé à : <span className="font-semibold">{(devis?.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net</span></p>
          <p className="text-gray-700">Le règlement s'effectue selon les modalités suivantes :</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Après un délai de rétractation mentionné à l'article 4, un premier versement d'un montant de 350 euros.</li>
            <li>Le paiement du solde est échelonné au fur et à mesure du déroulement de l'action de formation, selon le calendrier suivant :</li>
            <li>900 euros le premier jour de formation et 100 euros au deuxième jour de formation</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 6 - Interruption :</h3>
          <p className="text-gray-700">En cas de cessation anticipée de la formation du fait de l'organisme de formation ou d'interruption par le bénéficiaire pour un autre motif que la force majeure dûment reconnue, la présente convention est résiliée selon les modalités financières suivantes :</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Paiement des heures réellement suivies selon la règle du prorata temporis</li>
            <li>Versement à titre de dédommagement pour les heures non suivies du fait du bénéficiaire : 900 euros</li>
          </ul>
          <p className="text-gray-700">En cas de force majeure dûment reconnue, seules les prestations effectivement dispensées sont dues au prorata temporis de leur valeur prévue à la présente convention.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Article 7 - Cas de différend :</h3>
          <p className="text-gray-700">Si une contestation ou un différend n'ont pu être réglés à l'amiable, le tribunal de Saintes sera compétent pour régler le litige.</p>
        </div>
      </div>

      {/* Informations entreprise ou particulier */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          B. {isConvention ? 'Si Entreprise Cocontractante :' : 'Si Particulier Cocontractant :'}
        </h3>
        
        {isConvention && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nom de l'entreprise</Label>
              <Input name="entrepriseNom" value={formData.entrepriseNom} onChange={handleChange} className="text-black" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Adresse de l'entreprise</Label>
              <Input name="entrepriseAdresse" value={formData.entrepriseAdresse} onChange={handleChange} className="text-black" />
            </div>
            <div className="space-y-2">
              <Label>Code postal</Label>
              <Input name="entrepriseCodePostal" value={formData.entrepriseCodePostal} onChange={handleChange} className="text-black" required />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input name="entrepriseVille" value={formData.entrepriseVille} onChange={handleChange} className="text-black" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Numéro de téléphone de l'entreprise</Label>
              <Input name="entrepriseTelephone" value={formData.entrepriseTelephone} onChange={handleChange} className="text-black" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>NOM</Label>
            <Input name="nom" value={formData.nom} onChange={handleChange} className="text-black" />
          </div>
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input name="prenom" value={formData.prenom} onChange={handleChange} className="text-black" />
          </div>
          {!isConvention && (
            <>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input name="adresse" value={formData.adresse} onChange={handleChange} className="text-black" />
              </div>
              <div className="space-y-2">
                <Label>Pays</Label>
                <Input name="pays" value={formData.pays} onChange={handleChange} className="text-black" />
              </div>
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input name="codePostal" value={formData.codePostal} onChange={handleChange} className="text-black" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input name="ville" value={formData.ville} onChange={handleChange} className="text-black" />
              </div>
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input name="telephone" value={formData.telephone} onChange={handleChange} className="text-black" />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Profession</Label>
            <Input name="profession" value={formData.profession} onChange={handleChange} className="text-black" />
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Input name="statut" value={formData.statut} onChange={handleChange} className="text-black" />
          </div>
          <div className="space-y-2">
            <Label>Date de signature</Label>
            <Input type="date" name="dateSignature" value={formData.dateSignature} onChange={handleChange} className="text-black" />
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="space-y-2">
        <Label>Signature du signataire</Label>
        <div className="p-2 bg-white w-fit">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: 300,
              height: 100,
              className: 'border rounded bg-white',
              style: { touchAction: 'none' },
            }}
            onEnd={() => {
              if (sigRef.current) {
                const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
                setFormData((prev: any) => ({ ...prev, signature: dataUrl }));
              }
            }}
          />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" onClick={handleClearSignature} className="border-gray-300 px-2 py-1 text-xs">Effacer</Button>
            <Button type="button" onClick={handleSaveSignature} className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-xs">Enregistrer la signature</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
          {submitting ? 'Envoi...' : `Soumettre la ${isConvention ? 'convention' : 'contrat'}`}
        </Button>
      </div>

      {/* Message de succès */}
      {showSuccessMessage && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                {isConvention ? 'Convention' : 'Contrat'} signé avec succès !
              </h3>
              <div className="text-sm text-green-700 space-y-2">
                <p>
                  Votre {isConvention ? 'convention' : 'contrat'} a été signé et enregistré avec succès. Vous recevrez une confirmation par email.
                </p>
                <div className="bg-white p-4 rounded border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">📁 Suivre l'évolution de votre {isConvention ? 'convention' : 'contrat'} :</h4>
                  <p className="text-green-700 mb-3">
                    Pour suivre l'évolution de votre {isConvention ? 'convention' : 'contrat'} et accéder à tous vos documents :
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-green-700">
                    <li>Retournez à votre <strong>espace personnel</strong></li>
                    <li>Accédez à la section <strong>"Mes Devis"</strong></li>
                    <li>Cliquez sur <strong>"Voir"</strong> pour votre devis</li>
                    <li>Vous trouverez votre <strong>{isConvention ? 'convention' : 'contrat'} signé</strong> dans le dossier</li>
                  </ol>
                </div>
                <p className="text-xs text-green-600 mt-3">
                  Notre équipe vous contactera prochainement pour finaliser les détails de votre formation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de génération PDF */}
      {submittedData && (
        <div className="flex justify-end mt-4">
          <Button type="button" onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
            Télécharger en PDF
          </Button>
        </div>
      )}

      {/* Pied de page */}
      <footer className="mt-12 pt-8 border-t">
        <div className="text-xs text-orange-600 text-center mb-1">
          <sup>1</sup> Se rapporter aux dispositions des articles L 121-16 et -17 et R 121-1 du code de la consommation.
        </div>
        <div className="flex items-center justify-between text-xs text-gray-900">
          <div className="flex-1 text-center">
            CI.DES sasu &nbsp; Capital 2 500 Euros<br />
            SIRET: <span className="font-bold">87840789900011</span> &nbsp; VAT: FR71878407899<br />
            250501 CI.DES 2504SS03 11 Florent MIRBEAU {isConvention ? 'Convention' : 'Contrat'} Formation Professionnelle
          </div>
          <div className="flex flex-col items-center ml-4">
            <img src="/logo.png" alt="logo cides" className="w-10 h-10 mb-1" />
            <span className="text-[11px] text-gray-700">Page 1 sur 1</span>
          </div>
        </div>
      </footer>
    </form>
  );
}
