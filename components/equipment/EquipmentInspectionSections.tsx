import React from 'react';
import { equipmentConfig } from '@/config/equipment-types';

interface EquipmentInspectionSectionsProps {
  selectedType: string;
  formData: any;
  setFormData: (data: any) => void;
}

export default function EquipmentInspectionSections({
  selectedType,
  formData,
  setFormData,
}: EquipmentInspectionSectionsProps) {
  const config = equipmentConfig[selectedType];

  if (!config) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-sm text-yellow-700">
          Configuration non trouvée pour le type d'équipement: {selectedType}
        </p>
      </div>
    );
  }

  const handleStatusChange = (field: string, status: 'V' | 'NA' | 'X') => {
    const [section, subsection] = field.split('.');
    setFormData((prev: any) => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [section]: {
          ...prev.inspectionData[section],
          [subsection]: {
            ...prev.inspectionData[section]?.[subsection],
            status,
          },
        },
      },
    }));
  };

  const handleCommentChange = (field: string, comment: string) => {
    const [section, subsection] = field.split('.');
    setFormData((prev: any) => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [section]: {
          ...prev.inspectionData[section],
          [subsection]: {
            ...prev.inspectionData[section]?.[subsection],
            comment,
          },
        },
      },
    }));
  };

  const StatusIndicator = ({ field, currentStatus }: { field: string; currentStatus: 'V' | 'NA' | 'X' }) => {
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => handleStatusChange(field, 'V')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            currentStatus === 'V'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          V
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange(field, 'NA')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            currentStatus === 'NA'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          NA
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange(field, 'X')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            currentStatus === 'X'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          X
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Vie de l'équipement - {selectedType}
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
              value={formData.inspectionData.antecedentProduit?.miseEnService || ''}
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
                }));
              }}
              className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sections dynamiques selon le type */}
        {config.sections.map((section) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.subsections.map((subsection) => {
                const [sectionKey, subsectionKey] = subsection.field.split('.');
                const currentData = formData.inspectionData[sectionKey]?.[subsectionKey] || {
                  status: subsection.defaultStatus,
                  comment: '',
                };

                return (
                  <div key={subsection.id} className="border border-gray-200 rounded p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-sm text-gray-700">
                          {subsection.label}
                        </label>
                      </div>
                      <StatusIndicator
                        field={subsection.field}
                        currentStatus={currentData.status}
                      />
                    </div>
                    
                    {/* Commentaire optionnel */}
                    <div className="mt-2">
                      <textarea
                        value={currentData.comment || ''}
                        onChange={(e) => handleCommentChange(subsection.field, e.target.value)}
                        placeholder="Commentaire (optionnel)"
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
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

