'use client';

import React, { useState, useEffect } from 'react';
import SignaturePad from '@/components/SignaturePad';
import { useSession } from 'next-auth/react';

export default function IrataDisclaimerPage() {
  const { data: session } = useSession();
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setUserName(session?.user?.name || '');
    setCurrentDate(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY format
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here, send data to API endpoint
    const formData = {
      name: userName,
      address,
      signature,
      date: currentDate,
      irataNo: 'ENR-CIFRA-FORM 004',
    };
    
    try {
      const response = await fetch('/api/documents/irata-disclaimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Document submitted successfully!');
        // Optionally, redirect or clear form
      } else {
        alert('Failed to submit document.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="border border-gray-300 p-6 rounded-lg shadow-md">
        {/* Header Section */}
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
            {/* Placeholder for IRATA logo */}
            <img src="/logo.png" alt="Logo IRATA International" className="h-16" />
          </div>
        </div>

        {/* Main Content */}
        <p className="mb-4 text-sm">
          Ceci est un document important - veuillez le lire attentivement avant de le signer, car vous acceptez l'entière responsabilité de
          votre propre santé et condition médicale et déchargez l'IRATA, ses sociétés membres, et leur
          personnel respectif, les instructeurs de formation et les évaluateurs IRATA (collectivement dénommés <strong>Fournisseurs</strong>) de toute responsabilité.
        </p>
        <p className="mb-4 text-sm">
          L'accès par corde en altitude ou en profondeur est une composante intrinsèque de la formation et de l'évaluation. Par conséquent, les candidats doivent être physiquement aptes et non affectés par toute condition médicale qui pourrait les empêcher d'entreprendre leurs exigences de formation et d'effectuer toute manœuvre requise pendant la formation et l'évaluation.
        </p>

        <h2 className="font-bold text-md mb-2">Déclaration</h2>
        <p className="mb-4 text-sm">
          Je déclare être en bonne santé, physiquement apte et me considérer comme apte à entreprendre une formation et une évaluation d'accès par corde. Je n'ai aucune condition médicale ou contre-indication qui pourrait m'empêcher de travailler en toute sécurité.
        </p>

        <h3 className="font-semibold text-sm mb-2">Les principales contre-indications au travail en hauteur incluent (mais ne sont pas limitées à) :</h3>
        <ul className="list-disc list-inside ml-4 mb-4 text-sm">
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

        <h2 className="font-bold text-md mb-2">Risque et Déni de Responsabilité</h2>
        <p className="mb-4 text-sm">
          Je comprends que l'accès par corde en hauteur ou en profondeur, ainsi que la formation et l'évaluation y afférentes, comportent des risques pour ma personne et autrui de blessures corporelles (y compris l'invalidité permanente et le décès) en raison de la possibilité de chutes et de collisions, et qu'il s'agit d'une activité intense.
        </p>
        <p className="mb-4 text-sm">
          En mon nom et au nom de ma succession, je décharge irrévocablement les Fournisseurs, leurs dirigeants et leur personnel de toutes responsabilités, réclamations, demandes et dépenses, y compris les frais juridiques découlant de ou en relation avec mon engagement dans la formation et l'évaluation d'accès par corde impliquant l'obtention de la certification IRATA.
        </p>

        <h3 className="font-semibold text-sm mb-2">En signant cette déclaration, je garantis et reconnais que :</h3>
        <ol className="list-lower-alpha list-inside ml-4 mb-6 text-sm">
          <li>les informations que j'ai fournies sont exactes et sur lesquelles les Fournisseurs s'appuieront ;</li>
          <li>au meilleur de mes connaissances et de ma conviction, l'engagement dans des activités d'accès par corde ne serait pas préjudiciable à ma santé, mon bien-être ou ma condition physique, ni à d'autres personnes qui pourraient être affectées par mes actes ou omissions ;</li>
          <li>une société membre a le droit de m'exclure de la formation et un évaluateur a le droit de m'exclure de l'évaluation, s'ils ont des préoccupations concernant ma santé, ma forme physique ou mon attitude envers la sécurité ;</li>
          <li>(sauf lorsque les Fournisseurs ne peuvent exclure leur responsabilité par la loi), j'accepte que cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat reste légalement contraignante même si les garanties et la déclaration données par moi sont fausses et j'accepte les risques impliqués dans l'entreprise de la formation et de l'évaluation ; et</li>
          <li>je conseillerai à l'IRATA si ma santé ou ma vulnérabilité à une blessure change et cesserai immédiatement les activités d'accès par corde, à moins d'approbation d'un médecin.</li>
        </ol>

        <p className="mb-6 text-sm">
          Cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat sera interprétée et régie conformément au droit anglais et les parties se soumettent à la compétence exclusive des tribunaux anglais.
        </p>

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700">Nom :</label>
              <input
                type="text"
                id="name"
                value={userName}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="irataNo" className="block font-medium text-gray-700">N° IRATA :</label>
              <input
                type="text"
                id="irataNo"
                value="ENR-CIFRA-FORM 004"
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-4 text-sm">
            <label htmlFor="address" className="block font-medium text-gray-700">Adresse :</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <label htmlFor="signature" className="block font-medium text-gray-700">Signature :</label>
              <SignaturePad onSave={setSignature} />
            </div>
            <div>
              <label htmlFor="date" className="block font-medium text-gray-700">Date :</label>
              <input
                type="text"
                id="date"
                value={currentDate}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Soumettre la Déclaration de Non-responsabilité
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">NON CONTRÔLÉ LORS DE L'IMPRESSION</p>
      </div>
    </div>
  );
}
