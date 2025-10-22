'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Stagiaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  formation: string;
  dateFormation: string;
  statut: string;
}

export default function StagiaireUploadPage() {
  const router = useRouter();
  const [stagiaire, setStagiaire] = useState<Stagiaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Formulaire de recherche
  const [searchForm, setSearchForm] = useState({
    email: '',
    code: ''
  });
  const [showSearchForm, setShowSearchForm] = useState(true);

  useEffect(() => {
    // Vérifier si on a un stagiaire en session ou dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const stagiaireId = urlParams.get('id');
    const email = urlParams.get('email');
    
    if (stagiaireId) {
      fetchStagiaire(stagiaireId);
    } else if (email) {
      setSearchForm({ ...searchForm, email });
      searchStagiaireByEmail(email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStagiaire = async (id: string) => {
    try {
      const response = await fetch(`/api/stagiaire/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStagiaire(data);
        setShowSearchForm(false);
      } else {
        setError('Stagiaire non trouvé');
      }
    } catch (error) {
      setError('Erreur lors de la récupération du stagiaire');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStagiaireByEmail = async (email: string) => {
    try {
      const response = await fetch(`/api/stagiaire/search?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.stagiaire) {
          setStagiaire(data.stagiaire);
          setShowSearchForm(false);
        } else {
          setError('Aucun stagiaire trouvé avec cet email');
        }
      } else {
        setError('Erreur lors de la recherche');
      }
    } catch (error) {
      setError('Erreur lors de la recherche');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (searchForm.email) {
      await searchStagiaireByEmail(searchForm.email);
    } else {
      setError('Veuillez saisir un email');
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !stagiaire) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('stagiaireId', stagiaire.id);

      const response = await fetch('/api/stagiaire/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Photo uploadée avec succès ! Votre diplôme sera généré prochainement.');
        setSelectedFile(null);
        setPreview(null);
        
        // Mettre à jour le statut du stagiaire
        setStagiaire({ ...stagiaire, statut: 'PHOTO_UPLOADED' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload de la photo');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <PhotoIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload de Photo
            </h1>
            <p className="text-lg text-gray-600">
              Téléchargez votre photo pour la génération de votre diplôme
            </p>
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Succès</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de recherche */}
        {showSearchForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Rechercher votre inscription
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email utilisé lors de l'inscription
                </label>
                <input
                  type="email"
                  required
                  value={searchForm.email}
                  onChange={(e) => setSearchForm({ ...searchForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="votre.email@example.com"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  'Rechercher'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Informations du stagiaire */}
        {stagiaire && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vos informations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom complet</p>
                  <p className="text-lg text-gray-900">{stagiaire.prenom} {stagiaire.nom}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{stagiaire.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Formation</p>
                  <p className="text-lg text-gray-900">{stagiaire.formation}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de formation</p>
                  <p className="text-lg text-gray-900">
                    {new Date(stagiaire.dateFormation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'upload */}
        {stagiaire && stagiaire.statut === 'EN_ATTENTE' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Télécharger votre photo
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Zone de sélection de fichier */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner une photo'}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </span>
                </label>
              </div>

              {/* Aperçu de la photo */}
              {preview && (
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu de votre photo</h3>
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="mx-auto h-32 w-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions pour la photo</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Photo de face, bien éclairée</li>
                  <li>• Visage clairement visible</li>
                  <li>• Fond neutre de préférence</li>
                  <li>• Format portrait recommandé</li>
                  <li>• Taille maximale : 5MB</li>
                </ul>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    Télécharger la photo
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Statut déjà uploadé */}
        {stagiaire && stagiaire.statut === 'PHOTO_UPLOADED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Photo déjà uploadée</h3>
                <p className="text-green-700">
                  Votre photo a été uploadée avec succès. Votre diplôme sera généré prochainement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Diplôme généré */}
        {stagiaire && stagiaire.statut === 'DIPLOME_GENERATED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Diplôme généré</h3>
                <p className="text-blue-700">
                  Votre diplôme a été généré avec succès. Vous pouvez le télécharger.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
