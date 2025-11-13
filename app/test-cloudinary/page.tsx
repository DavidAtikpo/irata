'use client';

import { useState } from 'react';

export default function TestCloudinaryPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const testUrls = [
    {
      name: 'Raw avec extension',
      url: 'https://res.cloudinary.com/dubonservice/raw/upload/qr-generator/pdf_1761235265179.pdf'
    },
    {
      name: 'Raw sans extension',
      url: 'https://res.cloudinary.com/dubonservice/raw/upload/qr-generator/pdf_1761235265179'
    },
    {
      name: 'Image avec extension',
      url: 'https://res.cloudinary.com/dubonservice/image/upload/qr-generator/pdf_1761235265179.pdf'
    },
    {
      name: 'Image sans extension',
      url: 'https://res.cloudinary.com/dubonservice/image/upload/qr-generator/pdf_1761235265179'
    },
    {
      name: 'Auto avec extension',
      url: 'https://res.cloudinary.com/dubonservice/upload/qr-generator/pdf_1761235265179.pdf'
    },
  ];

  const testAllUrls = async () => {
    setTesting(true);
    const results = [];

    for (const test of testUrls) {
      try {
        const response = await fetch(test.url, { method: 'HEAD' });
        results.push({
          name: test.name,
          url: test.url,
          status: response.status,
          success: response.ok,
          contentType: response.headers.get('content-type'),
        });
      } catch (error) {
        results.push({
          name: test.name,
          url: test.url,
          status: 'Error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Cloudinary PDF Access
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Cliquez sur "Tester toutes les URLs" pour vérifier l'accès</li>
            <li>Les URLs avec statut 200 (vert) sont accessibles</li>
            <li>Les URLs avec statut 401/404 (rouge) ne sont pas accessibles</li>
            <li>Essayez de cliquer sur les URLs vertes pour voir le PDF</li>
          </ol>
        </div>

        <button
          onClick={testAllUrls}
          disabled={testing}
          className="mb-6 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {testing ? 'Test en cours...' : 'Tester toutes les URLs'}
        </button>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Content-Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {result.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.contentType || result.error || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {result.success ? (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ouvrir
                        </a>
                      ) : (
                        <span className="text-gray-400">Non accessible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            💡 Que faire si aucune URL ne fonctionne ?
          </h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800 text-sm">
            <li>Vérifiez que le fichier existe sur votre dashboard Cloudinary</li>
            <li>Vérifiez que le fichier est marqué comme "Public"</li>
            <li>Désactivez "Strict transformations" dans Settings → Security</li>
            <li>Essayez de re-uploader le PDF après le dernier déploiement</li>
            <li>Contactez le support Cloudinary si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

















