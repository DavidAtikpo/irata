'use client';

import Link from 'next/link';
import { useState } from 'react';

const documents = [
  {
    id: 'business-plan',
    title: '📋 Plan d\'Affaires Complet',
    description: 'Étude détaillée du marché, projections financières et stratégie de développement',
    size: '2.8 MB',
    pages: '45 pages',
    category: 'Stratégie',
    downloadUrl: '/documents/financement-participatif/business-plan.pdf',
    preview: {
      sections: [
        'Résumé exécutif',
        'Analyse du marché togolais',
        'Modèle économique',
        'Projections financières 5 ans',
        'Stratégie de développement'
      ]
    }
  },
  {
    id: 'legal-status',
    title: '⚖️ Statuts Juridiques & Licences',
    description: 'Documents officiels d\'enregistrement et autorisations légales',
    size: '1.2 MB',
    pages: '18 pages',
    category: 'Légal',
    downloadUrl: '/documents/financement-participatif/statuts-juridiques.pdf',
    preview: {
      sections: [
        'Certificat d\'incorporation',
        'Statuts de la société',
        'Licences d\'exploitation',
        'Autorisations sectorielles',
        'Conformité réglementaire'
      ]
    }
  },
  {
    id: 'financial-audit',
    title: '💰 Audit Financier Indépendant',
    description: 'Rapport d\'audit réalisé par un cabinet comptable certifié',
    size: '1.8 MB',
    pages: '28 pages',
    category: 'Finances',
    downloadUrl: '/documents/financement-participatif/audit-financier.pdf',
    preview: {
      sections: [
        'Bilan comptable',
        'Compte de résultat',
        'Flux de trésorerie',
        'Opinion du commissaire aux comptes',
        'Recommandations'
      ]
    }
  },
  {
    id: 'project-certifications',
    title: '🏆 Certifications & Agréments IRATA',
    description: 'Certifications officielles et partenariats avec les organismes de formation',
    size: '950 KB',
    pages: '12 pages',
    category: 'Qualité',
    downloadUrl: '/documents/financement-participatif/certifications.pdf',
    preview: {
      sections: [
        'Agrément IRATA International',
        'Certifications instructeurs',
        'Partenariats institutionnels',
        'Standards de qualité',
        'Procédures de certification'
      ]
    }
  },
  {
    id: 'construction-progress',
    title: '🏗️ Rapport d\'Avancement Construction',
    description: 'Photos et rapports détaillés de l\'état d\'avancement du bâtiment (95% terminé)',
    size: '4.2 MB',
    pages: '32 pages',
    category: 'Infrastructure',
    downloadUrl: '/documents/financement-participatif/avancement-construction.pdf',
    preview: {
      sections: [
        'Photos aériennes du site',
        'État d\'avancement par phase',
        'Contrôles qualité effectués',
        'Planification finition',
        'Réception provisoire'
      ]
    }
  },
  {
    id: 'risk-analysis',
    title: '⚠️ Analyse des Risques & Mitigation',
    description: 'Identification des risques projet et stratégies de mitigation',
    size: '1.5 MB',
    pages: '22 pages',
    category: 'Risques',
    downloadUrl: '/documents/financement-participatif/analyse-risques.pdf',
    preview: {
      sections: [
        'Risques techniques identifiés',
        'Risques commerciaux',
        'Risques réglementaires',
        'Stratégies de mitigation',
        'Plan de contingence'
      ]
    }
  }
];

const teamMembers = [
  {
    name: 'Jean-Claude AGBODJAN',
    role: 'Directeur Général',
    experience: '15 ans dans la formation sécurité',
    certifications: ['IRATA Level 3', 'Formateur CND'],
    photo: '/team/jean-claude.jpg'
  },
  {
    name: 'Marie KOFFI',
    role: 'Directrice Technique',
    experience: '12 ans en sécurité industrielle',
    certifications: ['Ingénieur Sécurité', 'NEBOSH'],
    photo: '/team/marie-koffi.jpg'
  },
  {
    name: 'Kofi MENSAH',
    role: 'Responsable Formation',
    experience: '10 ans formation professionnelle',
    certifications: ['IRATA Level 2', 'SST Formateur'],
    photo: '/team/kofi-mensah.jpg'
  }
];

export default function DocumentsFinancement() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);

  const categories = ['all', 'Stratégie', 'Légal', 'Finances', 'Qualité', 'Infrastructure', 'Risques'];
  
  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link 
              href="/financement-participatif" 
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
            >
              ← Retour au financement participatif
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📁 Documents de Transparence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accédez à tous les documents officiels de notre projet pour investir en toute confiance. 
            Notre engagement : transparence totale et accès libre à l'information.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-800 mb-2">Audit Indépendant</h3>
            <p className="text-sm text-gray-600">Rapport d'audit réalisé par un cabinet certifié</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🏛️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Conformité Légale</h3>
            <p className="text-sm text-gray-600">Toutes les autorisations et licences obtenues</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-2">Transparence Totale</h3>
            <p className="text-sm text-gray-600">Accès libre à tous les documents du projet</p>
          </div>
        </div>

        {/* Document Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Catégories de Documents</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category === 'all' ? 'Tous les documents' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {doc.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded">{doc.category}</span>
                      <span>{doc.size}</span>
                      <span>{doc.pages}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Contenu:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    {doc.preview.sections.slice(0, 3).map((section, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        {section}
                      </li>
                    ))}
                    {doc.preview.sections.length > 3 && (
                      <li className="text-gray-500 italic">
                        +{doc.preview.sections.length - 3} autres sections...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex-1 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition duration-200"
                  >
                    👁️ Aperçu
                  </button>
                  <a
                    href={doc.downloadUrl}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition duration-200 text-center"
                  >
                    ⬇️ Télécharger
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            👥 Équipe de Direction
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 mb-2">{member.experience}</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {member.certifications.map((cert, certIdx) => (
                    <span key={certIdx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact for Questions */}
        <div className="bg-indigo-50 rounded-lg p-8 text-center border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">
            Des Questions sur les Documents ?
          </h2>
          <p className="text-indigo-700 mb-6">
            Notre équipe est disponible pour clarifier tout aspect de notre projet
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              📧 Nous Contacter
            </Link>
            <span className="text-indigo-600">
              📞 +228 90 00 00 00 | ✉️ gm@cides.tf
            </span>
          </div>
        </div>

      </main>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedDoc.title}
                </h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedDoc.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Contenu détaillé</h4>
                  <ul className="space-y-2">
                    {selectedDoc.preview.sections.map((section, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Taille: {selectedDoc.size}</span>
                    <span>Pages: {selectedDoc.pages}</span>
                    <span>Catégorie: {selectedDoc.category}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Fermer
                </button>
                <a
                  href={selectedDoc.downloadUrl}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 text-center"
                >
                  ⬇️ Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}