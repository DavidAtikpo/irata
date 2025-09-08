'use client';

import React from "react";

export default function ConvocationPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen text-sm text-gray-800">
      {/* En-tête spécifique aux convocations */}
      <div className="border p-4 bg-white shadow rounded-md mb-6">
        <div className="flex flex-col sm:flex-row items-start">
          <div className="mr-4 flex-shrink-0 mb-4 sm:mb-0">
            <img src="/logo.png" alt="CI.DES Logo" className="w-16 h-20 object-contain" />
          </div>
          <div className="flex-1">
            <table className="w-full border-collapse text-xs mt-3">
              <tbody>
                <tr>
                  <td className="border p-1 font-bold">Titre</td>
                  <td className="border p-1 font-bold">Numéro de code</td>
                  <td className="border p-1 font-bold">Révision</td>
                  <td className="border p-1 font-bold">Création date</td>
                </tr>
                <tr>
                  <td className="border p-1">CLIDES CONVOCATION</td>
                  <td className="border p-1">ENR-CFRA-HSE 013</td>
                  <td className="border p-1">02</td>
                  <td className="border p-1">09/10/2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-lg font-bold border py-2 bg-gray-50">
        CONVOCATION DES ARRIVANTS
      </h1>

      <div className="my-4">
        <p><strong>Diffusion :</strong> ....................................................</p>
        <p><strong>Copy :</strong> ....................................................</p>
      </div>

      {/* Validation */}
      <h2 className="text-md font-semibold mt-6 mb-2">VALIDATION</h2>
      <table className="w-full border text-xs">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-1">Nom</th>
            <th className="border p-1">Rédigé par</th>
            <th className="border p-1">Revu par</th>
            <th className="border p-1">Approuvé par</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-1">Laurent ARDOUIN</td>
            <td className="border p-1">Laurent ARDOUIN</td>
            <td className="border p-1">Dimitar Aleksandrov MATEEB</td>
            <td className="border p-1">Laurent ARDOUIN</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs mt-2">Date : 09/10/2023 | Signature : <span className="text-red-600">Original Signed</span></p>

      <h2 className="text-md font-semibold mt-6">1. BIENVENUE AU CENTRE CLIDES</h2>
      <h3 className="font-semibold mt-2">1.1. PREAMBULE</h3>
      <p className="mb-2">
        Afin de rendre votre séjour agréable et de vous permettre de travailler en toute sécurité, 
        nous vous demandons de prêter attention aux mesures et instructions.
      </p>

      <h3 className="font-semibold mt-2">1.1.1. OBJECTIF DE LA CONVOCATION</h3>
      <ul className="list-disc ml-6 mb-2">
        <li>Les conditions et documents nécessaires pour suivre la formation</li>
        <li>Leur organisation de voyage</li>
        <li>Leur voyage</li>
        <li>Les consignes, les règles applicables de vie</li>
      </ul>

      <p>
        Ce formulaire est envoyé au stagiaire une fois l'inscription validée.
      </p>

      <h3 className="font-semibold mt-2">1.1.2. Numéros d’Urgence</h3>
      <ul className="list-disc ml-6">
        <li>15 : SAMU</li>
        <li>112 ou 18 : POMPIERS</li>
        <li>17 : POLICE</li>
      </ul>

      <h3 className="font-semibold mt-2">1.1.3. POUR TOUTES INFORMATIONS</h3>
      <p>
        Contact : <a href="mailto:pm@clides.fr" className="text-blue-600 underline">pm@clides.fr</a> 
        / +33 (0)7 45 373 107 / Laurent ARDOUIN
      </p>

      <h2 className="text-md font-semibold mt-6">2. CONDITIONS PREALABLES POUR SUIVRE LA FORMATION</h2>
      <ul className="list-disc ml-6">
        <li>Être âgé d’au moins 18 ans.</li>
        <li>Pièce d’identité en cours de validité.</li>
        <li>1 photo d’identité scannée.</li>
        <li>Être en bonne forme physique sans contre-indications médicales.</li>
        <li>Attestation d’assurance responsabilité civile.</li>
      </ul>

      <h2 className="text-md font-semibold mt-6">4. LOCALISATION GEOGRAPHIQUE</h2>
      <p><strong>Adresse :</strong> Chez chagneau, 1 Route des Arsicots, 17 270 BORESSE ET MARTRON</p>
      <p><strong>Coordonnées GPS :</strong> Latitude 45.285147 ; Longitude –0.145266</p>

      <h2 className="text-md font-semibold mt-6">5. GUEST-HOUSE</h2>
      <p>
        CLIDES met à disposition un Guest pour les personnes qui valident cette option :
      </p>
      <ul className="list-disc ml-6">
        <li>Chambre individuelle simple</li>
        <li>Partie vie commune en “open space” salon cuisine de 60 m²</li>
        <li>Respecter les règles de vie en communauté</li>
      </ul>

      <h2 className="text-md font-semibold mt-6">6. ANNEXES</h2>
      <h3 className="font-semibold">6.1. PHOTOS SITUATION ITINERAIRE</h3>
      <img
        src="/map.png"
        alt="Carte Itinéraire"
        className="w-full rounded-md shadow mt-2"
      />
    </div>
  );
}
