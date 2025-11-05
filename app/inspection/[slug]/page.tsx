'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { generateSlugFromReference } from '@/lib/slug';
import { QrCodeIcon, DocumentIcon, CheckCircleIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function PublicInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspection, setInspection] = useState<any>(null);

  // Fonction pour déterminer si c'est un harnais
  const isHarness = () => {
    if (!inspection) return false;
    return inspection.typeEquipement?.toLowerCase().includes('harnais') || 
           (inspection.etatSangles !== null && inspection.etatSangles !== undefined);
  };

  // Fonction pour déterminer si c'est un mousqueton
  const isMousqueton = () => {
    if (!inspection) return false;
    return inspection.typeEquipement?.toLowerCase().includes('mousqueton') || 
           (inspection.verificationCorps !== null && inspection.verificationCorps !== undefined);
  };

  // Helper functions (doivent être définies avant les early returns)
  const StatusIndicator = ({ status }: { status: 'V' | 'NA' | 'X' }) => {
    if (status === 'V') {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          V
        </div>
      );
    } else if (status === 'NA') {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          NA
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          X
        </div>
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour rendre du texte avec mots barrés individuellement
  const renderCrossedOutText = (text: string, fieldKey: string) => {
    if (!inspection?.crossedOutWords?.[fieldKey]) {
      return <span>{text}</span>;
    }

    // Diviser le texte en mots et séparateurs
    const parts = text.split(/(\s+|\/|\(|\)|-|\.)/);

    return (
      <span>
        {parts.map((part, index) => {
          // Si c'est un séparateur, l'afficher tel quel
          if (/^\s+$/.test(part) || /^[\/\(\)\-\.]+$/.test(part)) {
            return <span key={index}>{part}</span>;
          }

          // Si c'est un mot, vérifier s'il est barré
          const isCrossed = inspection.crossedOutWords[fieldKey][part];
          return (
            <span
              key={index}
              className={isCrossed ? 'line-through' : ''}
            >
              {part}
            </span>
          );
        })}
      </span>
    );
  };

  // Charger les données de l'inspection
  useEffect(() => {
    const loadInspection = async () => {
      try {
        const response = await fetch(`/api/public/inspection/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setInspection(data);
        } else {
          setError('Inspection non trouvée');
        }
      } catch (error) {
        setError('Erreur lors du chargement de l\'inspection');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadInspection();
    }
  }, [slug]);

  // Générer l'URL complète et mettre à jour les meta tags
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const title = `Inspection - ${inspection?.referenceInterne || 'Équipement'}`;
  const description = `Inspection détaillée de l'équipement ${inspection?.typeEquipement || ''} - ${inspection?.referenceInterne || ''}`;
  const imageUrl = inspection?.photo || '';

  // Mettre à jour les meta tags dynamiquement pour WhatsApp
  useEffect(() => {
    if (!inspection) return;

    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setMetaName = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Open Graph tags pour WhatsApp/Facebook
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:url', publicUrl);
    setMetaTag('og:type', 'website');
    if (imageUrl) {
      setMetaTag('og:image', imageUrl);
      setMetaTag('og:image:width', '1200');
      setMetaTag('og:image:height', '630');
      setMetaTag('og:image:alt', `Photo de l'équipement ${inspection.referenceInterne}`);
    }

    // Twitter Card tags
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    if (imageUrl) {
      setMetaName('twitter:image', imageUrl);
    }

    // Meta tags standards
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = title;
    }

    const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descriptionMeta) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
      meta.setAttribute('content', description);
    } else {
      descriptionMeta.setAttribute('content', description);
    }
  }, [inspection, publicUrl, title, description, imageUrl]);


  // Fonction pour obtenir l'URL de l'image QR code
  const getQRCodeImageUrl = (): string | null => {
    if (!inspection) return null;
    
    // 1. Si un QR code est stocké dans la base, l'utiliser en priorité
    if (inspection.qrCode) {
      // Si c'est une data URL (QR code avec CI.DES sauvegardé)
      if (inspection.qrCode.startsWith('data:image/')) {
        return inspection.qrCode;
      }
      
      // Si c'est une URL Cloudinary (ancien format)
      if (inspection.qrCode.startsWith('http://') || inspection.qrCode.startsWith('https://')) {
        return inspection.qrCode;
      }
    }
    
    // 2. Sinon, générer depuis l'ID unique pour garantir l'unicité
    if (inspection.id) {
      const slug = inspection.referenceInterne 
        ? generateSlugFromReference(inspection.referenceInterne) 
        : 'equipement';
      const publicUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/inspection/${inspection.id}-${slug}` 
        : `/inspection/${inspection.id}-${slug}`;
      
      // Générer l'image QR code depuis l'API basée sur l'ID unique
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;
    }
    
    return null;
  };

  // Helper functions pour les signatures séparées
  const getCurrentCertificate = (): string | null => {
    return inspection?.verificateurSignaturePdf || null;
  };

  const getCurrentDigitalSignature = (): string | null => {
    return inspection?.verificateurDigitalSignature || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inspection non trouvée</h1>
          <p className="text-gray-600 mb-4">{error || 'L\'équipement demandé n\'existe pas.'}</p>
          <button
            onClick={() => router.push('/inspection')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white print:bg-white">
        {/* Header simple sans boutons - Interface épurée pour visiteurs QR code */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inspection Détaillée d'Équipement
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {inspection.referenceInterne} - {inspection.typeEquipement}
            </p>
          </div>
        </div>

        {/* Contenu principal - Réutiliser la structure de la page view */}
        <div className="max-w-7xl mx-auto px-3 py-8 print:px-0 print:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 print:grid-cols-2">
            
            {/* Colonne gauche - Identification équipement */}
            <div className="lg:col-span-2 space-y-2">
              <div className="bg-white p-2 print:border-0 print:shadow-none">
                <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
                  Identification équipement
                </h2>
                
                {/* Photo, État et QR Code */}
                <div className="grid grid-cols-3 gap-1 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">Photo</div>
                    <div className="border-2 border-gray-300 rounded-lg p-1 h-42 flex items-center justify-center">
                      {inspection.photo ? (
                        <img src={inspection.photo} alt="Équipement" className="max-w-full max-h-full object-contain rounded" />
                      ) : (
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">État</div>
                    <div className="p-4 h-25 flex items-center justify-center">
                      {inspection.etat === 'OK' ? (
                        <div className="text-center">
                          <img 
                            src="/picto-OK.jpg" 
                            alt="État valide" 
                            className="h-12 w-12 mx-auto mb-1 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                          <CheckCircleIcon 
                            className="h-8 w-8 text-green-600 mx-auto mb-1 hidden" 
                            style={{ display: 'none' }}
                          />
                          <div className="text-xs font-medium text-green-800">Valide</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <img 
                            src="/invalide.png" 
                            alt="État invalide" 
                            className="h-12 w-12 mx-auto mb-1 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                          <XMarkIcon 
                            className="h-8 w-8 text-red-600 mx-auto mb-1 hidden" 
                            style={{ display: 'none' }}
                          />
                          <div className="text-xs font-medium text-red-800">Invalide</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* <div className="text-center"> */}
                    {/* <div className="text-sm font-medium text-gray-700 mb-2">QR Code</div> */}
                    {/* <div className="border-2 border-gray-300 rounded-lg p-1 h-32 flex items-center justify-center">
                      {(() => {
                        const qrUrl = getQRCodeImageUrl();
                        if (qrUrl) {
                          return (
                            <>
                              <img 
                                src={qrUrl} 
                                alt="QR Code" 
                                className="max-w-full max-h-full object-contain" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const icon = e.currentTarget.nextElementSibling;
                                  if (icon) {
                                    (icon as HTMLElement).style.display = 'block';
                                  }
                                }}
                              />
                              <QrCodeIcon className="h-8 w-8 text-gray-400" style={{ display: 'none' }} />
                            </>
                          );
                        }
                        return <QrCodeIcon className="h-8 w-8 text-gray-400" />;
                      })()}
                    </div> */}
                  {/* </div> */}
                </div>

                {/* Détails de l'équipement */}
                <div className="space-y-3">
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Référence interne:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.referenceInterne || '/'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Type d'équipement:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.typeEquipement || '/'}</span>
                  </div>
                  {isHarness() && inspection.numeroSerieTop && (
                    <div className="flex justify-between bg-gray-100 p-2">
                      <span className="text-sm font-medium text-gray-700">N° de série Top:</span>
                      <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieTop || '/'}</span>
                    </div>
                  )}
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">N° de série:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerie || '/'}</span>
                  </div>
                  {isHarness() && inspection.numeroSerieCuissard && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">N° de série Cuissard:</span>
                      <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieCuissard || '/'}</span>
                    </div>
                  )}
                  {/* {isHarness() && inspection.numeroSerieNonEtiquete && (
                    <div className="flex justify-between bg-gray-100 p-2">
                      <span className="text-sm font-medium text-gray-700">Numéro (non étiqueté):</span>
                      <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieNonEtiquete || '/'}</span>
                    </div>
                  )} */}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Date de Fabrication:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.dateFabrication || '/'}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Date d' Achat:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-bold">{inspection.dateAchat || '/'}</span>
                      {inspection.dateAchatImage && (
                        <button
                          onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(inspection.dateAchatImage)}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          Voir PDF
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Date de mise en service:</span>
                    <span className="text-sm text-gray-900 font-bold">{formatDate(inspection.dateMiseEnService) || '/'}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Inspection Détaillée (tous les 6 mois):</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.dateInspectionDetaillee || 'date de l\'inspection'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">n° de kit:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.numeroKit || '/'}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Taille:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.taille || '/'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Longeur:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.longueur || '/'}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Normes et Certificat de conformité:</span>
                    <span 
                      className="text-sm text-gray-900 font-bold"
                      dangerouslySetInnerHTML={{ 
                        __html: inspection.normesCertificat 
                          ? (inspection.normesUrl || inspection.pdfUrl
                              ? inspection.normesCertificat.replace(/(EN\s*\d+(?::\d{4})?(?:\s*\+\s*[A-Z]\d+(?::\d{4})?)?)/gi, (match: string) => {
                                  const url = inspection.normesUrl || inspection.pdfUrl;
                                  return `<a href="/api/inspection-pdf?url=${encodeURIComponent(url)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF des normes">${match}</a>`;
                                })
                              : inspection.normesCertificat)
                          : '/' 
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Documents Référence:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-bold">{inspection.documentsReference || '/'}</span>
                      {inspection.pdfUrl && (
                        <button
                          onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(inspection.pdfUrl)}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          Voir Notice
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Consommation:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.consommation || '/'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Attribution:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.attribution || '/'}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Commentaire:</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.commentaire || '/'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Vie de l'équipement */}
            <div className="lg:col-span-3 space-y-1">
              <h2 className="text-sm font-bold text-gray-900">
                Vie de l'équipement
              </h2>
              <div className="bg-white p-6 print:border-0 print:shadow-none">
                
                {/* 1. ANTECEDENT DU PRODUIT */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-gray-900">
                    1. ANTECEDENT DU PRODUIT
                  </h2>
                  <div className="text-xs text-gray-600">
                    Mise en service le {formatDate(inspection.antecedentProduit?.miseEnService) || formatDate(inspection.dateMiseEnService)}
                  </div>
                </div>
                {isHarness() && inspection.antecedentProduit?.comment && (
                  <div className="text-xs text-blue-600 italic ml-4 mb-2">
                    Commentaire: {inspection.antecedentProduit.comment}
                  </div>
                )}

                {/* Points d'inspection */}
                <div className="space-y-1">
                  
                  {/* Observations Préalables */}
                  <div className="border-b border-gray-200 pb-2">
                    <div className={isHarness() ? "grid grid-cols-[40%_60%] gap-2" : "grid grid-cols-[45%_55%] gap-2"}>
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-900">
                          2. OBSERVATIONS PREALABLES
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <li><span className="text-xs text-gray-700 flex-1">Référence Interne marquée et lisible</span></li>
                            <StatusIndicator status={inspection.observationsPrelables?.referenceInterneMarquee?.status || 'V'} />
                          </div>
                          {inspection.observationsPrelables?.referenceInterneMarquee?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4">
                              Commentaire: {inspection.observationsPrelables.referenceInterneMarquee.comment}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText(isMousqueton() ? "Numéro de série lisible, ainsi que la norme" : "Lisibilité Numéro de série, de la norme", "observationsPrelables.lisibiliteNumeroSerie")}</span></li>
                            <StatusIndicator status={inspection.observationsPrelables?.lisibiliteNumeroSerie?.status || 'V'} />
                          </div>
                          {inspection.observationsPrelables?.lisibiliteNumeroSerie?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4">
                              Commentaire: {inspection.observationsPrelables.lisibiliteNumeroSerie.comment}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <li><span className="text-xs text-gray-700 flex-1">Durée de vie n'est pas dépassée</span></li>
                            <StatusIndicator status={inspection.observationsPrelables?.dureeVieNonDepassee?.status || 'V'} />
                          </div>
                          {inspection.observationsPrelables?.dureeVieNonDepassee?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4">
                              Commentaire: {inspection.observationsPrelables.dureeVieNonDepassee.comment}
                            </div>
                          )}
                          {isMousqueton() && (
                            <>
                              <div className="flex items-center justify-between gap-2">
                                <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Comparez avec un appareil neuf l'absence de modification ou perte d'un élément", "observationsPrelables.comparaisonAppareilNeuf")}</span></li>
                                <StatusIndicator status={inspection.observationsPrelables?.comparaisonAppareilNeuf?.status || 'V'} />
                              </div>
                              {inspection.observationsPrelables?.comparaisonAppareilNeuf?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4">
                                  Commentaire: {inspection.observationsPrelables.comparaisonAppareilNeuf.comment}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Affichage conditionnel selon le type d'équipement */}
                  {isHarness() ? (
                    <>
                      {/* 3. ETAT DES SANGLES DE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-gray-900 mb-2">
                            3. ETAT DES SANGLES DE
                          </div>
                          
                          {/* Ceinture / cuisse / bretelles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Ceinture / cuisse / liaison cuisse ceinture et bretelles / zones cachées par boucles et points d'attaches</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Coupure/Gonflement/Usure Dommage dus à l'utilisation, à des traces de salissures, à la chaleur; aux UV, aux produits...", "etatSangles.ceintureCuisseBretelles")}</span>
                                  <StatusIndicator status={inspection.etatSangles?.ceintureCuisseBretelles?.status || 'V'} />
                                </div>
                                {inspection.etatSangles?.ceintureCuisseBretelles?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatSangles.ceintureCuisseBretelles.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Etat coutures sécurité */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Etat coutures sécurité (dessus/dessous): Fil couleur différente</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Fil distendu, usé ou coupé...", "etatSangles.etatCouturesSecurite")}</span>
                                  <StatusIndicator status={inspection.etatSangles?.etatCouturesSecurite?.status || 'V'} />
                                </div>
                                {inspection.etatSangles?.etatCouturesSecurite?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatSangles.etatCouturesSecurite.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Présence des ourlets */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Présence des ourlets en bout de sangle</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Présence des ourlets</span>
                                <StatusIndicator status={inspection.etatSangles?.presenceOurlets?.status || 'V'} />
                              </div>
                              {inspection.etatSangles?.presenceOurlets?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.etatSangles.presenceOurlets.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. POINTS D'ATTACHE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900">
                              4. POINTS D'ATTACHE  - Métalliques:
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Usure/Déformation/Corrosion...", "pointsAttache.metalliques")}</span>
                                  <StatusIndicator status={inspection.pointsAttache?.metalliques?.status || 'V'} />
                                </div>
                                {inspection.pointsAttache?.metalliques?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.pointsAttache.metalliques.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Textiles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Textiles:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Coupure/Usure/Déchirement.", "pointsAttache.textiles")}</span>
                                  <StatusIndicator status={inspection.pointsAttache?.textiles?.status || 'V'} />
                                </div>
                                {inspection.pointsAttache?.textiles?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.pointsAttache.textiles.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Plastiques */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Plastiques:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Coupure/Usure/Déchirement...", "pointsAttache.plastiques")}</span>
                                  <StatusIndicator status={inspection.pointsAttache?.plastiques?.status || 'V'} />
                                </div>
                                {inspection.pointsAttache?.plastiques?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.pointsAttache.plastiques.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Indicateur arrêt de chute */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Si indicateur arrêt de chute apparait</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Oui - Non", "pointsAttache.indicateurArretChute")}</span>
                                <StatusIndicator status={inspection.pointsAttache?.indicateurArretChute?.status || 'V'} />
                              </div>
                              {inspection.pointsAttache?.indicateurArretChute?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.pointsAttache.indicateurArretChute.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. ETAT BOUCLES DE REGLAGES */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Grand titre avec Marque/Fissure/Usure/Déformation/Corrosion... */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900">
                              5. ETAT BOUCLES DE REGLAGES
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Usure/Déformation/Corrosion...", "etatBouclesReglages.fonctionnementBoucles")}</span>
                                  <StatusIndicator status={inspection.etatBouclesReglages?.fonctionnementBoucles?.status || 'V'} />
                                </div>
                                {inspection.etatBouclesReglages?.fonctionnementBoucles?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatBouclesReglages.fonctionnementBoucles.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Passage de sangles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Passage de sangles (pas de vrille)</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Passage de sangles</span>
                                <StatusIndicator status={inspection.etatBouclesReglages?.passageSangles?.status || 'V'} />
                              </div>
                              {inspection.etatBouclesReglages?.passageSangles?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.etatBouclesReglages.passageSangles.comment}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Fonctionnement des boucles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Fonctionnement des boucles</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Fonctionnement des boucles</span>
                                <StatusIndicator status={inspection.etatBouclesReglages?.fonctionnementBoucles?.status || 'V'} />
                              </div>
                              {inspection.etatBouclesReglages?.fonctionnementBoucles?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.etatBouclesReglages.fonctionnementBoucles.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. ETAT ELEMENTS DE CONFORT */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Grand titre avec Mousses */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-[10px] font-bold text-gray-900">
                              6. ETAT ELEMENTS DE CONFORT - Mousses (ceinture; cuisses, bretelles):
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-gray-700 flex-1">{renderCrossedOutText("Coupure / Déchirement / Usure…", "etatElementsConfort.mousses")}</span>
                                  <StatusIndicator status={inspection.etatElementsConfort?.mousses?.status || 'V'} />
                                </div>
                                {inspection.etatElementsConfort?.mousses?.comment && (
                                  <div className="text-[9px] text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatElementsConfort.mousses.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Passants élastiques ou plastiques */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-[10px] text-gray-700 ml-2">- Passants élastiques ou plastiques:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-gray-700 flex-1">{renderCrossedOutText("Coupure/Déchirement/Usure...", "etatElementsConfort.passantsElastiques")}</span>
                                  <StatusIndicator status={inspection.etatElementsConfort?.passantsElastiques?.status || 'V'} />
                                </div>
                                {inspection.etatElementsConfort?.passantsElastiques?.comment && (
                                  <div className="text-[9px] text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatElementsConfort.passantsElastiques.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Elastiques de cuisses */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-[10px] text-gray-700 ml-2">- Elastiques de cuisses:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-gray-700 flex-1">{renderCrossedOutText("Coupure/Déchirement/Usure...", "etatElementsConfort.elastiquesCuisses")}</span>
                                  <StatusIndicator status={inspection.etatElementsConfort?.elastiquesCuisses?.status || 'V'} />
                                </div>
                                {inspection.etatElementsConfort?.elastiquesCuisses?.comment && (
                                  <div className="text-[9px] text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatElementsConfort.elastiquesCuisses.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Portes matériels */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-[10px] text-gray-700 ml-2">- Portes matériels:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-gray-700 flex-1">{renderCrossedOutText("Coupure/Déchirement/Usure...", "etatElementsConfort.portesMateriels")}</span>
                                  <StatusIndicator status={inspection.etatElementsConfort?.portesMateriels?.status || 'V'} />
                                </div>
                                {inspection.etatElementsConfort?.portesMateriels?.comment && (
                                  <div className="text-[9px] text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatElementsConfort.portesMateriels.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. ETAT CONNECTEUR TORSE / CUISSARD */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Grand titre avec Corps du mousqueton */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900">
                              7. ETAT CONNECTEUR TORSE / CUISSARD (si il y a) - Corps du mousqueton (connecteur):
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Usure/Déformation/Corrosion...", "etatConnecteurTorseCuissard.corpsMousqueton")}</span>
                                  <StatusIndicator status={inspection.etatConnecteurTorseCuissard?.corpsMousqueton?.status || 'NA'} />
                                </div>
                                {inspection.etatConnecteurTorseCuissard?.corpsMousqueton?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatConnecteurTorseCuissard.corpsMousqueton.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Doigt du mousqueton */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Doigt du mousqueton (connecteur):</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Usure / Déformation/Fissure/Corrosion/Propreté des liaisons doigt; corps/Etat du rivet/ Ouverture manuelle complète/ Fermeture automatique du doigt; efficacité ressort de rappel...", "etatConnecteurTorseCuissard.doigtMousqueton")}</span>
                                  <StatusIndicator status={inspection.etatConnecteurTorseCuissard?.doigtMousqueton?.status || 'NA'} />
                                </div>
                                {inspection.etatConnecteurTorseCuissard?.doigtMousqueton?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatConnecteurTorseCuissard.doigtMousqueton.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bague de verrouillage */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Bague de verrouillage:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Déformation/Fissure/Usure/Verrouillage - Déverrouillage manuel ou automatique...", "etatConnecteurTorseCuissard.bagueVerrouillage")}</span>
                                  <StatusIndicator status={inspection.etatConnecteurTorseCuissard?.bagueVerrouillage?.status || 'NA'} />
                                </div>
                                {inspection.etatConnecteurTorseCuissard?.bagueVerrouillage?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.etatConnecteurTorseCuissard.bagueVerrouillage.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 8. BLOQUEUR CROLL */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Grand titre avec Corps et ses trous de connexion */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900">
                              8. BLOQUEUR CROLL - Corps et ses trous de connexion:
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Déformation/Usure/Corrosion/...", "bloqueurCroll.corpsTrousConnexion")}</span>
                                  <StatusIndicator status={inspection.bloqueurCroll?.corpsTrousConnexion?.status || 'V'} />
                                </div>
                                {inspection.bloqueurCroll?.corpsTrousConnexion?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.bloqueurCroll.corpsTrousConnexion.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Gachette */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Gachette:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Déformation/Usure/Corrosion/ Présence de toutes les dents/Propreté de toutes les dents / Axe de la gâchette et du rivet (jeu, marque, déformation, fissure, usure, corrosion) / Rotation et ressort de rappel de la gâchette ...", "bloqueurCroll.gachette")}</span>
                                  <StatusIndicator status={inspection.bloqueurCroll?.gachette?.status || 'V'} />
                                </div>
                                {inspection.bloqueurCroll?.gachette?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.bloqueurCroll.gachette.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Taquet de sécurité */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Taquet de sécurité</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Déformation/Fissure/Usure/Corrosion Blocage taquet fonctionnement...", "bloqueurCroll.taquetSecurite")}</span>
                                  <StatusIndicator status={inspection.bloqueurCroll?.taquetSecurite?.status || 'V'} />
                                </div>
                                {inspection.bloqueurCroll?.taquetSecurite?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.bloqueurCroll.taquetSecurite.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Fonctionnel */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Fonctionnel:</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Coulisse le long de la corde dans un sens, bloque dans l'autre</span>
                                <StatusIndicator status={inspection.bloqueurCroll?.fonctionnel?.status || 'V'} />
                              </div>
                              {inspection.bloqueurCroll?.fonctionnel?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.bloqueurCroll.fonctionnel.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : isMousqueton() ? (
                    <>
                      {/* 3. VERIFICATION CORPS */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Marque/Fissure/Déformation/Corrosion */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900 mb-1">
                              3. VERIFICATION CORPS : – Doit être démonté de tout appareil pouvant masquer une partie du corps :
                            </div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Fissure / Déformation / Corrosion", "verificationCorps.marqueFissure")}</span>
                                  <StatusIndicator status={inspection.verificationCorps?.marqueFissure?.status || 'V'} />
                                </div>
                                {inspection.verificationCorps?.marqueFissure?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationCorps.marqueFissure.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Vérifier l'usure provoquée par le passage de la corde */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier l'usure provoquée par le passage de la corde ou l'appui sur les ancrages:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Profondeur des marques - une usure de plus d'un mm de profondeur / Apparition d'arêtes tranchantes", "verificationCorps.usureCordeAncrages")}</span>
                                  <StatusIndicator status={inspection.verificationCorps?.usureCordeAncrages?.status || 'V'} />
                                </div>
                                {inspection.verificationCorps?.usureCordeAncrages?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationCorps.usureCordeAncrages.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Etat du bec */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier l'état du bec:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marques, Usure, Fissures, Déformation,...", "verificationCorps.etatBec")}</span>
                                  <StatusIndicator status={inspection.verificationCorps?.etatBec?.status || 'V'} />
                                </div>
                                {inspection.verificationCorps?.etatBec?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationCorps.etatBec.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. VERIFICATION DU DOIGT */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Marque/Usure */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900 ml-2">4. VERIFICATION DU DOIGT: - État:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Usure / Fissure / Déformation / Corrosion...", "verificationDoigt.marqueUsure")}</span>
                                  <StatusIndicator status={inspection.verificationDoigt?.marqueUsure?.status || 'V'} />
                                </div>
                                {inspection.verificationDoigt?.marqueUsure?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationDoigt.marqueUsure.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Propreté */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier propreté des parties ayant un mouvement à effectuer:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">Propreté des liaisons doigt/corps...</span>
                                  <StatusIndicator status={inspection.verificationDoigt?.proprete?.status || 'V'} />
                                </div>
                                {inspection.verificationDoigt?.proprete?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationDoigt.proprete.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Etat du rivet */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier l'état du rivet:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("craquelure / Déformation / Corrosion / Jeu...", "verificationDoigt.etatRivet")}</span>
                                  <StatusIndicator status={inspection.verificationDoigt?.etatRivet?.status || 'V'} />
                                </div>
                                {inspection.verificationDoigt?.etatRivet?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationDoigt.etatRivet.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Ouverture manuelle */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier l'ouverture manuelle complète du doigt:</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Ouverture manuelle complète</span>
                                <StatusIndicator status={inspection.verificationDoigt?.ouvertureManuelle?.status || 'V'} />
                              </div>
                              {inspection.verificationDoigt?.ouvertureManuelle?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.verificationDoigt.ouvertureManuelle.comment}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Fermeture automatique */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier fermeture automatique du doigt, l'efficacité du ressort de rappel et l'alignement doigt/bec:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">Efficacité ressort de rappel...</span>
                                  <StatusIndicator status={inspection.verificationDoigt?.fermetureAutomatique?.status || 'V'} />
                                </div>
                                {inspection.verificationDoigt?.fermetureAutomatique?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationDoigt.fermetureAutomatique.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. VERIFICATION DE LA BAGUE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="space-y-2">
                          {/* Marque/Usure */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs font-bold text-gray-900 ml-2">5. VERIFICATION DE LA BAGUE: - État:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Usure / Fissure / Déformation / Corrosion / Jeu...", "verificationBague.marqueUsure")}</span>
                                  <StatusIndicator status={inspection.verificationBague?.marqueUsure?.status || 'V'} />
                                </div>
                                {inspection.verificationBague?.marqueUsure?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationBague.marqueUsure.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Déverrouillage */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Bague automatique : - Vérifier le bon fonctionnement du système de déverrouillage de la bague, selon le mode d'ouverture:</div>
                            <div className="space-y-1">
                              <div className="bg-gray-100 p-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-700 flex-1">Déverrouillage manuel ou automatique...</span>
                                  <StatusIndicator status={inspection.verificationBague?.deverrouillage?.status || 'V'} />
                                </div>
                                {inspection.verificationBague?.deverrouillage?.comment && (
                                  <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                    Commentaire: {inspection.verificationBague.deverrouillage.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Verrouillage automatique */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-xs text-gray-700 ml-2">- Vérifier le verrouillage automatique lorsque vous relâcher la bague ; Si nécessaire nettoyer:</div>
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Verrouillage automatique</span>
                                <StatusIndicator status={inspection.verificationBague?.verrouillageAutomatique?.status || 'V'} />
                              </div>
                              {inspection.verificationBague?.verrouillageAutomatique?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.verificationBague.verrouillageAutomatique.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 3. CALOTTE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            3. CALOTTE (Coque): - Extérieur- Intérieur
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Impact/Fissure/déformation/Trace de salissure / Rayure/Brûlure/ Trace de produits chimique/Usure...", "calotteExterieurInterieur.marqueFissureDeformation")}</span>
                                <StatusIndicator status={inspection.calotteExterieurInterieur?.marqueFissureDeformation?.status || 'V'} />
                              </div>
                              {inspection.calotteExterieurInterieur?.marqueFissureDeformation?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.calotteExterieurInterieur.marqueFissureDeformation.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* -Fentes et trous accessoires */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            -Fentes et trous accessoires
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Déformation/Fissure/Impact ...", "calotteExterieurInterieur.fentesTrousAccessoires")}</span>
                                <StatusIndicator status={inspection.calotteExterieurInterieur?.fentesTrousAccessoires?.status || 'V'} />
                              </div>
                              {inspection.calotteExterieurInterieur?.fentesTrousAccessoires?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.calotteExterieurInterieur.fentesTrousAccessoires.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* -Volets aération */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            -Volets aération si il y a, (fonctionnement)
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Volets aération si il y a, (fonctionnement)</span>
                                <StatusIndicator status={inspection.calotteExterieurInterieur?.voletsAeration?.status || 'NA'} />
                              </div>
                              {inspection.calotteExterieurInterieur?.voletsAeration?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.calotteExterieurInterieur.voletsAeration.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. CALOTIN */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            4. CALOTIN (si il y a): - Ôtez éléments de confort si nécessaire; Ne pas démonté calotin si fixé sur la coque.
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Déformation/Usure ...", "calotin.otezElementsConfort")}</span>
                                <StatusIndicator status={inspection.calotin?.otezElementsConfort?.status || 'NA'} />
                              </div>
                              {inspection.calotin?.otezElementsConfort?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.calotin.otezElementsConfort.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. COIFFE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            5. COIFFE:- Etat des sangles et de leurs fixation dans la calotte.
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Coupure/Brûlure/Déformation ...", "coiffe.etatSanglesFixation")}</span>
                                <StatusIndicator status={inspection.coiffe?.etatSanglesFixation?.status || 'V'} />
                              </div>
                              {inspection.coiffe?.etatSanglesFixation?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.coiffe.etatSanglesFixation.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. TOUR DE TETE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            6. TOUR DE TETE
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Elément manquant/Fixation ...", "tourDeTete.usureDeformationElement")}</span>
                                <StatusIndicator status={inspection.tourDeTete?.usureDeformationElement?.status || 'V'} />
                              </div>
                              {inspection.tourDeTete?.usureDeformationElement?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.tourDeTete.usureDeformationElement.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. SYSTEME DE REGLAGE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            7. SYSTEME DE REGLAGE: - Etat, fixations; actionner système dans les deux sens; Tirez sur système pour voir si il se dérègle ou pas
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Elément manquant/Fixation ...", "systemeReglage.etatFixations")}</span>
                                <StatusIndicator status={inspection.systemeReglage?.etatFixations?.status || 'V'} />
                              </div>
                              {inspection.systemeReglage?.etatFixations?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.systemeReglage.etatFixations.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 8. JUGULAIRE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            8. JUGULAIRE: - Etat sangles et éléments de réglage (inspecter les parties cachées également)
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Coupure/Brûlure/Déformation ...", "jugulaire.etatSanglesElements")}</span>
                                <StatusIndicator status={inspection.jugulaire?.etatSanglesElements?.status || 'V'} />
                              </div>
                              {inspection.jugulaire?.etatSanglesElements?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.jugulaire.etatSanglesElements.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. JUGULAIRE - Boucle de fermeture */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            - Etat de la boucle de fermeture jugulaire
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Casse / Déformation / Fissure / Usure", "jugulaire.etatBoucleFermeture")}</span>
                                <StatusIndicator status={inspection.jugulaire?.etatBoucleFermeture?.status || 'V'} />
                              </div>
                              {inspection.jugulaire?.etatBoucleFermeture?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.jugulaire.etatBoucleFermeture.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. MOUSSE DE CONFORT */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            9. MOUSSE DE CONFORT: Démonter pour laver ou remplacer quand c'est nécessaire
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Usure/Déformation/Casse ...</span>
                                <StatusIndicator status={inspection.mousseConfort?.usureDeformationCasse?.status || 'V'} />
                              </div>
                              {inspection.mousseConfort?.usureDeformationCasse?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.mousseConfort.usureDeformationCasse.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 10. CROCHETS DE LAMPE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            10. CROCHETS DE LAMPE
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Casse/Elément manquant ...", "crochetsLampe.usureDeformationCasse")}</span>
                                <StatusIndicator status={inspection.crochetsLampe?.usureDeformationCasse?.status || 'V'} />
                              </div>
                              {inspection.crochetsLampe?.usureDeformationCasse?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.crochetsLampe.usureDeformationCasse.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 11. ACCESSOIRES */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            11. ACCESSOIRES: Visière, lampe
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-100 p-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-700 flex-1">Fonctionnement/Etat ...</span>
                                <StatusIndicator status={inspection.accessoires?.fonctionnementEtat?.status || 'NA'} />
                              </div>
                              {inspection.accessoires?.fonctionnementEtat?.comment && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {inspection.accessoires.fonctionnementEtat.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                {/* Signature */}
                <div className="pt-4 bg-gray-100 p-2 mt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-4">Signature Vérificateur / signature</div>
                    
                    {/* Certificat de contrôleur (PDF) */}
                    <div className="border-2 border-gray-300 rounded-lg p-8 h-24 flex items-center justify-center">
                      {getCurrentCertificate() ? (
                        <div className="text-center">
                          <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <button
                            onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(getCurrentCertificate()!)}`, '_blank')}
                            className="text-orange-600 hover:text-orange-800 underline text-xs"
                          >
                            Certificat de controleur
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">Certificat de controleur</div>
                      )}
                    </div>
                    
                    {/* Signature digitale */}
                    {getCurrentDigitalSignature() && (
                      <div className="border-2 border-gray-300 rounded-lg p-8 h-32 flex items-center justify-center mt-4">
                        <img 
                          src={getCurrentDigitalSignature()!} 
                          alt="Signature digitale" 
                          className="max-w-full max-h-24 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

