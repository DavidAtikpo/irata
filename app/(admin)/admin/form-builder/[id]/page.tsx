'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FormBuilder from '@/app/components/form-builder/FormBuilder';
import { ArrowLeftIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

interface FormBuilderData {
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
  formSubmissions: any[];
}

export default function FormBuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<FormBuilderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/admin/form-builder/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du formulaire');
        }
        const data = await response.json();
        setForm(data);
      } catch (error) {
        setError('Erreur lors de la récupération du formulaire');
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
      fetchForm();
    }
  }, [status, session, router, params]);

  const handleSave = async (formData: any) => {
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/form-builder/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          title: formData.title,
          formData: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const updatedForm = await response.json();
      setForm(updatedForm);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur:', err);
    }
  };

  const handlePreview = (formData: any) => {
    console.log('Aperçu du formulaire:', formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Formulaire non trouvé'}</p>
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
    <div className="h-screen flex flex-col">
      {/* Header avec navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {form.title}
              </h1>
              <p className="text-sm text-gray-500">
                {form.description || 'Aucune description'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                isPreviewMode
                  ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Mode aperçu' : 'Mode édition'}
            </button>
            
            {!isPreviewMode && (
              <button
                onClick={() => router.push(`/admin/form-builder/${form.id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* FormBuilder */}
      <div className="flex-1 overflow-hidden">
        <FormBuilder
          initialFormData={form.formData}
          onSave={handleSave}
          onPreview={handlePreview}
          isReadOnly={isPreviewMode}
        />
      </div>
    </div>
  );
}
