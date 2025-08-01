'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface JobPlanningForm {
  // Informations de base
  docNumber: string;
  dateOfIssue: string;
  issueNumber: string;
  
  // Informations du projet
  projectName: string;
  clientName: string;
  location: string;
  dateOfWork: string;
  
  // Description de la tâche
  taskDescription: string;
  workMethod: string;
  rescuePlan: string;
  
  // Équipements et matériaux
  equipmentRequired: string;
  materialsRequired: string;
  plantRequired: string;
  
  // Personnel
  personnelRequired: string;
  certificationRequirements: string;
  
  // Sécurité
  safeHandlingPrecautions: string;
  riskAssessment: string;
  
  // Acceptation
  workTeamAcceptance: {
    name: string;
    irataNumber: string;
    signature: string;
  }[];
  
  // Notes
  additionalNotes: string;
}

export default function NewJobPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobPlanningForm>({
    docNumber: 'HS-061ENG',
    dateOfIssue: new Date().toISOString().split('T')[0],
    issueNumber: '001',
    projectName: '',
    clientName: '',
    location: '',
    dateOfWork: '',
    taskDescription: '',
    workMethod: '',
    rescuePlan: '',
    equipmentRequired: '',
    materialsRequired: '',
    plantRequired: '',
    personnelRequired: '',
    certificationRequirements: '',
    safeHandlingPrecautions: '',
    riskAssessment: '',
    workTeamAcceptance: [
      { name: '', irataNumber: '', signature: '' },
      { name: '', irataNumber: '', signature: '' },
      { name: '', irataNumber: '', signature: '' }
    ],
    additionalNotes: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workTeamAcceptance: prev.workTeamAcceptance.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Job Planning Form créé:', formData);
      alert('Formulaire de planification de tâche créé avec succès !');
      router.push('/admin/job-planing');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du formulaire');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/job-planing');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header avec logo */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Planning Form</h1>
              <p className="text-sm text-gray-600">CI.DES Formations Cordistes - IRATA</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          {/* En-tête du document */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doc. No.
              </label>
              <input
                type="text"
                name="docNumber"
                value={formData.docNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Issue
              </label>
              <input
                type="date"
                name="dateOfIssue"
                value={formData.dateOfIssue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue No.
              </label>
              <input
                type="text"
                name="issueNumber"
                value={formData.issueNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Informations du projet */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Informations du projet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du projet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse du chantier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date des travaux
                </label>
                <input
                  type="date"
                  name="dateOfWork"
                  value={formData.dateOfWork}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description de la tâche */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Description de la tâche
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée de la tâche
                </label>
                <textarea
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description complète de la tâche à effectuer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de travail
                </label>
                <textarea
                  name="workMethod"
                  value={formData.workMethod}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Méthode de travail prévue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de sauvetage
                </label>
                <textarea
                  name="rescuePlan"
                  value={formData.rescuePlan}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Plan de sauvetage en cas d'urgence..."
                />
              </div>
            </div>
          </div>

          {/* Équipements et matériaux */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Équipements, matériaux et engins requis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements requis
                </label>
                <textarea
                  name="equipmentRequired"
                  value={formData.equipmentRequired}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Harnais, cordes, mousquetons..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matériaux requis
                </label>
                <textarea
                  name="materialsRequired"
                  value={formData.materialsRequired}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Matériaux nécessaires..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engins requis
                </label>
                <textarea
                  name="plantRequired"
                  value={formData.plantRequired}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engins de levage, nacelles..."
                />
              </div>
            </div>
          </div>

          {/* Personnel */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Personnel et certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personnel requis
                </label>
                <textarea
                  name="personnelRequired"
                  value={formData.personnelRequired}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre et type de personnel..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exigences de certification
                </label>
                <textarea
                  name="certificationRequirements"
                  value={formData.certificationRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Certifications IRATA requises..."
                />
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Sécurité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Précautions de manipulation sécurisée
                </label>
                <textarea
                  name="safeHandlingPrecautions"
                  value={formData.safeHandlingPrecautions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Précautions pour outils et matériaux..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Évaluation des risques
                </label>
                <textarea
                  name="riskAssessment"
                  value={formData.riskAssessment}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Évaluation des risques identifiés..."
                />
              </div>
            </div>
          </div>

          {/* Acceptation par l'équipe */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Acceptation par l'équipe de travail
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Acceptation par l'équipe de travail de la méthode de travail et du plan de sauvetage
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Nom
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Numéro IRATA
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Signature
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.workTeamAcceptance.map((member, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nom complet"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          value={member.irataNumber}
                          onChange={(e) => handleTeamMemberChange(index, 'irataNumber', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Numéro IRATA"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          value={member.signature}
                          onChange={(e) => handleTeamMemberChange(index, 'signature', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Signature"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes supplémentaires */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes supplémentaires
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Références */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Pour guider la rédaction de ce document, les techniciens doivent se référer à :
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• IRATA ICOP</li>
              <li>• IRATA Safety bulletins</li>
              <li>• Instructions d'utilisation du fabricant d'équipement</li>
              <li>• Manuels supplémentaires / supports de cours fournis par votre société de formation IRATA</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Créer le formulaire</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 