'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  irataNo?: string;
}

interface InspectionForm {
  inspectionDate: string;
  technicianId: string;
  technicianName: string;
  technicianIrataNo: string;
  makeOfItem: string;
  modelOfItem: string;
  itemIdNumber: string;
  standardsConformance: string;
  suitabilityOfItem: string;
  ageOfItem: string;
  historyOfItem: string;
  metalPartsCondition: string;
  textilePartsCondition: string;
  plasticPartsCondition: string;
  movingPartsFunction: string;
  operationalCheck: string;
  compatibilityCheck: string;
  overallComments: string;
  technicianVerdict: 'PASS' | 'FAIL' | null;
}

export default function InspectionReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<User | null>(null);

  const [formData, setFormData] = useState<InspectionForm>({
    inspectionDate: new Date().toISOString().split('T')[0],
    technicianId: '',
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
    technicianVerdict: null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicianChange = (technicianId: string) => {
    const technician = users.find(user => user.id === technicianId);
    setSelectedTechnician(technician || null);
    
    setFormData(prev => ({
      ...prev,
      technicianId,
      technicianName: technician ? `${technician.prenom} ${technician.nom}` : '',
      technicianIrataNo: technician?.irataNo || '',
    }));
  };

  const handleInputChange = (field: keyof InspectionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVerdictChange = (verdict: 'PASS' | 'FAIL') => {
    setFormData(prev => ({
      ...prev,
      technicianVerdict: verdict,
    }));
  };

  const handleSave = async () => {
    if (!formData.technicianId) {
      alert('Veuillez sélectionner un technicien');
      return;
    }

    if (!formData.technicianVerdict) {
      alert('Veuillez sélectionner un verdict');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Rapport d\'inspection enregistré avec succès ! Une notification a été envoyée au technicien.');
        router.push('/admin/inspections');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de l\'enregistrement'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
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
    <div className="p-6 print:p-2 text-black font-sans bg-white">
      <div className="max-w-4xl mx-auto bg-white shadow-md print:shadow-none">
        {/* Header avec logo et bouton d'enregistrement */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={64} height={64} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Rapport d'Inspection d'Équipement</h2>
              <p className="text-sm text-gray-600">CI.DES Formations Cordistes</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>

        {/* Sélection du technicien */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg print:hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Sélectionner le technicien</h3>
          <select
            value={formData.technicianId}
            onChange={(e) => handleTechnicianChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionner un technicien...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.prenom} {user.nom} ({user.email})
              </option>
            ))}
          </select>
          {selectedTechnician && (
            <div className="mt-2 p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">
                <strong>Technicien sélectionné:</strong> {selectedTechnician.prenom} {selectedTechnician.nom}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedTechnician.email}
              </p>
              {selectedTechnician.irataNo && (
                <p className="text-sm text-gray-600">
                  <strong>Numéro IRATA:</strong> {selectedTechnician.irataNo}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="border-2 border-blue-600 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-blue-600 p-2 text-xs">
              <p><strong>Doc. No.:</strong> HS019ENG</p>
              <p><strong>Date of Issue:</strong> 07/06/16</p>
              <p><strong>Issue No.:</strong> 001</p>
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
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="date" 
                value={formData.inspectionDate}
                onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
              />
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Make of item:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="text" 
                value={formData.makeOfItem}
                onChange={(e) => handleInputChange('makeOfItem', e.target.value)}
                placeholder="Marque de l'équipement"
              />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 p-2 border border-gray-300">Technician name:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="text" 
                value={formData.technicianName}
                onChange={(e) => handleInputChange('technicianName', e.target.value)}
                placeholder="Nom du technicien"
              />
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Model of item:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="text" 
                value={formData.modelOfItem}
                onChange={(e) => handleInputChange('modelOfItem', e.target.value)}
                placeholder="Modèle de l'équipement"
              />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 p-2 border border-gray-300">Technician IRATA No.:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="text" 
                value={formData.technicianIrataNo}
                onChange={(e) => handleInputChange('technicianIrataNo', e.target.value)}
                placeholder="Numéro IRATA"
              />
            </div>
            <div className="col-span-1 p-2 border border-gray-300">Item ID number:</div>
            <div className="col-span-2 p-2 border border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none text-xs" 
                type="text" 
                value={formData.itemIdNumber}
                onChange={(e) => handleInputChange('itemIdNumber', e.target.value)}
                placeholder="Numéro d'identification"
              />
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
          
          {/* Standards to which item conforms */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Standards to which item conforms</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.standardsConformance}
                onChange={(e) => handleInputChange('standardsConformance', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Suitability of item */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Suitability of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.suitabilityOfItem}
                onChange={(e) => handleInputChange('suitabilityOfItem', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Age of item */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Age of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.ageOfItem}
                onChange={(e) => handleInputChange('ageOfItem', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* History of item */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">History of item</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.historyOfItem}
                onChange={(e) => handleInputChange('historyOfItem', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Visual & Tactile check */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Visual & Tactile check of safety components</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Metal parts condition */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of the Metal parts: (deformation, sharp edges, wear, corrosion, other damage)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.metalPartsCondition}
                onChange={(e) => handleInputChange('metalPartsCondition', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Textile parts condition */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of Textile parts (load bearing webbing and stitching): (cuts, abrasions, burns, chemical contamination, other damage)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.textilePartsCondition}
                onChange={(e) => handleInputChange('textilePartsCondition', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Plastic parts condition */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Condition of Plastic parts (deformation, wear, cracks)</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.plasticPartsCondition}
                onChange={(e) => handleInputChange('plasticPartsCondition', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Moving parts function */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Any moving parts function correctly</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.movingPartsFunction}
                onChange={(e) => handleInputChange('movingPartsFunction', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Operational check */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Operational check of any functions</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.operationalCheck}
                onChange={(e) => handleInputChange('operationalCheck', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>

          {/* Compatibility check */}
          <div className="grid grid-cols-6 border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">Compatibility of multiple parts</div>
            <div className="col-span-2 p-2 border-r border-gray-300 bg-blue-100">
              <input 
                className="w-full bg-transparent outline-none" 
                type="text" 
                value={formData.compatibilityCheck}
                onChange={(e) => handleInputChange('compatibilityCheck', e.target.value)}
                placeholder="Commentaires..."
              />
            </div>
            <div className="p-2 text-center bg-blue-100">
              <input type="text" placeholder="A / R" className="w-12 text-center bg-transparent outline-none" />
            </div>
          </div>
        </div>

        {/* Overall Comments */}
        <div className="border-2 border-gray-300 p-4 my-4 bg-blue-100 text-xs">
          <p className="font-bold mb-2">Overall comments / action to be taken:</p>
          <textarea 
            rows={3} 
            className="w-full bg-transparent outline-none" 
            value={formData.overallComments}
            onChange={(e) => handleInputChange('overallComments', e.target.value)}
            placeholder="Commentaires généraux..."
          />
        </div>

        {/* Verdict */}
        <div className="border-2 border-gray-300 p-4 my-4 text-xs">
          <p className="font-bold mb-2">Overall verdict by technician (tick the relevant box below):</p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="verdict"
                checked={formData.technicianVerdict === 'PASS'}
                onChange={() => handleVerdictChange('PASS')}
              />
              This product is fit to remain in service (Pass)
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="verdict"
                checked={formData.technicianVerdict === 'FAIL'}
                onChange={() => handleVerdictChange('FAIL')}
              />
              This product is unfit to remain in service (Fail)
            </label>
          </div>
        </div>

        {/* Assessor Section */}
        <div className="border-2 border-gray-300 p-4 my-4 text-xs">
          <p className="mb-2">For assessor use only:</p>
          <p className="font-bold mb-2">Verdict by assessor (P = Pass, Dis = Minor discrepancy, F = Fail):</p>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Candidate <u>has</u> correctly identified condition and provided appropriate verdict
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Candidate <u>has not</u> provided correct verdict for product
            </label>
          </div>
          <div>
            <p className="font-bold mb-1">Assessor comments:</p>
            <textarea rows={3} className="w-full border border-gray-300 p-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
