import React, { useRef, useState } from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';
import SignaturePad from '@/components/SignaturePad';
import CommentInput from '@/components/CommentInput';

interface Subsection {
  id: string;
  label: string;
  hasStatus: boolean;
  hasComment: boolean;
  crossableWords: string[];
  isSubtitle?: boolean;
  hasGrayBackground?: boolean;
  isListItem?: boolean;
  showStatusButton?: boolean;
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
  useGridLayout?: boolean;
}

interface Template {
  id: string;
  name: string;
  structure: {
    sections: Section[];
  };
}

interface TemplateBasedInspectionSectionsProps {
  template: Template | null;
  formData: any;
  setFormData: (data: any) => void;
  onSignatureUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingSignature?: boolean;
}

export default function TemplateBasedInspectionSections({
  template,
  formData,
  setFormData,
  onSignatureUpload,
  isUploadingSignature = false,
}: TemplateBasedInspectionSectionsProps) {
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [openCommentFields, setOpenCommentFields] = useState<{[key: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour gérer la signature digitale
  const handleDigitalSignature = (signature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      verificateurDigitalSignature: signature,
    }));
    setShowSignatureModal(false);
  };
  // Initialiser les données d'inspection si nécessaire
  // IMPORTANT: Tous les hooks doivent être appelés avant tout return conditionnel
  React.useEffect(() => {
    if (!template || !template.structure?.sections) return;

    const initialData: any = {
      antecedentProduit: {
        miseEnService: formData.dateMiseEnService || '',
        comment: '',
      },
    };

    template.structure.sections.forEach((section) => {
      section.subsections.forEach((subsection) => {
        if (!formData.inspectionData[section.id]?.[subsection.id]) {
          if (!initialData[section.id]) {
            initialData[section.id] = {};
          }
          initialData[section.id][subsection.id] = {
            status: subsection.hasStatus ? 'V' : undefined,
            comment: subsection.hasComment ? '' : undefined,
            crossedWords: {},
          };
        }
      });
    });

    // Ne mettre à jour que si nécessaire
    const needsUpdate = Object.keys(initialData).some(key => {
      if (key === 'antecedentProduit') {
        return !formData.inspectionData.antecedentProduit;
      }
      return template.structure.sections.some((section: any) => 
        section.id === key && !formData.inspectionData[key]
      );
    });

    if (needsUpdate) {
      setFormData((prev: any) => ({
        ...prev,
        inspectionData: {
          ...prev.inspectionData,
          ...initialData,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]); // Seulement quand le template change

  if (!template || !template.structure?.sections) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-sm text-yellow-700">
          Aucun template sélectionné. Veuillez sélectionner un template.
        </p>
      </div>
    );
  }

  const sections = template.structure.sections;

  const handleStatusChange = (sectionId: string, subsectionId: string, status: 'V' | 'NA' | 'X') => {
    setFormData((prev: any) => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [sectionId]: {
          ...prev.inspectionData[sectionId],
          [subsectionId]: {
            ...prev.inspectionData[sectionId]?.[subsectionId],
            status,
          },
        },
      },
    }));
  };

  const handleCommentChange = (sectionId: string, subsectionId: string, comment: string) => {
    setFormData((prev: any) => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [sectionId]: {
          ...prev.inspectionData[sectionId],
          [subsectionId]: {
            ...prev.inspectionData[sectionId]?.[subsectionId],
            comment,
          },
        },
      },
    }));
  };

  // Fonction pour ouvrir/fermer l'input de commentaire
  const toggleCommentInput = (key: string) => {
    const isOpening = !openCommentFields[key];

    setOpenCommentFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Si l'input s'ouvre, initialiser avec le commentaire existant s'il y en a un
    if (isOpening) {
      const [sectionId, subsectionId] = key.split('.');
      const sectionData = formData.inspectionData[sectionId];
      const currentComment = sectionData?.[subsectionId]?.comment || '';
      setCommentInputs(prev => ({
        ...prev,
        [key]: currentComment
      }));
    }
  };

  // Fonction pour enregistrer le commentaire
  const saveComment = (key: string, sectionId: string, subsectionId: string) => {
    const comment = commentInputs[key] || '';

    const sectionData = formData.inspectionData[sectionId];
    const fieldData = sectionData?.[subsectionId];
    const currentStatus = fieldData?.status || 'V';

    handleCommentChange(sectionId, subsectionId, comment);

    setOpenCommentFields(prev => ({
      ...prev,
      [key]: false
    }));
  };

  const handleWordClick = (sectionId: string, subsectionId: string, word: string) => {
    setFormData((prev: any) => {
      const currentData = prev.inspectionData[sectionId]?.[subsectionId] || {};
      const crossedWords = currentData.crossedWords || {};
      
      return {
        ...prev,
        inspectionData: {
          ...prev.inspectionData,
          [sectionId]: {
            ...prev.inspectionData[sectionId],
            [subsectionId]: {
              ...currentData,
              crossedWords: {
                ...crossedWords,
                [word]: !crossedWords[word],
              },
            },
          },
        },
      };
    });
  };

  const StatusIndicator = ({ sectionId, subsectionId, currentStatus }: { sectionId: string; subsectionId: string; currentStatus: 'V' | 'NA' | 'X' | undefined }) => {
    const status = currentStatus || 'V'; // Par défaut 'V' si non défini
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => handleStatusChange(sectionId, subsectionId, 'V')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            status === 'V'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          V
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange(sectionId, subsectionId, 'NA')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            status === 'NA'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          NA
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange(sectionId, subsectionId, 'X')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            status === 'X'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          X
        </button>
      </div>
    );
  };

  const renderCrossableText = (text: string, sectionId: string, subsectionId: string, crossableWords: string[]) => {
    if (crossableWords.length === 0) {
      return <span>{text}</span>;
    }

    const currentData = formData.inspectionData[sectionId]?.[subsectionId] || {};
    const crossedWords = currentData.crossedWords || {};

    // Diviser le texte en mots
    const words = text.split(/(\s+|\/|\(|\)|-|\.)/);

    return (
      <span>
        {words.map((word, index) => {
          const trimmedWord = word.trim();
          const isCrossable = crossableWords.includes(trimmedWord);
          const isCrossed = isCrossable && crossedWords[trimmedWord];

          if (!isCrossable || /^\s+$/.test(word) || /^[\/\(\)\-\.]+$/.test(word)) {
            return <span key={index}>{word}</span>;
          }

          return (
            <span
              key={index}
              onClick={() => handleWordClick(sectionId, subsectionId, trimmedWord)}
              className={`cursor-pointer ${isCrossed ? 'line-through text-red-600' : 'hover:bg-yellow-100'}`}
              title={isCrossed ? 'Cliquer pour désactiver' : 'Cliquer pour barrer'}
            >
              {word}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Vie de l'équipement - {template.name}
        </h2>

        {/* Section 1: ANTECEDENT DU PRODUIT */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            1. ANTECEDENT DU PRODUIT
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mise en service le
            </label>
            <input
              type="date"
              value={formData.inspectionData.antecedentProduit?.miseEnService || formData.dateMiseEnService || ''}
              onChange={(e) => {
                setFormData((prev: any) => ({
                  ...prev,
                  inspectionData: {
                    ...prev.inspectionData,
                    antecedentProduit: {
                      ...prev.inspectionData.antecedentProduit,
                      miseEnService: e.target.value,
                    },
                  },
                  dateMiseEnService: e.target.value,
                }));
              }}
              className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sections dynamiques depuis le template */}
        {sections.map((section) => {
          const useGrid = section.useGridLayout || false;
          
          return (
            <div key={section.id} className="border-b border-gray-200 pb-4 mb-4">
              {useGrid ? (
                <div className="grid grid-cols-[40%_60%] gap-2">
                  {/* Première colonne : Titre */}
                  <div className="text-sm font-medium text-gray-900">
                    {section.title}
                  </div>
                  
                  {/* Deuxième colonne : Éléments */}
                  <div className="space-y-2">
                    {section.subsections.map((subsection) => {
                      const currentData = formData.inspectionData[section.id]?.[subsection.id] || {
                        status: 'V',
                        comment: '',
                        crossedWords: {},
                      };

                      // Si c'est un sous-titre, l'afficher comme titre
                      if (subsection.isSubtitle) {
                        return (
                          <div key={subsection.id} className="border-b border-gray-200 pb-4 mb-4">
                            <div className="grid grid-cols-[40%_60%] gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {subsection.label || section.title}
                              </div>
                              <div className="space-y-2">
                                {/* Sous-sections suivantes jusqu'à la prochaine sous-section ou fin */}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const contentClass = subsection.hasGrayBackground ? 'bg-gray-100 p-1' : '';
                      const listTag = subsection.isListItem ? 'li' : 'div';

                      return (
                        <div key={subsection.id} className={`flex flex-col gap-1 ${contentClass}`}>
                          {listTag === 'li' ? (
                            <li className="list-none">
                              {subsection.label ? (
                                <span className="text-sm text-gray-700">
                                  {renderCrossableText(
                                    subsection.label,
                                    section.id,
                                    subsection.id,
                                    subsection.crossableWords
                                  )}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-700"></span>
                              )}
                            </li>
                          ) : (
                            <>
                              {subsection.label && (
                                <span className="text-sm text-gray-700">
                                  {renderCrossableText(
                                    subsection.label,
                                    section.id,
                                    subsection.id,
                                    subsection.crossableWords
                                  )}
                                </span>
                              )}
                            </>
                          )}
                          
                          <div className="flex items-center justify-end gap-2">
                            {subsection.hasComment && (
                              <button
                                type="button"
                                className="text-[10px] text-red-600 hover:underline"
                                onClick={() => toggleCommentInput(`${section.id}.${subsection.id}`)}
                              >
                                Ajouter commentaires
                              </button>
                            )}
                            {subsection.hasStatus && subsection.showStatusButton !== false && (
                              <StatusIndicator
                                sectionId={section.id}
                                subsectionId={subsection.id}
                                currentStatus={currentData.status || 'V'}
                              />
                            )}
                          </div>
                          
                          {/* Commentaire optionnel avec système d'ouverture/fermeture */}
                          {subsection.hasComment && (
                            <>
                              {openCommentFields[`${section.id}.${subsection.id}`] && (
                                <div className="mt-2 ml-4">
                                  <CommentInput
                                    value={commentInputs[`${section.id}.${subsection.id}`] || ''}
                                    onChange={(newValue) => setCommentInputs(prev => ({...prev, [`${section.id}.${subsection.id}`]: newValue}))}
                                    onSave={() => saveComment(`${section.id}.${subsection.id}`, section.id, subsection.id)}
                                    onCancel={() => toggleCommentInput(`${section.id}.${subsection.id}`)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Ajouter votre commentaire..."
                                    rows={2}
                                    autoFocus={true}
                                  />
                                </div>
                              )}
                              {currentData.comment && !openCommentFields[`${section.id}.${subsection.id}`] && (
                                <div className="text-xs text-blue-600 italic ml-4 mt-1">
                                  Commentaire: {currentData.comment}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.subsections.map((subsection) => {
                      const currentData = formData.inspectionData[section.id]?.[subsection.id] || {
                        status: 'V',
                        comment: '',
                        crossedWords: {},
                      };

                      const contentClass = subsection.hasGrayBackground ? 'bg-gray-100 p-1' : '';

                      return (
                        <div key={subsection.id} className={`border border-gray-200 rounded p-3 ${contentClass}`}>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1">
                              {subsection.isListItem ? (
                                <li className="list-none">
                                  <span className="text-sm text-gray-700">
                                    {subsection.label ? renderCrossableText(
                                      subsection.label,
                                      section.id,
                                      subsection.id,
                                      subsection.crossableWords
                                    ) : null}
                                  </span>
                                </li>
                              ) : (
                                <label className="text-sm text-gray-700">
                                  {subsection.label ? renderCrossableText(
                                    subsection.label,
                                    section.id,
                                    subsection.id,
                                    subsection.crossableWords
                                  ) : null}
                                </label>
                              )}
                            </div>
                            {subsection.hasStatus && subsection.showStatusButton !== false && (
                              <StatusIndicator
                                sectionId={section.id}
                                subsectionId={subsection.id}
                                currentStatus={currentData.status || 'V'}
                              />
                            )}
                          </div>
                          
                          {/* Commentaire optionnel avec système d'ouverture/fermeture */}
                          {subsection.hasComment && (
                            <>
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput(`${section.id}.${subsection.id}`)}
                                >
                                  Ajouter commentaires
                                </button>
                              </div>
                              {openCommentFields[`${section.id}.${subsection.id}`] && (
                                <div className="mt-2">
                                  <CommentInput
                                    value={commentInputs[`${section.id}.${subsection.id}`] || ''}
                                    onChange={(newValue) => setCommentInputs(prev => ({...prev, [`${section.id}.${subsection.id}`]: newValue}))}
                                    onSave={() => saveComment(`${section.id}.${subsection.id}`, section.id, subsection.id)}
                                    onCancel={() => toggleCommentInput(`${section.id}.${subsection.id}`)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Ajouter votre commentaire..."
                                    rows={2}
                                    autoFocus={true}
                                  />
                                </div>
                              )}
                              {currentData.comment && !openCommentFields[`${section.id}.${subsection.id}`] && (
                                <div className="text-xs text-blue-600 italic mt-1">
                                  Commentaire: {currentData.comment}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Section Signature */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Vérificateur / signature
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="verificateurNom" className="block text-sm font-medium text-gray-700">
                Nom du vérificateur
              </label>
              <input
                type="text"
                id="verificateurNom"
                name="verificateurNom"
                value={formData.verificateurNom || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="verificateurSignature" className="block text-sm font-medium text-gray-700">
                Signature
              </label>
              <div className="mt-1 flex space-x-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.verificateurSignaturePdf ? (
                    <div className="text-green-600 text-sm">
                      <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                      <div>Signature PDF uploadée</div>
                      <a 
                        href={formData.verificateurSignaturePdf} 
                        target="_blank" 
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Voir le PDF
                      </a>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                      <div>Zone de signature</div>
                    </div>
                  )}
                </div>
                {onSignatureUpload && (
                  <>
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={isUploadingSignature}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                        isUploadingSignature
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                      title="Uploader une signature PDF"
                    >
                      {isUploadingSignature ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <DocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={onSignatureUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              {onSignatureUpload && (
                <p className="mt-1 text-xs text-gray-500">
                  Uploader un PDF de signature
                </p>
              )}
            </div>
            <div>
              <label htmlFor="verificateurDigitalSignature" className="block text-sm font-medium text-gray-700">
                Signature digitale
              </label>
              <div className="mt-1 flex space-x-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.verificateurDigitalSignature ? (
                    <div className="text-green-600 text-sm">
                      <div className="text-gray-600">
                        <img src={formData.verificateurDigitalSignature} alt="Signature digitale" className="h-16 mx-auto object-contain" />
                        <div className="text-xs mt-2">Signature digitale enregistrée</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <div>Aucune signature digitale</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    title="Signature digitale"
                  >
                    ✍️ Signer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de signature digitale */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature digitale</h3>
            <p className="text-sm text-gray-600 mb-4">
              Signez ci-dessous avec votre curseur ou votre doigt
            </p>
            <SignaturePad
              onSave={handleDigitalSignature}
              initialValue={formData.verificateurDigitalSignature || ''}
              width={400}
              height={200}
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

