'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FormBuilder from '@/app/components/form-builder/FormBuilder';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NouveauFormBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/form-builder', {
        method: 'POST',
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

      const savedForm = await response.json();
      router.push(`/admin/form-builder/${savedForm.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (formData: any) => {
    // Logique pour l'aperçu
    console.log('Aperçu du formulaire:', formData);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header avec navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
              Nouveau Formulaire
            </h1>
            <p className="text-sm text-gray-500">
              Créez votre formulaire personnalisé avec des blocs
            </p>
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
          onSave={handleSave}
          onPreview={handlePreview}
          isReadOnly={false}
        />
      </div>
    </div>
  );
}
