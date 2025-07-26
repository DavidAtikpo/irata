'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EquipmentInspection {
  id: string;
  docNumber: string;
  inspectionDate: string;
  technicianName: string;
  technicianIrataNo: string;
  makeOfItem: string;
  modelOfItem: string;
  itemIdNumber: string;
  status: string;
  technicianVerdict: string | null;
  assessorVerdict: string | null;
  createdAt: string;
  technician: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  assessor?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function InspectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspections, setInspections] = useState<EquipmentInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchInspections();
    }
  }, [session, filter]);

  const fetchInspections = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/inspections'
        : `/api/admin/inspections?status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInspections(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-800' },
      ASSESSED: { label: 'Évalué', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;
    
    const verdictConfig = {
      PASS: { label: 'Pass', color: 'bg-green-100 text-green-800' },
      FAIL: { label: 'Fail', color: 'bg-red-100 text-red-800' },
      DISCREPANCY: { label: 'Discrepancy', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = verdictConfig[verdict as keyof typeof verdictConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inspections d'Équipement</h1>
          <Link
            href="/admin/inspections/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Nouvelle Inspection
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-4 py-2 rounded-md ${
              filter === 'DRAFT'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Brouillons
          </button>
          <button
            onClick={() => setFilter('SUBMITTED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'SUBMITTED'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Soumises
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'APPROVED'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approuvées
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Équipement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technicien
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verdict
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspections.map((inspection) => (
              <tr key={inspection.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inspection.docNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{inspection.makeOfItem}</div>
                    <div className="text-gray-500">{inspection.modelOfItem}</div>
                    <div className="text-gray-400 text-xs">ID: {inspection.itemIdNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{inspection.technicianName}</div>
                    <div className="text-gray-500">IRATA: {inspection.technicianIrataNo}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(inspection.inspectionDate).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(inspection.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {inspection.technicianVerdict && (
                      <div>
                        <span className="text-xs text-gray-500">Tech:</span>
                        {getVerdictBadge(inspection.technicianVerdict)}
                      </div>
                    )}
                    {inspection.assessorVerdict && (
                      <div>
                        <span className="text-xs text-gray-500">Ass:</span>
                        {getVerdictBadge(inspection.assessorVerdict)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/inspections/${inspection.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/admin/inspections/${inspection.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {inspections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune inspection trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
} 