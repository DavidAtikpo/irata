'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Subsection {
  id: string;
  label: string;
  hasStatus: boolean;
  hasComment: boolean;
  crossableWords: string[];  // Mots qui peuvent être barrés
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

export default function CreateTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ajouter une nouvelle section
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `${sections.length + 1}. NOUVELLE SECTION`,
      subsections: [],
    };
    setSections([...sections, newSection]);
  };

  // Supprimer une section
  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  // Déplacer une section
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  // Mettre à jour le titre d'une section
  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  // Ajouter une sous-section
  const addSubsection = (sectionId: string) => {
    const newSubsection: Subsection = {
      id: `subsection-${Date.now()}`,
      label: 'Nouveau point d\'inspection',
      hasStatus: true,
      hasComment: true,
      crossableWords: [],
    };
    
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, subsections: [...s.subsections, newSubsection] }
        : s
    ));
  };

  // Supprimer une sous-section
  const removeSubsection = (sectionId: string, subsectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, subsections: s.subsections.filter(sub => sub.id !== subsectionId) }
        : s
    ));
  };

  // Mettre à jour une sous-section
  const updateSubsection = (
    sectionId: string, 
    subsectionId: string, 
    field: keyof Subsection, 
    value: any
  ) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? {
            ...s,
            subsections: s.subsections.map(sub =>
              sub.id === subsectionId ? { ...sub, [field]: value } : sub
            )
          }
        : s
    ));
  };

  // Enregistrer le template
  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Veuillez donner un nom au template');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/equipment-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          structure: { sections },
        }),
      });

      if (response.ok) {
        router.push('/admin/equipment-templates');
      } else {
        alert('Erreur lors de la création du template');
      }
    } catch (error) {
      alert('Erreur lors de la création du template');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Créer un Template d'Équipement
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Construisez votre propre structure d'inspection personnalisée
          </p>
        </div>

        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Informations du Template
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du type d'équipement *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corde, Longe, Ancrage..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du type d'équipement..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Structure - Sections */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Vie de l'Équipement
              </h2>
              <p className="text-sm text-gray-600">
                Ajoutez autant de sections que nécessaire (1 à 12+)
              </p>
            </div>
            <button
              onClick={addSection}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Ajouter une section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">
                Aucune section. Cliquez sur "Ajouter une section" pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  {/* En-tête de section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Titre de la section"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveSection(sectionIndex, 'up')}
                        disabled={sectionIndex === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Monter"
                      >
                        <ArrowUpIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => moveSection(sectionIndex, 'down')}
                        disabled={sectionIndex === sections.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Descendre"
                      >
                        <ArrowDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Sous-sections */}
                  <div className="space-y-3 mb-4">
                    {section.subsections.map((subsection) => (
                      <div
                        key={subsection.id}
                        className="bg-white border border-gray-200 rounded p-3"
                      >
                        <div className="space-y-3">
                          {/* Label */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Texte du point d'inspection
                            </label>
                            <textarea
                              value={subsection.label}
                              onChange={(e) => updateSubsection(section.id, subsection.id, 'label', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Ex: Usure / Coupure / Brûlure..."
                            />
                          </div>

                          {/* Options */}
                          <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={subsection.hasStatus}
                                onChange={(e) => updateSubsection(section.id, subsection.id, 'hasStatus', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Status (V / NA / X)
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={subsection.hasComment}
                                onChange={(e) => updateSubsection(section.id, subsection.id, 'hasComment', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Commentaire
                              </span>
                            </label>
                          </div>

                          {/* Mots à barrer */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Mots pouvant être barrés (séparés par des virgules)
                            </label>
                            <input
                              type="text"
                              value={subsection.crossableWords.join(', ')}
                              onChange={(e) => {
                                const words = e.target.value
                                  .split(',')
                                  .map(w => w.trim())
                                  .filter(w => w);
                                updateSubsection(section.id, subsection.id, 'crossableWords', words);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Ex: Usure, Coupure, Brûlure"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Ces mots pourront être cliqués pour être barrés lors de l'inspection
                            </p>
                          </div>

                          {/* Bouton supprimer */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeSubsection(section.id, subsection.id)}
                              className="inline-flex items-center px-3 py-1 text-xs text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Supprimer ce point
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bouton ajouter sous-section */}
                  <button
                    onClick={() => addSubsection(section.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Ajouter un point d'inspection
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le template'}
          </button>
        </div>

        {/* Aperçu */}
        {sections.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              📋 Aperçu de votre template
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nom:</strong> {name || '(non défini)'}</p>
              <p><strong>Nombre de sections:</strong> {sections.length}</p>
              <p><strong>Total de points d'inspection:</strong> {
                sections.reduce((sum, s) => sum + s.subsections.length, 0)
              }</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

