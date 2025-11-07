'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { equipmentConfig } from '@/config/equipment-types';
import EquipmentIdentification from '@/components/equipment/EquipmentIdentification';
import EquipmentInspectionSections from '@/components/equipment/EquipmentInspectionSections';
import TemplateBasedInspectionSections from '@/components/equipment/TemplateBasedInspectionSections';

interface Template {
  id: string;
  name: string;
  description: string;
  structure: any;
}

export default function CreateEquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  
  // Mode de sélection : 'template' ou 'config'
  const [selectionMode, setSelectionMode] = useState<'template' | 'config'>('template');
  
  // Si mode template : ID du template sélectionné
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Si mode config : type d'équipement depuis config
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get('type') || 'Harnais de Suspension'
  );

  // Types d'équipements disponibles (ancien système)
  const equipmentTypes = Object.keys(equipmentConfig);

  // Charger les templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/admin/equipment-templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          
          // Si un template est passé en paramètre URL
          const templateIdParam = searchParams.get('templateId');
          if (templateIdParam && data.length > 0) {
            const template = data.find((t: Template) => t.id === templateIdParam);
            if (template) {
              setSelectionMode('template');
              setSelectedTemplateId(templateIdParam);
              setSelectedTemplate(template);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status, searchParams]);

  const [formData, setFormData] = useState({
    // Identification équipement (commune à tous)
    referenceInterne: '',
    typeEquipement: '',
    numeroSerie: '',
    dateFabrication: '',
    dateAchat: '',
    dateMiseEnService: '',
    dateInspectionDetaillee: '',
    numeroKit: '',
    taille: '',
    longueur: '',
    normesCertificat: '',
    documentsReference: '',
    consommation: '',
    attribution: '',
    commentaire: '',
    photo: '',
    qrCode: '',
    pdfUrl: '',
    dateAchatImage: '',
    verificateurSignaturePdf: '',
    verificateurDigitalSignature: '',
    etat: 'INVALID',
    templateId: null as string | null,
    
    // Données d'inspection dynamiques selon le type
    inspectionData: {} as any,
  });

  // Initialiser les données d'inspection selon le mode sélectionné
  useEffect(() => {
    if (selectionMode === 'template' && selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        typeEquipement: selectedTemplate.name,
        templateId: selectedTemplate.id,
        inspectionData: {
          antecedentProduit: {
            miseEnService: prev.dateMiseEnService || '',
            comment: '',
          },
        },
      }));
    } else if (selectionMode === 'config' && equipmentConfig[selectedType]) {
      const config = equipmentConfig[selectedType];
      setFormData(prev => ({
        ...prev,
        typeEquipement: selectedType,
        templateId: null,
        inspectionData: config.defaultInspectionData,
      }));
    }
  }, [selectionMode, selectedTemplate, selectedType]);

  // Charger le template sélectionné
  useEffect(() => {
    if (selectionMode === 'template' && selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [selectedTemplateId, templates, selectionMode]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let body: any;

      if (selectionMode === 'template' && selectedTemplate) {
        // Mode template : préparer les données depuis le template
        body = {
          ...formData,
          // Template ID
          templateId: selectedTemplate.id,
        };

        // Toujours ajouter antecedentProduit (section 1 automatique)
        if (formData.inspectionData.antecedentProduit) {
          body.antecedentProduit = formData.inspectionData.antecedentProduit;
        }

        // Ajouter toutes les sections du template (y compris observationsPrelables si elle existe)
        selectedTemplate.structure.sections.forEach((section: any) => {
          const sectionData = formData.inspectionData[section.id];
          if (sectionData) {
            body[section.id] = sectionData;
          }
        });

        // Supprimer inspectionData du body (ne doit pas être envoyé directement)
        delete body.inspectionData;
      } else {
        // Mode config : utiliser l'ancien système
        const config = equipmentConfig[selectedType];
        body = config.prepareSubmitData(formData);
        // S'assurer que templateId n'est pas défini pour l'ancien système
        body.templateId = null;
      }

      const response = await fetch('/api/admin/equipment-detailed-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/equipment-detailed-inspections');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création de l\'inspection');
      }
    } catch (error) {
      setError('Erreur lors de la création de l\'inspection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Nouvelle Inspection d'Équipement
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Sélection du mode : Template ou Config */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Mode de création *
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="template"
                    checked={selectionMode === 'template'}
                    onChange={(e) => setSelectionMode('template')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    🆕 Utiliser un Template (Recommandé)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="config"
                    checked={selectionMode === 'config'}
                    onChange={(e) => setSelectionMode('config')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ancien système (Config)
                  </span>
                </label>
              </div>

              {selectionMode === 'template' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un Template *
                  </label>
                  {isLoadingTemplates ? (
                    <p className="text-sm text-gray-600">Chargement des templates...</p>
                  ) : templates.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                      <p className="text-sm text-yellow-700 mb-2">
                        Aucun template disponible. Créez-en un d'abord !
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/admin/equipment-templates/create')}
                        className="text-sm text-yellow-800 underline"
                      >
                        Créer un template
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value);
                        const template = templates.find(t => t.id === e.target.value);
                        setSelectedTemplate(template || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">-- Sélectionner un template --</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} {template.description ? `- ${template.description}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    Les sections d'inspection seront chargées depuis le template sélectionné.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement *
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    Les sections d'inspection s'adapteront automatiquement selon le type sélectionné.
                  </p>
                </div>
              )}
            </div>

            {/* Section Identification (commune à tous) */}
            <EquipmentIdentification
              formData={formData}
              setFormData={setFormData}
            />

            {/* Sections d'inspection dynamiques */}
            {selectionMode === 'template' && selectedTemplate ? (
              <TemplateBasedInspectionSections
                template={selectedTemplate}
                formData={formData}
                setFormData={setFormData}
              />
            ) : selectionMode === 'config' ? (
              <EquipmentInspectionSections
                selectedType={selectedType}
                formData={formData}
                setFormData={setFormData}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-sm text-yellow-700">
                  Veuillez sélectionner un template ou un type d'équipement.
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer l\'inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

