"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';
import { generateIrataPDF, downloadPDF } from '@/app/utils/pdfGenerator';

type Submission = {
  id: string;
  name: string | null;
  address: string | null;
  signature: string | null;
  session?: string | null;
  user: any;
  createdAt: string;
  adminSignature?: string | null;
  adminSignedAt?: string | null;
  status: 'pending' | 'signed' | 'sent';
};

export default function AdminIrataDisclaimerPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminSignature, setAdminSignature] = useState('');
  const [signingLoading, setSigningLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/irata-disclaimer');
      if (!res.ok) throw new Error('Erreur lors de la récupération');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const signDocument = async (submissionId: string) => {
    if (!adminSignature) {
      setError('Veuillez fournir votre signature');
      return;
    }

    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          adminSignature,
          adminName: session?.user?.name || 'Administrateur'
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la signature');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      setSelectedSubmission(null);
      setAdminSignature('');
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const sendToUser = async (submissionId: string) => {
    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      });

      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: 'En attente',
      signed: 'Signé par admin',
      sent: 'Envoyé à l\'utilisateur'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[status as keyof typeof classes]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleDownloadPDF = async (submission: Submission) => {
    setDownloadingPDF(true);
    setError(null);

    try {
      const pdfBlob = await generateIrataPDF({
        id: submission.id,
        name: submission.name,
        address: submission.address,
        signature: submission.signature,
        adminSignature: submission.adminSignature || null,
        adminSignedAt: submission.adminSignedAt || null,
        createdAt: submission.createdAt
      });

      const filename = `IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf`;
      downloadPDF(pdfBlob, filename);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (selectedSubmission) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Signature Admin - IRATA Disclaimer</h1>
          <button
            onClick={() => setSelectedSubmission(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Retour
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Document complet */}
        <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-md mb-6">
          {/* Header du document */}
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

          {/* Contenu principal du document IRATA */}
          <div className="text-sm space-y-4 mb-6">
            <p>
              Ceci est un document important - veuillez le lire attentivement avant de le signer, car vous acceptez l'entière responsabilité de
              votre propre santé et condition médicale et déchargez l'IRATA, ses sociétés membres, et leur
              personnel respectif, les instructeurs de formation et les évaluateurs IRATA (collectivement dénommés <strong>Fournisseurs</strong>) de toute responsabilité.
            </p>
            <p>
              L'accès par corde en altitude ou en profondeur est une composante intrinsèque de la formation et de l'évaluation. Par conséquent, les candidats doivent être physiquement aptes et non affectés par toute condition médicale qui pourrait les empêcher d'entreprendre leurs exigences de formation et d'effectuer toute manœuvre requise pendant la formation et l'évaluation.
            </p>

            <h3 className="font-bold text-base mt-6 mb-3">Déclaration</h3>
            <p>
              Je déclare être en bonne santé, physiquement apte et me considérer comme apte à entreprendre une formation et une évaluation d'accès par corde. Je n'ai aucune condition médicale ou contre-indication qui pourrait m'empêcher de travailler en toute sécurité.
            </p>

            <h4 className="font-semibold text-sm mt-4 mb-2">Les principales contre-indications au travail en hauteur incluent (mais ne sont pas limitées à) :</h4>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
              <li>médicaments sur ordonnance pouvant altérer les fonctions physiques et/ou mentales ;</li>
              <li>dépendance à l'alcool ou aux drogues ;</li>
              <li>diabète, glycémie élevée ou basse ;</li>
              <li>hypertension ou hypotension ;</li>
              <li>épilepsie, crises ou périodes d'inconscience, par ex. évanouissements ;</li>
              <li>vertiges, étourdissements ou difficultés d'équilibre ;</li>
              <li>maladie cardiaque ou douleurs thoraciques ;</li>
              <li>fonction des membres altérée ;</li>
              <li>problèmes musculo-squelettiques, par ex. maux de dos ;</li>
              <li>maladie psychiatrique ;</li>
              <li>peur des hauteurs ;</li>
              <li>déficience sensorielle, par ex. cécité, surdité.</li>
            </ul>

            <h3 className="font-bold text-base mt-6 mb-3">Risque et Déni de Responsabilité</h3>
            <p>
              Je comprends que l'accès par corde en hauteur ou en profondeur, ainsi que la formation et l'évaluation y afférentes, comportent des risques pour ma personne et autrui de blessures corporelles (y compris l'invalidité permanente et le décès) en raison de la possibilité de chutes et de collisions, et qu'il s'agit d'une activité intense.
            </p>
            <p>
              En mon nom et au nom de ma succession, je décharge irrévocablement les Fournisseurs, leurs dirigeants et leur personnel de toutes responsabilités, réclamations, demandes et dépenses, y compris les frais juridiques découlant de ou en relation avec mon engagement dans la formation et l'évaluation d'accès par corde impliquant l'obtention de la certification IRATA.
            </p>

            <h4 className="font-semibold text-sm mt-4 mb-2">En signant cette déclaration, je garantis et reconnais que :</h4>
            <ol className="list-lower-alpha list-inside ml-4 space-y-1 text-sm">
              <li>les informations que j'ai fournies sont exactes et sur lesquelles les Fournisseurs s'appuieront ;</li>
              <li>au meilleur de mes connaissances et de ma conviction, l'engagement dans des activités d'accès par corde ne serait pas préjudiciable à ma santé, mon bien-être ou ma condition physique, ni à d'autres personnes qui pourraient être affectées par mes actes ou omissions ;</li>
              <li>une société membre a le droit de m'exclure de la formation et un évaluateur a le droit de m'exclure de l'évaluation, s'ils ont des préoccupations concernant ma santé, ma forme physique ou mon attitude envers la sécurité ;</li>
              <li>(sauf lorsque les Fournisseurs ne peuvent exclure leur responsabilité par la loi), j'accepte que cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat reste légalement contraignante même si les garanties et la déclaration données par moi sont fausses et j'accepte les risques impliqués dans l'entreprise de la formation et de l'évaluation ; et</li>
              <li>je conseillerai à l'IRATA si ma santé ou ma vulnérabilité à une blessure change et cesserai immédiatement les activités d'accès par corde, à moins d'approbation d'un médecin.</li>
            </ol>

            <p className="text-xs mt-4">
              Cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat sera interprétée et régie conformément au droit anglais et les parties se soumettent à la compétence exclusive des tribunaux anglais.
            </p>
          </div>

          {/* Informations utilisateur */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">Informations du candidat :</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Nom :</strong> {selectedSubmission.name}</div>
              <div><strong>N° IRATA :</strong> ENR-CIFRA-FORM 004</div>
              <div><strong>Date de soumission :</strong> {new Date(selectedSubmission.createdAt).toLocaleDateString('fr-FR')}</div>
              <div><strong>Session :</strong> {selectedSubmission.session || 'Non spécifiée'}</div>
              <div className="col-span-2"><strong>Adresse :</strong> {selectedSubmission.address}</div>
            </div>
          </div>

          {/* Signature utilisateur */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Signature du candidat :</h4>
            {selectedSubmission.signature && (
              <div className="border rounded p-2 bg-gray-50">
                <img 
                  src={selectedSubmission.signature} 
                  alt="Signature du candidat" 
                  className="max-h-32 mx-auto"
                />
              </div>
            )}
          </div>

          {/* Section signature admin */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Signature de l'administrateur IRATA :</h4>
            
            {selectedSubmission.adminSignature ? (
              <div className="space-y-4">
                <div className="border rounded p-4 bg-green-50">
                  <p className="text-sm text-green-700 mb-2">Document signé par l'administrateur le {new Date(selectedSubmission.adminSignedAt!).toLocaleDateString('fr-FR')}</p>
                  <img 
                    src={selectedSubmission.adminSignature} 
                    alt="Signature administrateur" 
                    className="max-h-32 mx-auto border"
                  />
                </div>
                
                {selectedSubmission.status === 'signed' && (
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleDownloadPDF(selectedSubmission)}
                      disabled={downloadingPDF}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {downloadingPDF ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                    <button
                      onClick={() => sendToUser(selectedSubmission.id)}
                      disabled={signingLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {signingLoading ? 'Envoi...' : 'Envoyer le document à l\'utilisateur'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Votre signature :</label>
                  <SignaturePad onSave={(data) => setAdminSignature(data)} />
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => signDocument(selectedSubmission.id)}
                    disabled={signingLoading || !adminSignature}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {signingLoading ? 'Signature...' : 'Signer le document'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Soumissions IRATA - Administration</h1>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune soumission pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-lg">{s.name || (s.user && s.user.name) || '—'}</p>
                    {getStatusBadge(s.status || 'pending')}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{s.address}</p>
                  <p className="text-sm text-blue-600 mb-1"><strong>Session :</strong> {s.session || 'Non spécifiée'}</p>
                  <p className="text-xs text-gray-500">Soumis le {new Date(s.createdAt).toLocaleString('fr-FR')}</p>
                  {s.adminSignedAt && (
                    <p className="text-xs text-green-600">Signé par admin le {new Date(s.adminSignedAt).toLocaleString('fr-FR')}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSubmission(s)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {s.adminSignature ? 'Voir document' : 'Signer'}
                  </button>
                  
                  {(s.status === 'signed' || s.status === 'sent') && (
                    <button
                      onClick={() => handleDownloadPDF(s)}
                      disabled={downloadingPDF}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      PDF
                    </button>
                  )}
                  
                  {s.status === 'signed' && (
                    <button
                      onClick={() => sendToUser(s.id)}
                      disabled={signingLoading}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Envoyer
                    </button>
                  )}
                </div>
              </div>

              {/* Aperçu des signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {s.signature && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Signature candidat :</h4>
                    <img 
                      src={s.signature} 
                      alt={`Signature ${s.name}`} 
                      className="max-h-20 border rounded bg-gray-50 mx-auto"
                    />
                  </div>
                )}
                
                {s.adminSignature && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Signature admin :</h4>
                    <img 
                      src={s.adminSignature} 
                      alt="Signature admin" 
                      className="max-h-20 border rounded bg-gray-50 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


