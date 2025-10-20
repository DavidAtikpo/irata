'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface FormBuilder {
  id: string;
  name: string;
  description?: string;
  title: string;
  isActive: boolean;
  formData: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  _count: {
    formSubmissions: number;
  };
}

export default function FormBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<FormBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchForms();
    }
  }, [status, session, router]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/form-builder');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formulaires');
      }
      const data = await response.json();
      setForms(data);
    } catch (error) {
      setError('Erreur lors de la récupération des formulaires');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/form-builder/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setForms(forms.filter(form => form.id !== id));
    } catch (error: any) {
      setError(error.message);
      console.error('Erreur:', error);
    }
  };

  const handleDuplicate = async (form: FormBuilder) => {
    try {
      const duplicatedForm = {
        name: `${form.name} (Copie)`,
        description: form.description,
        title: `${form.title} (Copie)`,
        formData: form.formData,
        settings: form.settings,
      };

      const response = await fetch('/api/admin/form-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedForm),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la duplication');
      }

      fetchForms(); // Rafraîchir la liste
    } catch (error: any) {
      setError(error.message);
      console.error('Erreur:', error);
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des formulaires...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Constructeur de Formulaires
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Créez et gérez vos formulaires personnalisés avec des blocs
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/form-builder/nouveau')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau Formulaire
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {forms.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <ClipboardDocumentListIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun formulaire</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par créer votre premier formulaire personnalisé.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/admin/form-builder/nouveau')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Créer un formulaire
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <div key={form.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {form.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {form.description || 'Aucune description'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(form.isActive)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>
                          {form._count.formSubmissions} soumission{form._count.formSubmissions > 1 ? 's' : ''}
                        </span>
                        <span>
                          {new Date(form.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          Par {form.createdBy.nom && form.createdBy.prenom
                            ? `${form.createdBy.prenom} ${form.createdBy.nom}`
                            : form.createdBy.email}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/form-builder/${form.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            title="Voir"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/form-builder/${form.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(form)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            title="Dupliquer"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
