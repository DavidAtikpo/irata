'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import SignaturePad from 'react-signature-canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface EditablePDFProps {
  devis: any;
  onSubmit: (data: any) => Promise<void>;
}

export function EditablePDF({ devis, onSubmit }: EditablePDFProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [contratInfo, setContratInfo] = useState<any | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<{numero: string, reference: string} | null>(null);
  const [formData, setFormData] = useState({
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
  });
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Pré-remplir les informations de l'utilisateur depuis la session
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        const user = session.user as any;
        
        // Si nom et prénom sont dans la session, les utiliser
        if (user.nom && user.prenom) {
          console.log('Using session data:', { nom: user.nom, prenom: user.prenom });
          setFormData(prev => ({
            ...prev,
            nom: user.nom || '',
            prenom: user.prenom || '',
            adresse: user.adresse || '',
            profession: user.profession || '',
            statut: user.statut || '',
          }));
        } else {
          console.log('Session data incomplete, fetching from API...');
          // Sinon, récupérer via l'API
          try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
              const profileData = await response.json();
              console.log('API profile data:', profileData);
              setFormData(prev => {
                const newFormData = {
                  ...prev,
                  nom: profileData.user?.nom || '',
                  prenom: profileData.user?.prenom || '',
                  adresse: profileData.user?.adresse || '',
                  profession: profileData.user?.profession || '',
                  statut: profileData.user?.statut || '',
                  telephone: profileData.user?.phone || '',
                  ville: profileData.user?.city || '',
                  codePostal: profileData.user?.zipCode || '',
                  pays: profileData.user?.country || '',
                };
                console.log('Setting formData with:', { nom: newFormData.nom, prenom: newFormData.prenom });
                return newFormData;
              });
            } else {
              console.error('API response not ok:', response.status);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
          }
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Récupérer les infos du contrat pour ce devis (numero/reference)
  useEffect(() => {
    const fetchContrat = async () => {
      try {
        const resp = await fetch(`/api/user/devis/${devis.id}/contrat/check`);
        if (resp.ok) {
          const json = await resp.json();
          if (json?.contrat) {
            setContratInfo(json.contrat);
          } else {
            // Si pas de contrat existant, générer les numéros définitifs via l'API
            generateContractNumbers();
          }
        }
      } catch {}
    };
    if (devis?.id) fetchContrat();
  }, [devis?.id]);

  // Fonction pour générer les numéros de contrat définitifs via l'API
  const generateContractNumbers = async () => {
    try {
      const resp = await fetch(`/api/user/devis/${devis.id}/contrat/generate-numbers`);
      if (resp.ok) {
        const json = await resp.json();
        setGeneratedNumbers({ 
          numero: json.numero, 
          reference: json.reference 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération des numéros:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      setError('Veuillez signer le contrat');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        ...formData,
        signature,
        devisId: devis.id,
      });
      setSubmittedData({ ...formData, signature });
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Erreur lors de la soumission du contrat:', error);
      setError('Erreur lors de la soumission du contrat');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!submittedData) return;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // En-tête
    const isEntreprise = ((devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise') || !!devis?.demande?.entreprise;
    const titreHeader = isEntreprise ? 'CONVENTION DE FORMATION PROFESSIONNELLE' : 'CONTRAT DE FORMATION PROFESSIONNELLE';
    page.drawText('CI.DES', { x: 50, y: height - 50, size: 12, font: boldFont, color: rgb(0,0,0) });
    page.drawText(titreHeader, { x: 150, y: height - 50, size: 12, font: boldFont, color: rgb(0,0,0) });
    page.drawText('Révision: 02', { x: 400, y: height - 50, size: 10, font, color: rgb(0,0,0) });
    page.drawText('Code: ENR-CIDESA-RH 023', { x: 50, y: height - 70, size: 10, font, color: rgb(0,0,0) });
    page.drawText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { x: 400, y: height - 70, size: 10, font, color: rgb(0,0,0) });

    // Numéro et Référence du contrat/convention
    const numeroToShow = contratInfo?.numero || generatedNumbers?.numero;
    const referenceToShow = contratInfo?.reference || generatedNumbers?.reference;
    
    if (numeroToShow) {
      page.drawText(`Numéro: ${numeroToShow}`, { x: 50, y: height - 90, size: 11, font: boldFont, color: rgb(0,0,0) });
    }
    if (referenceToShow) {
      page.drawText(`Référence: ${referenceToShow}`, { x: 300, y: height - 90, size: 11, font: boldFont, color: rgb(0,0,0) });
    }

    // Champs remplis
    let y = height - 120;
    page.drawText('Nom :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.nom, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('Prénom :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.prenom, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('Adresse :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.adresse, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
    y -= 20;
    if (submittedData.ville) {
      page.drawText('Ville :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      page.drawText(submittedData.ville, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
      y -= 20;
    }
    if (submittedData.codePostal) {
      page.drawText('Code postal :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      page.drawText(submittedData.codePostal, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
      y -= 20;
    }
    if (submittedData.pays) {
      page.drawText('Pays :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      page.drawText(submittedData.pays, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
      y -= 20;
    }
    if (submittedData.telephone) {
      page.drawText('Téléphone :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      page.drawText(submittedData.telephone, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
      y -= 20;
    }
    
    page.drawText('Profession :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.profession, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('Statut :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.statut, { x: 150, y, size: 11, font, color: rgb(0,0,0) });
    y -= 30;
    page.drawText('Date de signature :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    page.drawText(submittedData.dateSignature, { x: 180, y, size: 11, font, color: rgb(0,0,0) });
    y -= 40;

    // Signature (image)
    if (submittedData.signature) {
      const pngUrl = submittedData.signature;
      const pngBytes = await fetch(pngUrl).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngBytes);
      page.drawText('Signature du stagiaire :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      page.drawImage(pngImage, { x: 200, y: y-10, width: 120, height: 40 });
      y -= 60;
    }

    // Signature admin du devis si disponible
    if (devis?.signature && typeof devis.signature === 'string' && devis.signature.startsWith('data:image/')) {
      try {
        page.drawText("Signature de l'organisme :", { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
        const adminBytes = await fetch(devis.signature).then(res => res.arrayBuffer());
        const adminImg = await pdfDoc.embedPng(adminBytes);
        page.drawImage(adminImg, { x: 230, y: y-10, width: 120, height: 40 });
        y -= 60;
      } catch {}
    }

    // Pied de page
    page.drawText('CI.DES sasu   Capital 2 500 Euros', { x: 50, y: 60, size: 9, font, color: rgb(0,0,0) });
    page.drawText('SIRET: 87840789900011   VAT: FR71878407899', { x: 50, y: 45, size: 9, font, color: rgb(0,0,0) });
    page.drawText('250501 CI.DES 2504SS03 11 Florent MIRBEAU Contrat Formation Professionnelle', { x: 50, y: 30, size: 8, font, color: rgb(0,0,0) });
    page.drawText('Page 2 sur 2', { x: width - 90, y: 30, size: 9, font, color: rgb(0,0,0) });
    page.drawText('Se rapporter aux dispositions des articles L 121-16 et -17 et R 121-1 du code de la consommation.', { x: 50, y: height - 20, size: 8, font, color: rgb(1, 0.4, 0) });

    const pdfBytes = await pdfDoc.save();
    // Create a fresh Uint8Array backed by ArrayBuffer to satisfy BlobPart typing
    const safeBytes = new Uint8Array(pdfBytes.length);
    safeBytes.set(pdfBytes);
    const blob = new Blob([safeBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrat_rempli_${submittedData.nom || 'stagiaire'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* En-tête du contrat (logo à gauche, tableau à droite) */}
        <div className="border rounded mb-6 bg-white shadow-sm p-3">
          <div className="flex items-start gap-4">
            <img src="/logo.png" alt="logo" className="w-14 h-14 flex-shrink-0" />
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold text-gray-800">Title</td>
                  <td className="border p-2 font-semibold text-gray-800">Code Number</td>
                  <td className="border p-2 font-semibold text-gray-800">Revision</td>
                  <td className="border p-2 font-semibold text-gray-800">Creation date</td>
                </tr>
                <tr>
                  <td className="border p-2 font-bold underline text-gray-900">CI.DES AGREEMENT SERVICE CONTRACT</td>
                  <td className="border p-2 font-bold underline text-gray-900">ENR-CIDESA-RH 023</td>
                  <td className="border p-2 font-bold text-gray-900">02</td>
                  <td className="border p-2 font-bold text-gray-900">29/07/2024</td>
                </tr>
              </tbody>
            </table>
          </div>
          {(contratInfo || generatedNumbers) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  Numéro
                  {generatedNumbers && !contratInfo && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Généré définitivement
                    </span>
                  )}
                </div>
                <div className="mt-1 p-2 border rounded bg-gray-50 text-gray-900">
                  {contratInfo?.numero || generatedNumbers?.numero || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  Référence
                  {generatedNumbers && !contratInfo && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Générée définitivement
                    </span>
                  )}
                </div>
                <div className="mt-1 p-2 border rounded bg-gray-50 text-gray-900">
                  {contratInfo?.reference || generatedNumbers?.reference || '-'}
                </div>
              </div>
            </div>
          )}
          
          {generatedNumbers && !contratInfo && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    <strong>Numéros de contrat générés :</strong> Les numéros affichés sont générés définitivement et seront sauvegardés lors de la signature du contrat.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">{(devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise' || devis?.demande?.entreprise ? 'CONVENTION DE FORMATION PROFESSIONNELLE' : 'CONTRAT DE FORMATION PROFESSIONNELLE'}</h2>
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
            <h3 className="text-lg font-semibold text-gray-900">B. Si Particulier Cocontractant :</h3>
            
            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Informations pré-remplies :</strong> Vos informations personnelles ont été automatiquement récupérées depuis votre profil. 
                    Vous pouvez les modifier si nécessaire avant de signer le contrat.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-gray-700 flex items-center">
                  NOM
                  {formData.nom && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Pré-rempli
                    </span>
                  )}
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="text-gray-900"
                  placeholder="Votre nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-gray-700 flex items-center">
                  Prénom
                  {formData.prenom && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Pré-rempli
                    </span>
                  )}
                </Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                  className="text-gray-900"
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-gray-700 flex items-center">
                  Adresse
                  {formData.adresse && formData.adresse !== 'À compléter' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Pré-rempli
                    </span>
                  )}
                </Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  required
                  className="text-gray-900"
                  placeholder="Votre adresse complète"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pays" className="text-gray-700 flex items-center">Pays</Label>
                <Input
                  id="pays"
                  value={formData.pays}
                  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre pays"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codePostal" className="text-gray-700 flex items-center">Code postal</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre code postal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville" className="text-gray-700 flex items-center">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre ville"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-gray-700 flex items-center">Numéro de téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-gray-700 flex items-center">
                  Profession
                  {formData.profession && formData.profession !== 'Stagiaire' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Pré-rempli
                    </span>
                  )}
                </Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre profession"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut" className="text-gray-700 flex items-center">
                  Statut
                  {formData.statut && formData.statut !== 'Particulier' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Pré-rempli
                    </span>
                  )}
                </Label>
                <Input
                  id="statut"
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="text-gray-900"
                  placeholder="Votre statut"
                />
              </div>
            </div>
            <p className="italic text-gray-600">(Ci-après dénommé le stagiaire).</p>
          </div>

        {((devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise' || devis?.demande?.entreprise) ? (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article I Objet :</h3>
              <p className="text-gray-700">En exécution du présent contrat, l’organisme de formation s’engage à organiser l’action de formation intitulée :</p>
              <p className="font-semibold text-gray-900">« Formation Cordiste IRATA » (Industrial Rope Access Trade Association)</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article II Nature et caractéristique des actions de formation :</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>L’action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l’article L. 6313-1 du code du travail.</li>
                <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste « capable d’exercer des interventions cordiste » et « apte à évoluer sur cordes en sécurité. »</li>
                <li>Sa durée est fixée à : 5 jours, soit 40 heures à compter du {devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'} jusqu’au {devis.dateExamen ? new Date(devis.dateExamen).toLocaleDateString('fr-FR') : 'Non définie'}</li>
                <li>Programme de formation (voir Manuel Stagiaire)</li>
                <li>Sanction de la formation : CERTIFICATION IRATA si aptitude reconnu l’hors de l’examen</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article III Niveau de connaissances préalables nécessaire</h3>
              <p className="text-gray-700">Afin de suivre au mieux l’action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare, l’entreprise bénéficiaire est informée qu’il est nécessaire de posséder, avant l’entrée en formation, le niveau de connaissances suivant : « Être majeur, en bonne condition mentale et physique ».</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article IV Dispositions financières</h3>
              <p className="text-gray-700">Le prix de l’action de formation est fixé à : <span className="font-semibold">{(devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros Net</span></p>
              <p className="text-gray-700">L’entreprise bénéficiaire s’engage à payer la prestation selon les modalités de paiement suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>En un versement d’un montant de {(devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} euros.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article V Interruption du stage</h3>
              <p className="text-gray-700">En cas de cessation anticipée de la formation du fait de l’organisme de formation ou l’abandon du stage par le stagiaire pour un autre motif que la force majeure dûment reconnue, le présent contrat est résilié selon les modalités financières suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Paiement des heures réellement suivies selon règle du prorata temporis</li>
                <li>Versement à titre de dédommagement pour les heures non suivies du fait du stagiaire : 900 euros</li>
              </ul>
              <p className="text-gray-700">Si le stagiaire est empêché de suivre la formation par suite de force majeure dûment reconnue, la convention de formation professionnelle est résiliée. Dans ce cas, seules les prestations effectivement dispensées sont dues au prorata temporis de leur valeur prévue au présent contrat.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article VI Cas de différend :</h3>
              <p className="text-gray-700">Si une contestation ou un différend n’ont pu être réglés à l’amiable, le tribunal de Saintes sera compétent pour régler le litige.</p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 1 - Objet :</h3>
              <p className="text-gray-700">En exécution du présent contrat, l'organisme de formation s'engage à organiser l'action de formation intitulée :</p>
              <p className="font-semibold text-gray-900">« Formation Cordiste IRATA » (Industrial Rope Access Trade Association)</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article 2 - Nature et caractéristique des actions de formation :</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
                <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste apte à exercer des interventions cordiste et apte à évoluer sur cordes en sécurité.</li>
                <li>Sa durée est fixée à : 5 jours soit 40 heures à compter du {devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
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
              <p className="text-gray-700">Le prix de l'action de formation est fixé à : {(devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net</p>
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
          </>
        )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Article 2 - Nature et caractéristique des actions de formation :</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
              <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste apte à exercer des interventions cordiste et apte à évoluer sur cordes en sécurité.</li>
              <li>Sa durée est fixée à : 5 jours soit 40 heures à compter du {devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
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
            <p className="text-gray-700">Le prix de l'action de formation est fixé à : {devis.montant} Euros net</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Signature</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <p className="font-medium mb-2 text-gray-700">Signature du stagiaire :</p>
                <div className="border rounded-lg p-3 sm:p-4 bg-white">
                  <SignaturePad
                    canvasProps={{
                      className: 'signature-canvas w-full h-32 sm:h-48 border rounded bg-white',
                    }}
                    onEnd={() => {
                      const signaturePad = document.querySelector('.signature-canvas') as HTMLCanvasElement;
                      if (signaturePad) {
                        setSignature(signaturePad.toDataURL());
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full sm:w-auto"
                    onClick={() => {
                      const signaturePad = document.querySelector('.signature-canvas') as HTMLCanvasElement;
                      if (signaturePad) {
                        const context = signaturePad.getContext('2d');
                        if (context) {
                          context.clearRect(0, 0, signaturePad.width, signaturePad.height);
                          setSignature(null);
                        }
                      }
                    }}
                  >
                    Effacer la signature
                  </Button>
                </div>
              </div>
              <div>
              <p className="font-medium mb-2 text-gray-700">Pour l'organisme de formation :</p>
              <p className="text-sm text-gray-600">ARDOUIN Laurent, Président</p>
              {devis?.signature && devis.signature.startsWith('data:image/') && (
                <div className="mt-2">
                  <img src={devis.signature} alt="Signature admin" className="h-16 bg-white border rounded" />
                </div>
              )}
              </div>
            </div>
          </div>

          {!showSuccessMessage && (
            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'Envoi en cours...' : 'Signer le contrat'}
              </Button>
            </div>
          )}
        </div>
      </form>
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
                Contrat signé avec succès !
              </h3>
              <div className="text-sm text-green-700 space-y-2">
                <p>
                  Votre contrat a été signé et enregistré avec succès. Vous recevrez une confirmation par email.
                </p>
                <div className="bg-white p-4 rounded border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">📁 Suivre l'évolution de votre contrat :</h4>
                  <p className="text-green-700 mb-3">
                    Pour suivre l'évolution de votre contrat et accéder à tous vos documents :
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-green-700">
                    <li>Retournez à votre <strong>espace personnel</strong></li>
                    <li>Accédez à la section <strong>"Mes Devis"</strong></li>
                    <li>Cliquez sur <strong>"Voir"</strong> pour votre devis</li>
                    <li>Vous trouverez votre <strong>contrat signé</strong> dans le dossier</li>
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

      {submittedData && (
        <div className="flex justify-end mt-4">
          <Button type="button" onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
            Télécharger en PDF
          </Button>
        </div>
      )}
      {/* Pied de page du contrat (aligné sur l'admin) */}
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
    </>
  );
} 