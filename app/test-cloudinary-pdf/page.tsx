'use client';

import { useState } from 'react';

export default function TestCloudinaryPDF() {
  const [testUrl, setTestUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUrls = [
    'https://res.cloudinary.com/dubonservice/raw/upload/v1761261605/qr-generator/pdf_1761261605454.pdf',
    'https://res.cloudinary.com/dubonservice/raw/upload/v1761261605/qr-generator/pdf_1761261605454.pdf',
    'https://res.cloudinary.com/dubonservice/raw/upload/fl_attachment:inline/v1761261605/qr-generator/pdf_1761261605454.pdf',
    'https://res.cloudinary.com/dubonservice/raw/upload/v1761261605/qr-generator/pdf_1761261605454.pdf?fl_attachment:inline',
  ];

  const testUrlAccess = async (url: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      setResult({
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok
      });
    } catch (error) {
      setResult({
        url,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Test Cloudinary PDF Access</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">URLs de test</h2>
            <div className="space-y-2">
              {testUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <button
                    onClick={() => testUrlAccess(url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loading}
                  >
                    Tester
                  </button>
                  <code className="text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                    {url}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">URL personnalisée</h2>
            <div className="flex space-x-4">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Entrez une URL Cloudinary..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={() => testUrlAccess(testUrl)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading || !testUrl}
              >
                Tester
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Résultat du test</h2>
              <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="space-y-2">
                  <div>
                    <strong>URL:</strong> 
                    <code className="ml-2 text-sm bg-gray-100 p-1 rounded break-all">{result.url}</code>
                  </div>
                  <div>
                    <strong>Statut:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.status || 'Erreur'} {result.statusText || result.error}
                    </span>
                  </div>
                  {result.headers && (
                    <div>
                      <strong>Headers:</strong>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Test en cours...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




