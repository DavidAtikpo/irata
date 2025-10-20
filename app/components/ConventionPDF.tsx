'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ConventionPDFProps {
  devis: any;
  onSubmit: (data: any) => Promise<void>;
}

export function ConventionPDF({ devis, onSubmit }: ConventionPDFProps) {
  const { data: session } = useSession();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 300, height: 120 });
  const [isSigning, setIsSigning] = useState(false);

  const [formData, setFormData] = useState<any>({
    entrepriseNom: '',
    entrepriseAdresse: '',
    entrepriseCodePostal: '',
    entrepriseVille: '',
    entrepriseTelephone: '',
    nom: '',
    prenom: '',
    profession: '',
    statut: '',
    telephone: '',
    email: '',
    dateNaissance: '',
    lieuNaissance: '',
    ville: '',
    codePostal: '',
    pays: '',
    dateSignature: new Date().toISOString().split('T')[0],
    signature: '',
  });

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

  // Fix canvas size once per mount to avoid clears on mobile resize/keyboard
  useEffect(() => {
    try {
      const maxWidth = 600;
      const padding = 32; // some horizontal padding
      const calculatedWidth = Math.min(Math.max(280, (typeof window !== 'undefined' ? window.innerWidth : 320) - padding), maxWidth);
      const calculatedHeight = 140;
      setCanvasDims({ width: calculatedWidth, height: calculatedHeight });
    } catch {}
    // Do not update on resize to avoid canvas clearing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Validation complète des champs requis
      const cleaned = {
        ...formData,
        entrepriseNom: (formData.entrepriseNom || '').toString().trim(),
        entrepriseAdresse: (formData.entrepriseAdresse || '').toString().trim(),
        entrepriseCodePostal: (formData.entrepriseCodePostal || '').toString().trim(),
        entrepriseVille: (formData.entrepriseVille || '').toString().trim(),
        entrepriseTelephone: (formData.entrepriseTelephone || '').toString().trim(),
        nom: (formData.nom || '').toString().trim(),
        prenom: (formData.prenom || '').toString().trim(),
        profession: (formData.profession || '').toString().trim(),
        statut: (formData.statut || '').toString().trim(),
        telephone: (formData.telephone || '').toString().trim(),
        email: (formData.email || '').toString().trim(),
        dateNaissance: (formData.dateNaissance || '').toString().trim(),
        lieuNaissance: (formData.lieuNaissance || '').toString().trim(),
        ville: (formData.ville || '').toString().trim(),
        codePostal: (formData.codePostal || '').toString().trim(),
        pays: (formData.pays || '').toString().trim(),
      };
      
      // Validation des champs entreprise
      if (!cleaned.entrepriseNom) {
        throw new Error('Nom de l\'entreprise requis');
      }
      if (!cleaned.entrepriseAdresse) {
        throw new Error('Adresse de l\'entreprise requise');
      }
      if (!cleaned.entrepriseCodePostal) {
        throw new Error('Code postal de l\'entreprise requis');
      }
      if (!cleaned.entrepriseVille) {
        throw new Error('Ville de l\'entreprise requise');
      }
      if (!cleaned.entrepriseTelephone) {
        throw new Error('Téléphone de l\'entreprise requis');
      }
      
      // Validation des champs signataire
      if (!cleaned.nom) {
        throw new Error('Nom du signataire requis');
      }
      if (!cleaned.prenom) {
        throw new Error('Prénom du signataire requis');
      }
      if (!cleaned.profession) {
        throw new Error('Profession du signataire requise');
      }
      if (!cleaned.statut) {
        throw new Error('Statut du signataire requis');
      }
      if (!formData.dateSignature) {
        throw new Error('Date de signature requise');
      }
      if (!cleaned.telephone) {
        throw new Error('Téléphone du signataire requis');
      }
      if (!cleaned.email) {
        throw new Error('Email du signataire requis');
      }
      if (!cleaned.dateNaissance) {
        throw new Error('Date de naissance du signataire requise');
      }
      if (!cleaned.lieuNaissance) {
        throw new Error('Lieu de naissance du signataire requis');
      }
      if (!cleaned.ville) {
        throw new Error('Ville du signataire requise');
      }
      if (!cleaned.codePostal) {
        throw new Error('Code postal du signataire requis');
      }
      if (!cleaned.pays) {
        throw new Error('Pays du signataire requis');
      }
      if (!cleaned.signature || cleaned.signature.length < 50) {
        throw new Error('Signature requise');
      }

      await onSubmit({
        ...cleaned,
        isEntreprise: true,
      });
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la soumission de la convention');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                <td className="border p-2 font-bold underline text-gray-900">CI.DES AGREEMENT SERVICE CONVENTION</td>
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

      {/* Titre et textes de la convention */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">CONVENTION DE FORMATION PROFESSIONNELLE</h2>
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">B. Si Entreprise Cocontractante :</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Nom de l'entreprise *</Label>
            <Input name="entrepriseNom" value={formData.entrepriseNom} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Adresse de l'entreprise *</Label>
            <Input name="entrepriseAdresse" value={formData.entrepriseAdresse} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Code postal *</Label>
            <Input name="entrepriseCodePostal" value={formData.entrepriseCodePostal} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Ville *</Label>
            <Input name="entrepriseVille" value={formData.entrepriseVille} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Numéro de téléphone de l'entreprise *</Label>
            <Input name="entrepriseTelephone" value={formData.entrepriseTelephone} onChange={handleChange} className="text-black" required />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Signataire</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>NOM *</Label>
            <Input name="nom" value={formData.nom} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Prénom *</Label>
            <Input name="prenom" value={formData.prenom} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Profession *</Label>
            <Input name="profession" value={formData.profession} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Statut *</Label>
            <Input name="statut" value={formData.statut} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Date de signature *</Label>
            <Input type="date" name="dateSignature" value={formData.dateSignature} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Téléphone *</Label>
            <Input name="telephone" value={formData.telephone} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Date de naissance *</Label>
            <Input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Lieu de naissance *</Label>
            <Input name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Ville *</Label>
            <Input name="ville" value={formData.ville} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Code postal *</Label>
            <Input name="codePostal" value={formData.codePostal} onChange={handleChange} className="text-black" required />
          </div>
          <div className="space-y-2">
            <Label>Pays *</Label>
            <Input name="pays" value={formData.pays} onChange={handleChange} className="text-black" required />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Signature du signataire *</Label>
        <div className="p-2 bg-white w-fit">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: canvasDims.width,
              height: canvasDims.height,
              className: 'border rounded bg-white',
              style: { touchAction: 'none' },
            }}
            clearOnResize={false}
            backgroundColor="#ffffff"
            penColor="#000000"
            minWidth={0.8}
            maxWidth={2.5}
            throttle={16}
            onBegin={() => setIsSigning(true)}
            onEnd={() => {
              if (sigRef.current) {
                const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
                // Defer state update slightly to avoid immediate rerender during touch
                setTimeout(() => {
                  setFormData((prev: any) => ({ ...prev, signature: dataUrl }));
                  setIsSigning(false);
                }, 0);
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
          {submitting ? 'Envoi...' : 'Soumettre la convention'}
        </Button>
      </div>
    </form>
  );
}
