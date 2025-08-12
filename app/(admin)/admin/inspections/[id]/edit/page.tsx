'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface EquipmentInspection {
  id: string;
  docNumber: string;
  inspectionDate: string;
  technicianName: string;
  technicianIrataNo: string;
  makeOfItem: string;
  modelOfItem: string;
  itemIdNumber: string;
  standardsConformance: string | null;
  suitabilityOfItem: string | null;
  ageOfItem: string | null;
  historyOfItem: string | null;
  metalPartsCondition: string | null;
  textilePartsCondition: string | null;
  plasticPartsCondition: string | null;
  movingPartsFunction: string | null;
  operationalCheck: string | null;
  compatibilityCheck: string | null;
  overallComments: string | null;
  technicianVerdict: string | null;
  status: string;
}

export default function EditInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EquipmentInspection>({
    id: '',
    docNumber: '',
    inspectionDate: '',
    technicianName: '',
    technicianIrataNo: '',
    makeOfItem: '',
    modelOfItem: '',
    itemIdNumber: '',
    standardsConformance: '',
    suitabilityOfItem: '',
    ageOfItem: '',
    historyOfItem: '',
    metalPartsCondition: '',
    textilePartsCondition: '',
    plasticPartsCondition: '',
    movingPartsFunction: '',
    operationalCheck: '',
    compatibilityCheck: '',
    overallComments: '',
    technicianVerdict: '',
    status: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchInspection();
    }
  }, [session, id]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/admin/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          ...data,
          inspectionDate: data.inspectionDate ? new Date(data.inspectionDate).toISOString().split('T')[0] : ''
        });
      } else {
        console.error('Erreur lors de la récupération de l\'inspection');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
              const response = await fetch(`/api/admin/inspections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push(`/admin/inspections/${id}`);
      } else {
        console.error('Erreur lors de la mise à jour de l\'inspection');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header avec logo */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modifier l'Inspection d'Équipement</h1>
              <p className="text-gray-600">Document: {form.docNumber}</p>
              <p className="text-sm text-gray-500">CI.DES Formations Cordistes</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Equipment and Technician Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du Technicien</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date d'inspection *
                  </label>
                  <input
                    type="date"
                    name="inspectionDate"
                    value={form.inspectionDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du technicien *
                  </label>
                  <input
                    type="text"
                    name="technicianName"
                    value={form.technicianName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro IRATA du technicien *
                  </label>
                  <input
                    type="text"
                    name="technicianIrataNo"
                    value={form.technicianIrataNo}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'Équipement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marque de l'article *
                  </label>
                  <input
                    type="text"
                    name="makeOfItem"
                    value={form.makeOfItem}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modèle de l'article *
                  </label>
                  <input
                    type="text"
                    name="modelOfItem"
                    value={form.modelOfItem}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro d'identification de l'article *
                  </label>
                  <input
                    type="text"
                    name="itemIdNumber"
                    value={form.itemIdNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conformance and History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conformité et Historique</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Normes auxquelles l'article se conforme
              </label>
              <textarea
                name="standardsConformance"
                value={form.standardsConformance || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez les normes de conformité..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adéquation de l'article
              </label>
              <textarea
                name="suitabilityOfItem"
                value={form.suitabilityOfItem || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Évaluez l'adéquation de l'article..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Âge de l'article
              </label>
              <input
                type="text"
                name="ageOfItem"
                value={form.ageOfItem || ''}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Âge de l'article..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Historique de l'article
              </label>
              <textarea
                name="historyOfItem"
                value={form.historyOfItem || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Historique d'utilisation et maintenance..."
              />
            </div>
          </div>
        </div>

        {/* Visual & Tactile check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contrôle Visuel et Tactile des Composants de Sécurité</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                État des pièces métalliques (déformation, arêtes vives, usure, corrosion, autres dommages)
              </label>
              <textarea
                name="metalPartsCondition"
                value={form.metalPartsCondition || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez l'état des pièces métalliques..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                État des pièces textiles (sangles de charge et coutures) (coupures, abrasions, brûlures, contamination chimique, autres dommages)
              </label>
              <textarea
                name="textilePartsCondition"
                value={form.textilePartsCondition || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez l'état des pièces textiles..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                État des pièces plastiques (déformation, usure, fissures)
              </label>
              <textarea
                name="plasticPartsCondition"
                value={form.plasticPartsCondition || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez l'état des pièces plastiques..."
              />
            </div>
          </div>
        </div>

        {/* Operational check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contrôle Opérationnel / Fonctionnel</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Les pièces mobiles fonctionnent correctement
              </label>
              <textarea
                name="movingPartsFunction"
                value={form.movingPartsFunction || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Évaluez le fonctionnement des pièces mobiles..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contrôle opérationnel de toutes les fonctions
              </label>
              <textarea
                name="operationalCheck"
                value={form.operationalCheck || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez les contrôles opérationnels..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Compatibilité de pièces multiples
              </label>
              <textarea
                name="compatibilityCheck"
                value={form.compatibilityCheck || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Évaluez la compatibilité des pièces..."
              />
            </div>
          </div>
        </div>

        {/* Overall comments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Commentaires Généraux / Actions à Entreprendre</h3>
          <textarea
            name="overallComments"
            value={form.overallComments || ''}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Commentaires généraux et actions recommandées..."
          />
        </div>

        {/* Technician verdict */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verdict Global du Technicien</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="technicianVerdict"
                  value="PASS"
                  checked={form.technicianVerdict === 'PASS'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Ce produit est apte à rester en service (Pass)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="technicianVerdict"
                  value="FAIL"
                  checked={form.technicianVerdict === 'FAIL'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Ce produit n'est pas apte à rester en service (Fail)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </button>
        </div>
      </form>
    </div>
  );
} 