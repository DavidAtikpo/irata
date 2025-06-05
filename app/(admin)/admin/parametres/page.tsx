'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Cog6ToothIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Settings {
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
    phone: string;
    website: string;
    siret: string;
    tva: string;
  };
  formation: {
    defaultDuration: number;
    maxParticipants: number;
    minParticipants: number;
    pricePerDay: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
}

export default function AdminParametresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paramètres');
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setError('Erreur lors de la récupération des paramètres');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des paramètres');
      }

      setSuccess('Les paramètres ont été mis à jour avec succès');
    } catch (error) {
      setError('Erreur lors de la mise à jour des paramètres');
      console.error('Erreur:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Paramètres</h2>
          <p className="mt-2 text-sm text-gray-600">
            Configurez les paramètres de la plateforme
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de l'entreprise */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Informations de l'entreprise
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    id="company-name"
                    value={settings.company.name}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company-siret" className="block text-sm font-medium text-gray-700">
                    Numéro SIRET
                  </label>
                  <input
                    type="text"
                    id="company-siret"
                    value={settings.company.siret}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, siret: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="company-address" className="block text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="company-address"
                    value={settings.company.address}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500 "
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-city" className="block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="company-city"
                    value={settings.company.city}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, city: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-postalCode" className="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="company-postalCode"
                    value={settings.company.postalCode}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, postalCode: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-country" className="block text-sm font-medium text-gray-700">
                    Pays
                  </label>
                  <input
                    type="text"
                    id="company-country"
                    value={settings.company.country}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, country: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="company-email"
                    value={settings.company.email}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, email: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="company-phone"
                    value={settings.company.phone}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, phone: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                    Site web
                  </label>
                  <input
                    type="url"
                    id="company-website"
                    value={settings.company.website}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, website: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company-tva" className="block text-sm font-medium text-gray-700">
                    Numéro de TVA
                  </label>
                  <input
                    type="text"
                    id="company-tva"
                    value={settings.company.tva}
                    onChange={(e) => setSettings({ ...settings, company: { ...settings.company, tva: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres des formations */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Paramètres des formations
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="formation-defaultDuration" className="block text-sm font-medium text-gray-700">
                    Durée par défaut (jours)
                  </label>
                  <input
                    type="number"
                    id="formation-defaultDuration"
                    value={settings.formation.defaultDuration}
                    onChange={(e) => setSettings({ ...settings, formation: { ...settings.formation, defaultDuration: parseInt(e.target.value) } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="formation-maxParticipants" className="block text-sm font-medium text-gray-700">
                    Nombre maximum de participants
                  </label>
                  <input
                    type="number"
                    id="formation-maxParticipants"
                    value={settings.formation.maxParticipants}
                    onChange={(e) => setSettings({ ...settings, formation: { ...settings.formation, maxParticipants: parseInt(e.target.value) } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="formation-minParticipants" className="block text-sm font-medium text-gray-700">
                    Nombre minimum de participants
                  </label>
                  <input
                    type="number"
                    id="formation-minParticipants"
                    value={settings.formation.minParticipants}
                    onChange={(e) => setSettings({ ...settings, formation: { ...settings.formation, minParticipants: parseInt(e.target.value) } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="formation-pricePerDay" className="block text-sm font-medium text-gray-700">
                    Prix par jour (€)
                  </label>
                  <input
                    type="number"
                    id="formation-pricePerDay"
                    value={settings.formation.pricePerDay}
                    onChange={(e) => setSettings({ ...settings, formation: { ...settings.formation, pricePerDay: parseInt(e.target.value) } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration email */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Configuration email
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="email-smtpHost" className="block text-sm font-medium text-gray-700">
                    Serveur SMTP
                  </label>
                  <input
                    type="text"
                    id="email-smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpHost: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email-smtpPort" className="block text-sm font-medium text-gray-700">
                    Port SMTP
                  </label>
                  <input
                    type="number"
                    id="email-smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpPort: parseInt(e.target.value) } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email-smtpUser" className="block text-sm font-medium text-gray-700">
                    Utilisateur SMTP
                  </label>
                  <input
                    type="text"
                    id="email-smtpUser"
                    value={settings.email.smtpUser}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpUser: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email-smtpPassword" className="block text-sm font-medium text-gray-700">
                    Mot de passe SMTP
                  </label>
                  <input
                    type="password"
                    id="email-smtpPassword"
                    value={settings.email.smtpPassword}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpPassword: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email-fromEmail" className="block text-sm font-medium text-gray-700">
                    Email d'envoi
                  </label>
                  <input
                    type="email"
                    id="email-fromEmail"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, fromEmail: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email-fromName" className="block text-sm font-medium text-gray-700">
                    Nom d'envoi
                  </label>
                  <input
                    type="text"
                    id="email-fromName"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings({ ...settings, email: { ...settings.email, fromName: e.target.value } })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 