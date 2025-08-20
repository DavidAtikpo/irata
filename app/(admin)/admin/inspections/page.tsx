'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  const handleDelete = async (inspectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inspection ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/inspections/${inspectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recharger la liste après suppression
        fetchInspections();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
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
    <div className="p-6">
      {/* Header avec logo */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspections d'Équipement</h1>
              <p className="text-sm text-gray-600">CI.DES Formations Cordistes</p>
            </div>
          </div>
          <Link
            href="/admin/inspections/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouvelle Inspection</span>
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtrer les inspections</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'DRAFT'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Brouillons
          </button>
          <button
            onClick={() => setFilter('SUBMITTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'SUBMITTED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Soumises
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'APPROVED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Voir</span>
                    </Link>
                    <Link
                      href={`/admin/inspections/${inspection.id}/edit`}
                      className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Modifier</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(inspection.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Supprimer</span>
                    </button>
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