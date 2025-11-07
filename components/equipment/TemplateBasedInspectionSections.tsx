import React from 'react';

interface Subsection {
  id: string;
  label: string;
  hasStatus: boolean;
  hasComment: boolean;
  crossableWords: string[];
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
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
}

export default function TemplateBasedInspectionSections({
  template,
  formData,
  setFormData,
}: TemplateBasedInspectionSectionsProps) {
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
        {sections.map((section) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.subsections.map((subsection) => {
                const currentData = formData.inspectionData[section.id]?.[subsection.id] || {
                  status: 'V',
                  comment: '',
                  crossedWords: {},
                };

                return (
                  <div key={subsection.id} className="border border-gray-200 rounded p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-sm text-gray-700">
                          {renderCrossableText(
                            subsection.label,
                            section.id,
                            subsection.id,
                            subsection.crossableWords
                          )}
                        </label>
                      </div>
                      {subsection.hasStatus && (
                        <StatusIndicator
                          sectionId={section.id}
                          subsectionId={subsection.id}
                          currentStatus={currentData.status || 'V'}
                        />
                      )}
                    </div>
                    
                    {/* Commentaire optionnel */}
                    {subsection.hasComment && (
                      <div className="mt-2">
                        <textarea
                          value={currentData.comment || ''}
                          onChange={(e) => handleCommentChange(section.id, subsection.id, e.target.value)}
                          placeholder="Commentaire (optionnel)"
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Info sur les mots barrables */}
                    {subsection.crossableWords.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        💡 Cliquez sur les mots pour les barrer: {subsection.crossableWords.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Signature Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Signature
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificat de contrôleur (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  // Handle PDF upload
                  console.log('PDF uploaded:', e.target.files);
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature digitale (Image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  // Handle signature upload
                  console.log('Signature uploaded:', e.target.files);
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

