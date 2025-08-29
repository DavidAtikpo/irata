'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface EquipmentInspection {
  id: string;
  docNumber: string;
  dateOfIssue: string;
  issueNumber: string;
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
  assessorVerdict: string | null;
  assessorComments: string | null;
  candidateCorrectlyIdentified: boolean | null;
  status: string;
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

export default function UserInspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspection, setInspection] = useState<EquipmentInspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchInspection();
    }
  }, [status, session, router]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/user/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data);
      } else {
        console.error('Erreur lors de la récupération de l\'inspection');
        router.push('/inspections');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/inspections');
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

  if (!inspection) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Inspection non trouvée</h1>
          <Link href="/inspections" className="text-indigo-600 hover:text-indigo-900">
            Retour à mes inspections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header avec logo */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={48} height={48} className="sm:w-16 sm:h-16" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inspection d'Équipement</h1>
              <p className="text-gray-600">Document: {inspection.docNumber}</p>
              <p className="text-sm text-gray-500">CI.DES Formations Cordistes</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/inspections"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statut et verdict */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-2 sm:mb-0">
            <span className="text-sm text-gray-600">Statut: </span>
            {getStatusBadge(inspection.status)}
          </div>
          <div className="flex space-x-4">
            {inspection.technicianVerdict && (
              <div>
                <span className="text-sm text-gray-600">Verdict technicien: </span>
                {getVerdictBadge(inspection.technicianVerdict)}
              </div>
            )}
            {inspection.assessorVerdict && (
              <div>
                <span className="text-sm text-gray-600">Verdict évaluateur: </span>
                {getVerdictBadge(inspection.assessorVerdict)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document principal */}
      <div className="bg-white border border-gray-300 p-4 sm:p-6 lg:p-10 shadow-md mb-6 print-document">
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-document, .print-document * {
              visibility: visible;
            }
            .print-document {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 20px;
              border: none;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="border-2 border-blue-600 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-blue-600 p-2 text-xs">
              <p><strong>Doc. No.:</strong> {inspection.docNumber}</p>
              <p><strong>Date of Issue:</strong> {inspection.dateOfIssue}</p>
              <p><strong>Issue No.:</strong> {inspection.issueNumber}</p>
              <p><strong>Page:</strong> 1 of 1</p>
            </div>
            <div className="col-span-2 border border-blue-600 p-4 flex items-center justify-center">
              <h1 className="text-lg font-bold text-center uppercase">Level 3 Equipment Inspection Report</h1>
            </div>
            <div className="border border-blue-600 p-2 text-xs"></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-2 border-gray-300 p-4 my-4 text-sm text-center font-bold">
          All shaded boxes must be complete before handing back to your assessor.
        </div>

        {/* Form Fields */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 p-2 border border-gray-300">Date of inspection:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {new Date(inspection.inspectionDate).toLocaleDateString('en-GB')}
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Make of item:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {inspection.makeOfItem}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 p-2 border border-gray-300">Technician name:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {inspection.technicianName}
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Model of item:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {inspection.modelOfItem}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 p-2 border border-gray-300">Technician IRATA No.:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {inspection.technicianIrataNo}
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Item ID number:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              {inspection.itemIdNumber}
            </div>
          </div>
        </div>

        {/* Guidance */}
        <div className="border-2 border-gray-300 p-4 my-4 text-sm">
          <p className="mb-2">For guidance when completing this document, technicians should refer to the following:</p>
          <ul className="list-disc list-inside mb-2">
            <li>IRATA ICOP (Annex H includes equipment inspection checklists);</li>
            <li>IRATA Safety bulletins;</li>
            <li>Equipment manufacturer's user instructions;</li>
            <li>Additional manuals/ course hand-outs supplied by your IRATA training company.</li>
          </ul>
          <p className="font-bold text-right">A: Accept / R: Reject</p>
        </div>

        {/* Inspection Table */}
        <div className="border-2 border-gray-300 text-xs">
          <div className="grid grid-cols-6 font-bold bg-gray-100 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Conformance and History</div>
            <div className="col-span-2 p-2 border-r border-gray-300">Comment</div>
            <div className="p-2 text-center">A / R</div>
          </div>
          
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Standards to which item conforms</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.standardsConformance || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Suitability of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.suitabilityOfItem || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Age of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.ageOfItem || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">History of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.historyOfItem || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Visual & Tactile check of safety components</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">-</div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of the Metal parts: (deformation, sharp edges, wear, corrosion, other damage)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.metalPartsCondition || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of Textile parts (load bearing webbing and stitching): (cuts, abrasions, burns, chemical contamination, other damage)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.textilePartsCondition || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of Plastic parts (deformation, wear, cracks)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.plasticPartsCondition || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Any moving parts function correctly</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.movingPartsFunction || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Operational check of any functions</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.operationalCheck || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>

          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Compatibility of multiple parts</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              {inspection.compatibilityCheck || '-'}
            </div>
            <div className="p-2 text-center bg-blue-100">-</div>
          </div>
        </div>

        {/* Overall Comments */}
        <div className="border-2 border-gray-300 p-4 my-4 bg-blue-100 text-xs">
          <p className="font-bold mb-2">Overall comments / action to be taken:</p>
          <div className="min-h-[60px]">
            {inspection.overallComments || '-'}
          </div>
        </div>

        {/* Verdict */}
        <div className="border-2 border-gray-300 p-4 my-4 text-xs">
          <p className="font-bold mb-2">Overall verdict by technician (tick the relevant box below):</p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                checked={inspection.technicianVerdict === 'PASS'}
                disabled
              />
              This product is fit to remain in service (Pass)
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                checked={inspection.technicianVerdict === 'FAIL'}
                disabled
              />
              This product is unfit to remain in service (Fail)
            </label>
          </div>
        </div>

        {/* Assessor Section */}
        {inspection.assessorVerdict && (
          <div className="border-2 border-gray-300 p-4 my-4 text-xs">
            <p className="mb-2">For assessor use only:</p>
            <p className="font-bold mb-2">Verdict by assessor (P = Pass, Dis = Minor discrepancy, F = Fail):</p>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={inspection.candidateCorrectlyIdentified === true}
                  disabled
                />
                Candidate <u>has</u> correctly identified condition and provided appropriate verdict
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={inspection.candidateCorrectlyIdentified === false}
                  disabled
                />
                Candidate <u>has not</u> provided correct verdict for product
              </label>
            </div>
            <div>
              <p className="font-bold mb-1">Assessor comments:</p>
              <div className="min-h-[60px] border border-gray-300 p-1 bg-gray-50">
                {inspection.assessorComments || '-'}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 ml-2 sm:ml-5 mr-2 sm:mr-5 border-b-3" style={{ borderBottomColor: '#3365BE' }}></div>
        
        {/* Footer */}
        <div className="text-center text-xs tracking-wide text-neutral-800 py-3">
          UNCONTROLLED WHEN PRINTED
        </div>
      </div>
    </div>
  );
}





