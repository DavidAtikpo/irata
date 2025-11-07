'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
  structure: any;
  createdAt: string;
}

export default function EquipmentTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/equipment-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce template ?')) return;
    
    try {
      const response = await fetch(`/api/admin/equipment-templates/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const response = await fetch('/api/admin/equipment-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (copie)`,
          description: template.description,
          structure: template.structure,
        }),
      });
      if (response.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Templates d'Équipement
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Créez et gérez vos propres structures d'inspection
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/equipment-templates/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau Template
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun template
            </h3>
            <p className="text-gray-500 mb-6">
              Créez votre premier template d'équipement personnalisé
            </p>
            <button
              onClick={() => router.push('/admin/equipment-templates/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const sectionCount = template.structure?.sections?.length || 0;
              return (
                <div
                  key={template.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {sectionCount} section{sectionCount > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Bouton principal : Créer Inspection */}
                    <button
                      onClick={() => router.push(`/admin/equipment-detailed-inspections/create?templateId=${template.id}`)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                      Créer Inspection
                    </button>
                    
                    {/* Boutons secondaires */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/equipment-templates/${template.id}/edit`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        title="Dupliquer"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

