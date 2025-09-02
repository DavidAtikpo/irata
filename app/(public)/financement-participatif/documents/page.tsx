'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  description: string;
  size: string;
  pages: string;
  category: string;
  downloadUrl: string;
    preview: {
    sections: string[];
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  certifications: string[];
  photo: string;
  email: string;
  linkedin?: string;
}

export default function DocumentsFinancement() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['all', 'Stratégie', 'Légal', 'Finances', 'Qualité', 'Infrastructure', 'Risques'];

  useEffect(() => {
    fetchDocuments();
    fetchTeamMembers();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents/financement-participatif');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Erreur fetch documents:', err);
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team/members');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'équipe');
      }
      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (err) {
      console.error('Erreur fetch team:', err);
      // Ne pas afficher d'erreur pour l'équipe, utiliser les données par défaut
    }
  };

  const handleDownload = async (documentId: string, downloadUrl: string) => {
    try {
      // Télécharger le fichier directement
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Erreur téléchargement:', err);
    }
  };
  
  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun document disponible</h3>
            <p className="text-gray-500">Les documents seront bientôt disponibles dans cette catégorie.</p>
          </div>
        ) : (
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
                    <button
                      onClick={() => handleDownload(doc.id, doc.downloadUrl)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition duration-200"
                  >
                    ⬇️ Télécharger
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Team Section */}
        {teamMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            👥 Équipe de Direction
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                    )}
                </div>
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 mb-2">{member.experience}</p>
                  <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {member.certifications.map((cert, certIdx) => (
                    <span key={certIdx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-indigo-600 text-sm hover:text-indigo-800"
                    >
                      {member.email}
                    </a>
                  )}
              </div>
            ))}
          </div>
        </div>
        )}

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

        {/* Bouton temporaire pour créer les données de test */}
        {documents.length === 0 && (
          <div className="bg-yellow-50 rounded-lg p-6 text-center border border-yellow-200 mt-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              🚀 Configuration Initiale
            </h3>
            <p className="text-yellow-700 mb-4">
              Aucun document n'est encore disponible. Cliquez ci-dessous pour créer des documents de démonstration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/documents/seed', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                      alert('Documents créés avec succès !');
                      fetchDocuments();
                    } else {
                      alert(data.message || 'Erreur lors de la création des documents');
                    }
                  } catch (err) {
                    alert('Erreur lors de la création des documents');
                  }
                }}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition duration-300"
              >
                📄 Créer Documents de Test
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/team/seed', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                      alert('Membres d\'équipe créés avec succès !');
                      fetchTeamMembers();
                    } else {
                      alert(data.message || 'Erreur lors de la création des membres');
                    }
                  } catch (err) {
                    alert('Erreur lors de la création des membres d\'équipe');
                  }
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
              >
                👥 Créer Équipe de Test
              </button>
            </div>
          </div>
        )}

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
                <button
                  onClick={() => {
                    handleDownload(selectedDoc.id, selectedDoc.downloadUrl);
                    setSelectedDoc(null);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
                >
                  ⬇️ Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}