'use client';

import React, { useState, useEffect } from 'react';
import { generateIrataPDF, downloadPDF } from '@/app/utils/pdfGenerator';

interface SignedDocument {
  id: string;
  name: string | null;
  address: string | null;
  signature: string | null;
  session?: string | null;
  adminSignature: string | null;
  adminSignedAt: string | null;
  status: string;
  createdAt: string;
  sentAt?: string;
}

interface Props {
  userEmail: string;
}

export default function UserSignedDocumentsClient({ userEmail }: Props) {
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchSignedDocuments();
  }, [userEmail]);

  const fetchSignedDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/documents/irata-signed?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des documents');
      }
      
      const data = await response.json();
      setSignedDocuments(data.documents || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (doc: SignedDocument) => {
    setDownloadingPDF(true);
    setError(null);

    try {
      const pdfBlob = await generateIrataPDF({
        id: doc.id,
        name: doc.name,
        address: doc.address,
        signature: doc.signature,
        adminSignature: doc.adminSignature,
        adminSignedAt: doc.adminSignedAt,
        createdAt: doc.createdAt
      });

      const filename = `IRATA_Disclaimer_Signe_${doc.name?.replace(/\s+/g, '_') || 'Document'}_${doc.id}.pdf`;
      downloadPDF(pdfBlob, filename);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mes Documents IRATA Signés</h1>
        <div className="text-center py-8">
          <p>Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mes Documents IRATA Signés</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mes Documents IRATA Signés</h1>

      {signedDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun document signé disponible pour le moment.</p>
          <p className="text-sm mt-2">Les documents signés par l'administrateur IRATA apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {signedDocuments.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
              {/* En-tête du document */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Déclaration de Non-responsabilité IRATA
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Soumis le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {doc.adminSignedAt && (
                      <p className="text-sm text-green-600 mt-1">
                        Signé par l'administrateur le {new Date(doc.adminSignedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      doc.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {doc.status === 'sent' ? 'Document envoyé' : 'Signé par admin'}
                    </span>
                    <button 
                      onClick={() => handleDownloadPDF(doc)}
                      disabled={downloadingPDF}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors no-print"
                    >
                      {downloadingPDF ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors no-print"
                    >
                      Imprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu du document */}
              <div className="p-6">
                {/* Document IRATA complet */}
                <div className="border border-gray-300 p-6 rounded-lg">
                  {/* Header du document original */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                      <p><strong>N° Doc. :</strong> FM014ENG</p>
                      <p><strong>Date d'émission :</strong> 01/07/19</p>
                      <p><strong>N° d'édition :</strong> 005</p>
                      <p><strong>Page 1 sur 1</strong></p>
                    </div>
                    <div className="col-span-1 text-center font-bold text-lg flex items-center justify-center">
                      DÉCLARATION DE NON-RESPONSABILITÉ <br /> ET DÉCHARGE DE RESPONSABILITÉ DU CANDIDAT
                    </div>
                    <div className="flex justify-end items-start">
                      <img src="/logo.png" alt="Logo IRATA International" className="h-16" />
                    </div>
                  </div>

                  {/* Informations candidat */}
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-3">Informations du candidat :</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Nom :</strong> {doc.name}</div>
                      <div><strong>N° IRATA :</strong> ENR-CIFRA-FORM 004</div>
                      <div><strong>Date :</strong> {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</div>
                      <div><strong>Session :</strong> {doc.session || 'Non spécifiée'}</div>
                      <div className="col-span-2"><strong>Adresse :</strong> {doc.address}</div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Signature candidat */}
                    <div>
                      <h4 className="font-semibold mb-3">Signature du candidat :</h4>
                      {doc.signature && (
                        <div className="border rounded p-4 bg-gray-50">
                          <img 
                            src={doc.signature} 
                            alt="Signature du candidat" 
                            className="max-h-32 mx-auto"
                          />
                        </div>
                      )}
                    </div>

                    {/* Signature administrateur */}
                    <div>
                      <h4 className="font-semibold mb-3">Signature de l'administrateur IRATA :</h4>
                      {doc.adminSignature && (
                        <div className="border rounded p-4 bg-gray-50">
                          <img 
                            src={doc.adminSignature} 
                            alt="Signature administrateur" 
                            className="max-h-32 mx-auto"
                          />
                          <p className="text-xs text-center text-gray-600 mt-2">
                            Signé le {new Date(doc.adminSignedAt!).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                    <p>NON CONTRÔLÉ LORS DE L'IMPRESSION</p>
                    <p className="mt-1">Document officiel signé par l'administrateur IRATA</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
