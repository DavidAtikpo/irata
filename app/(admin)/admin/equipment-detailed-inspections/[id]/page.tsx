'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EquipmentDetailedInspection {
  id: string;
  referenceInterne: string;
  typeEquipement: string;
  numeroSerie?: string;
  dateFabrication?: string;
  dateAchat?: string;
  dateMiseEnService?: string;
  dateInspectionDetaillee?: string;
  numeroKit?: string;
  taille?: string;
  longueur?: string;
  normesCertificat?: string;
  documentsReference?: string;
  consommation?: string;
  attribution?: string;
  commentaire?: string;
  photo?: string;
  qrCode?: string;
  etat: string;
  antecedentProduit?: any;
  observationsPrelables?: any;
  calotteExterieurInterieur?: any;
  calotin?: any;
  coiffe?: any;
  tourDeTete?: any;
  systemeReglage?: any;
  jugulaire?: any;
  mousseConfort?: any;
  crochetsLampe?: any;
  accessoires?: any;
  verificateurSignature?: string;
  verificateurNom?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
}

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspection, setInspection] = useState<EquipmentDetailedInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/admin/equipment-detailed-inspections/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'inspection');
        }
        const data = await response.json();
        setInspection(data);
      } catch (error) {
        setError('Erreur lors de la récupération de l\'inspection');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchInspection();
    }
  }, [status, session, router, params]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'V':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'X':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'NA':
        return <span className="text-gray-500 text-sm">NA</span>;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'DRAFT':
        return 'Brouillon';
      case 'SUBMITTED':
        return 'Soumis';
      case 'ASSESSED':
        return 'Évalué';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Inspection non trouvée'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Inspection d'Équipement
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {inspection.referenceInterne} - {inspection.typeEquipement}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/equipment-detailed-inspections/${inspection.id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Colonne gauche - Identification équipement */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Identification équipement
                  </h2>
                  
                  {/* Photo et État */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {inspection.photo ? (
                          <img src={inspection.photo} alt="Équipement" className="max-w-full h-auto rounded" />
                        ) : (
                          <div className="text-gray-400 text-sm">
                            Aucune photo
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        État
                      </label>
                      <div className={`flex items-center justify-center h-20 rounded-lg ${
                        inspection.etat === 'OK' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {inspection.etat === 'OK' ? (
                          <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        ) : (
                          <XMarkIcon className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {inspection.qrCode ? (
                        <img src={inspection.qrCode} alt="QR Code" className="max-w-full h-auto rounded" />
                      ) : (
                        <div className="text-gray-400 text-sm">
                          QR Code
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Champs d'identification */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Référence interne
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.referenceInterne}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type d'équipement
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.typeEquipement}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Numéro de série
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.numeroSerie || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Date de Fabrication
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.dateFabrication || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Date d'Achat
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-yellow-50 p-2 rounded">
                          {inspection.dateAchat || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Date de mise en service
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.dateMiseEnService || '-'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Inspection Détaillée (tous les 6 mois)
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-yellow-50 p-2 rounded">
                        {inspection.dateInspectionDetaillee || '-'}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          n° de kit
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.numeroKit || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Taille
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.taille || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Longueur
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.longueur || '-'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Normes et Certificat de conformité
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {inspection.normesCertificat || '-'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Documents Référence
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-yellow-50 p-2 rounded">
                        {inspection.documentsReference || '-'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Consommation
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.consommation || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Attribution
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.attribution || '-'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Commentaire
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {inspection.commentaire || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Vie de l'équipement */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Vie de l'équipement
                  </h2>

                  {/* Points d'inspection */}
                  <div className="space-y-6">
                    {/* 1. ANTECEDENT DU PRODUIT */}
                    {inspection.antecedentProduit && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          1. ANTECEDENT DU PRODUIT:
                        </h3>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700">
                            Mise en service le: {inspection.antecedentProduit.miseEnService || '-'}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Référence Interne marquée et lisible</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.antecedentProduit.referenceInterneMarquee?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Lisibilité Numéro de série, de la norme</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.antecedentProduit.lisibiliteNumeroSerie?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Durée de vie n'est pas dépassée</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.antecedentProduit.dureeVieNonDepassee?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. OBSERVATIONS PREALABLES */}
                    {inspection.observationsPrelables && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          2. OBSERVATIONS PREALABLES:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Marque/Impact/Fissure/déformation/Trace de salissure / Rayure/Brûlure/ Trace de produits chimique/Usure... Ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.observationsPrelables.marqueImpactFissure?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Déformation/Fissure/Impact ... Ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.observationsPrelables.deformationFissureImpact?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. CALOTTE (Coque) - Extérieur-Intérieur */}
                    {inspection.calotteExterieurInterieur && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          3. CALOTTE (Coque): - Extérieur-Intérieur:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Fentes et trous accessoires:</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.calotteExterieurInterieur.fentesTrousAccessoires?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Volets aération si il y a, (fonctionnement):</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.calotteExterieurInterieur.voletsAeration?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Marque/Fissure/Déformation/Usure ... Ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.calotteExterieurInterieur.marqueFissureDeformation?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. CALOTIN */}
                    {inspection.calotin && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          4. CALOTIN (si il y a):
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Ôtez éléments de confort si nécessaire; Ne pas démonté calotin si fixé sur la coque.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.calotin.otezElementsConfort?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. COIFFE */}
                    {inspection.coiffe && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          5. COIFFE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat des sangles et de leurs fixation dans la calotte. Usure/Coupure/Brûlure/Déformation... Ajouter commentaires.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.coiffe.etatSanglesFixation?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. TOUR DE TETE */}
                    {inspection.tourDeTete && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          6. TOUR DE TETE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Elément manquant/ Fixation ... ajouter commentaires.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.tourDeTete.usureDeformationElement?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. SYSTEME DE REGLAGE */}
                    {inspection.systemeReglage && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          7. SYSTEME DE REGLAGE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat, fixations; actionner système dans les deux sens; Tirez sur système pour voir si il se dérègle ou pas. Usure/Déformation / Elément manquant/ Fixation ... ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.systemeReglage.etatFixations?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 8. JUGULAIRE */}
                    {inspection.jugulaire && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          8. JUGULAIRE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat sangles et éléments de réglage (inspecter les parties cachées également). Usure/Coupure/Brûlure/Déformation... Ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.jugulaire.etatSanglesElements?.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Etat de la boucle de fermeture jugulaire: Casse/Déformation/Fissure / Usure ... ajouter commentaires</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.jugulaire.etatBoucleFermeture?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 9. MOUSSE DE CONFORT */}
                    {inspection.mousseConfort && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          9. MOUSSE DE CONFORT:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Démonter pour laver ou remplacer quand c'est nécessaire. Usure/Déformation/Casse/ Elément manquant... ajouter commentaires.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.mousseConfort.usureDeformationCasse?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 10. CROCHETS DE LAMPE */}
                    {inspection.crochetsLampe && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          10. CROCHETS DE LAMPE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Casse/ Elément manquant... ajouter commentaires.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.crochetsLampe.usureDeformationCasse?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 11. ACCESSOIRES */}
                    {inspection.accessoires && (
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          11. ACCESSOIRES: Visière, lampe:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Fonctionnement / Etat... ajouter commentaires.</span>
                            <div className="flex items-center">
                              {getStatusIcon(inspection.accessoires.fonctionnementEtat?.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section Signature */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Vérificateur / signature
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nom du vérificateur
                        </label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {inspection.verificateurNom || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Signature
                        </label>
                        <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {inspection.verificateurSignature ? (
                            <img src={inspection.verificateurSignature} alt="Signature" className="max-w-full h-auto rounded" />
                          ) : (
                            <div className="text-gray-400 text-sm">
                              Zone de signature
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de métadonnées */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Statut:</span> {getStatusText(inspection.status)}
                </div>
                <div>
                  <span className="font-medium">Créé par:</span> {inspection.createdBy.nom && inspection.createdBy.prenom
                    ? `${inspection.createdBy.prenom} ${inspection.createdBy.nom}`
                    : inspection.createdBy.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
