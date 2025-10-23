'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocumentIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface PDFData {
  id: string;
  url: string;
  title: string;
  uploadedAt: string;
  fileSize: number;
}

export default function PDFViewerPage() {
  const params = useParams();
  const pdfId = params.id as string;
  
  const [pdfData, setPdfData] = useState<PDFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pdfId) {
      fetchPDFData();
    }
  }, [pdfId]);

  const fetchPDFData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données du PDF depuis l'API
      const response = await fetch(`/api/pdf/${pdfId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document non trouvé');
        }
        throw new Error('Erreur lors du chargement du document');
      }
      
      const data = await response.json();
      setPdfData(data);
    } catch (error) {
      console.error('Erreur lors du chargement du PDF:', error);
      setError(error instanceof Error ? error.message : 'Impossible de charger le document');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfData?.url) {
      const link = document.createElement('a');
      link.href = pdfData.url;
      link.download = `${pdfData.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInNewTab = () => {
    if (pdfData?.url) {
      window.open(pdfData.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Document non trouvé</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Le document demandé n\'existe pas ou n\'est plus disponible.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{pdfData.title}</h1>
                <p className="text-sm text-gray-500">
                  Taille: {(pdfData.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Télécharger
              </button>
              
              <button
                onClick={openInNewTab}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Aperçu du document</h2>
          </div>
          
          <div className="p-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfData.url}
                className="w-full h-[600px] sm:h-[700px] lg:h-[800px]"
                title="PDF Viewer"
                onError={() => {
                  console.error('Erreur lors du chargement du PDF');
                  setError('Impossible d\'afficher le document. Il est peut-être corrompu ou protégé.');
                }}
              />
            </div>
            
            {/* Fallback si l'iframe ne fonctionne pas */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> Si le document ne s'affiche pas, cliquez sur "Ouvrir dans un nouvel onglet" 
                ou "Télécharger" pour l'accéder directement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
