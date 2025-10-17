'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import SignaturePad from 'react-signature-canvas';

interface ContractFormProps {
  devis: any;
  onSubmit: (data: any) => Promise<void>;
}

export function ContractForm({ devis, onSubmit }: ContractFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    const cleaned = {
      nom: (formData.nom || '').toString().trim(),
      prenom: (formData.prenom || '').toString().trim(),
      adresse: (formData.adresse || '').toString().trim(),
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
    
    if (!cleaned.nom) {
      alert('Le nom est requis');
      return;
    }
    if (!cleaned.prenom) {
      alert('Le prénom est requis');
      return;
    }
    if (!cleaned.adresse) {
      alert('L\'adresse est requise');
      return;
    }
    if (!cleaned.profession) {
      alert('La profession est requise');
      return;
    }
    if (!cleaned.statut) {
      alert('Le statut est requis');
      return;
    }
    if (!cleaned.telephone) {
      alert('Le téléphone est requis');
      return;
    }
    if (!cleaned.email) {
      alert('L\'email est requis');
      return;
    }
    if (!cleaned.dateNaissance) {
      alert('La date de naissance est requise');
      return;
    }
    if (!cleaned.lieuNaissance) {
      alert('Le lieu de naissance est requis');
      return;
    }
    if (!cleaned.ville) {
      alert('La ville est requise');
      return;
    }
    if (!cleaned.codePostal) {
      alert('Le code postal est requis');
      return;
    }
    if (!cleaned.pays) {
      alert('Le pays est requis');
      return;
    }
    if (!signature) {
      alert('Veuillez signer le contrat');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...cleaned,
        dateSignature: formData.dateSignature,
        signature,
        devisId: devis.id,
      });
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la soumission du contrat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-white">
      <div className="space-y-8">
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
          <h3 className="text-lg font-semibold text-gray-900">B. Si Particulier Cocontractant :</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-gray-700">NOM *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom" className="text-gray-700">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse" className="text-gray-700">Adresse *</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-gray-700">Profession *</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut" className="text-gray-700">Statut *</Label>
              <Input
                id="statut"
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-gray-700">Téléphone *</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateNaissance" className="text-gray-700">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieuNaissance" className="text-gray-700">Lieu de naissance *</Label>
              <Input
                id="lieuNaissance"
                value={formData.lieuNaissance}
                onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville" className="text-gray-700">Ville *</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codePostal" className="text-gray-700">Code postal *</Label>
              <Input
                id="codePostal"
                value={formData.codePostal}
                onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pays" className="text-gray-700">Pays *</Label>
              <Input
                id="pays"
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                required
                className="text-gray-900"
              />
            </div>
          </div>
          <p className="italic text-gray-600">(Ci-après dénommé le stagiaire).</p>
        </div>

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
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-medium mb-2 text-gray-700">Signature du stagiaire :</p>
              <div className="border rounded-lg p-4 bg-white">
                <SignaturePad
                  canvasProps={{
                    className: 'signature-canvas w-full h-48 border rounded bg-white',
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
                  className="mt-2"
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
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Signer le contrat'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 