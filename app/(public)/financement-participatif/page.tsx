'use client';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

const XOF_PER_EUR = 655.957;
const toEUR = (xof: number) => Math.round(xof / XOF_PER_EUR);
const formatEUR = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const financingOptions = [
  {
    id: 'preformation',
    title: '🎓 Pré-financement Formation',
    description: 'Investissez dans votre future formation avec une remise de 10%',
    icon: '📚',
    baseReturn: 10,
    returnType: 'discount',
    minAmount: Math.round(50000 / 655.957),
    maxAmount: Math.round(500000 / 655.957),
    currency: 'EUR'
  },
  {
    id: 'financial',
    title: '💰 Don Financier à Rendement',
    description: 'Recevez 8% de rendement en maximum 4 mois',
    icon: '💸',
    baseReturn: 8,
    returnType: 'interest',
    minAmount: Math.round(100000 / 655.957),
    maxAmount: Math.round(1000000 / 655.957),
    currency: 'EUR'
  },
  {
    id: 'material',
    title: '🎁 Récompenses Matérielles',
    description: 'Recevez des objets de marque exclusifs du centre',
    icon: '🏆',
    baseReturn: 0,
    returnType: 'material',
    minAmount: Math.round(25000 / 655.957),
    maxAmount: Math.round(200000 / 655.957),
    currency: 'EUR'
  }
];

type CalculatorProps = {
  option: typeof financingOptions[0];
};

function Calculator({ option }: CalculatorProps) {
  const [amount, setAmount] = useState(option.minAmount);
  
  const calculateReturn = () => {
    if (option.returnType === 'discount') {
      return amount + (amount * option.baseReturn / 100);
    } else if (option.returnType === 'interest') {
      return amount + (amount * option.baseReturn / 100);
    }
    return amount;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{option.icon}</span>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">{option.title}</h3>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm sm:text-base">{option.description}</p>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Montant du don (€)
        </label>
        <input
          type="number"
          min={option.minAmount}
          max={option.maxAmount}
          step={5}
          value={amount}
          onChange={(e) => setAmount(Math.max(option.minAmount, Math.min(option.maxAmount, parseInt(e.target.value) || option.minAmount)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
        />
        <p className="text-xs text-gray-500 mt-1">
          Min: {formatCurrency(option.minAmount)} - Max: {formatCurrency(option.maxAmount)}
        </p>
      </div>

      {option.returnType !== 'material' && (
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
            {option.returnType === 'discount' ? 'Remise obtenue' : 'Montant remboursé'}
          </h4>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {formatCurrency(calculateReturn())}
          </div>
          {option.returnType === 'discount' && (
            <p className="text-xs sm:text-sm text-green-700 mt-1">
              Économie: {formatCurrency(calculateReturn() - amount)}
            </p>
          )}
          {option.returnType === 'interest' && (
            <p className="text-xs sm:text-sm text-green-700 mt-1">
              Gain: {formatCurrency(calculateReturn() - amount)}
            </p>
          )}
        </div>
      )}

      <button className="w-full bg-green-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-green-700 transition duration-300 text-sm sm:text-base">
        Contribuer {formatCurrency(amount)}
      </button>
    </div>
  );
}

function ProjectVideo() {
  return (
    <div className="bg-gray-100 rounded-xl p-6 sm:p-8 text-center">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
        🎥 Vidéo de Présentation du Projet
      </h3>
      <div className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-2">🏗️</div>
          <p className="text-gray-600 text-sm sm:text-base">
            Vidéo de présentation<br />
            (Bâtiment à 95%, salles, structure d'entraînement, équipe)
          </p>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600">
        Durée: 1-2 minutes • Découvrez notre centre en construction
      </p>
    </div>
  );
}

export default function FinancementParticipatif() {
  const [activeTab, setActiveTab] = useState('projet');

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-2xl sm:rounded-3xl shadow-lg px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
          🎯 Centre de Multi Formations en Sécurité
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-2 font-semibold opacity-90">
          Aidez-nous à équiper l'un des premiers centres du Togo
        </p>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base opacity-80">
          Matériel cordiste IRATA • Appareil à ultrasons CND • Équipement SST
        </p>
        
        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-4 sm:h-6 mb-4 max-w-md mx-auto">
          <div className="bg-yellow-400 h-full rounded-full" style={{ width: '5%' }}>
            <span className="sr-only">5% financé</span>
          </div>
        </div>
        <div className="flex justify-between text-xs sm:text-sm opacity-90 max-w-md mx-auto">
          <span>5% financé</span>
          <span>Objectif: {formatEUR(toEUR(15000000))}</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex flex-wrap justify-center -mb-px">
          {[
            { id: 'projet', label: '📋 Le Projet', icon: '🏗️' },
            { id: 'financement', label: '💰 Financement', icon: '💳' },
            { id: 'avantages', label: '🎁 Avantages', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeTab === 'projet' && (
        <section className="space-y-8 sm:space-y-12">
          {/* Video Section */}
          <ProjectVideo />

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                🌍 Histoire et Contexte
              </h2>
              <p className="mb-4 text-sm sm:text-base text-gray-700">
                Ce projet innovant vise à créer l'un des premiers centres de multi formations en sécurité au Togo. 
                Avec un bâtiment avancé à 95%, nous sommes prêts à équiper les salles de cours, 
                la structure d'entraînement et les futurs logements.
              </p>
              <p className="mb-6 text-sm sm:text-base text-gray-700">
                Cette initiative créera de nombreuses opportunités d'emploi pour les jeunes togolais 
                et développera les compétences locales dans les domaines de la sécurité industrielle.
              </p>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">🎯 Objectifs du Projet</h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700">
                <li>Acquisition matériel Cordiste certifié, aux normes avec certificat de conformité et de contrôle</li>
                <li>Acquisition de 6 appareils complémentaires ultra son pour contrôles non destructifs (CND)</li>
                <li>Équipement complet en matériel de Santé et Sécurité au Travail (SST)</li>
                <li>Formation d une équipe locale de formateurs pour qu ils deviennent les référents de nos formations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                📊 Plan de Financement
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Matériel Cordiste IRATA</h4>
                  <div className="flex justify-between text-sm">
                    <span>Budget nécessaire:</span>
                    <span className="font-semibold">{formatEUR(toEUR(8000000))}</span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Appareil Ultrasons CND</h4>
                  <div className="flex justify-between text-sm">
                    <span>Budget nécessaire:</span>
                    <span className="font-semibold">{formatEUR(toEUR(4000000))}</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Équipement SST</h4>
                  <div className="flex justify-between text-sm">
                    <span>Budget nécessaire:</span>
                    <span className="font-semibold">{formatEUR(toEUR(3000000))}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3 text-gray-800">⏰ Échéancier</h3>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <div className="flex justify-between border-b pb-1">
                  <span>Phase 1 - Financement:</span>
                  <span className="font-semibold">Septembre 2025</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Phase 2 - Équipement:</span>
                  <span className="font-semibold"> fin Octobre 2025</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Phase 3 - Ouverture:</span>
                  <span className="font-semibold">debut Decembre 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'financement' && (
        <section id="contribuer">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
            💰 Formes de Financement Participatif
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {financingOptions.map((option) => (
              <Calculator key={option.id} option={option} />
            ))}
          </div>

          <div className="mt-8 sm:mt-12 bg-gray-50 p-6 sm:p-8 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 text-center">
              📞 Vous avez des questions ?
            </h3>
            <div className="text-center">
              <p className="mb-4 text-sm sm:text-base text-gray-700">
                Notre équipe est là pour vous accompagner dans votre contribution
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Nous Contacter
                </Link>
                <span className="text-gray-600 text-sm">
                  ecrivez-nous à: gm@cides.tf
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'avantages' && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
            🎁 Avantages pour nos Contributeurs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-800 flex items-center">
                🏆 Reconnaissance Publique
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-blue-700">
                <li>• Mention sur notre site web officiel</li>
                <li>• Publication sur nos réseaux sociaux</li>
                <li>• Certificat de reconnaissance officiel</li>
                <li>• Newsletter exclusive des donateurs</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-green-800 flex items-center">
                🎯 Accès Exclusifs
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-green-700">
                <li>• Visite privée du centre de formation</li>
                <li>• Ateliers gratuits sur la sécurité</li>
                <li>• Invitations aux événements spéciaux</li>
                <li>• Consultations gratuites en sécurité</li>
              </ul>
            </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-purple-800 flex items-center">
                    🎁 Récompenses Matérielles
                  </h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-purple-400 pl-3">
                      <p className="font-semibold text-purple-700">{formatEUR(toEUR(25000))} - {formatEUR(toEUR(50000))}</p>
                      <p className="text-sm text-purple-600">Mug + Stylos de marque</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-3">
                      <p className="font-semibold text-purple-700">{formatEUR(toEUR(50000))} - {formatEUR(toEUR(100000))}</p>
                      <p className="text-sm text-purple-600">T-shirt + Sac à dos de marque</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-3">
                      <p className="font-semibold text-purple-700">{formatEUR(toEUR(100000))}+</p>
                      <p className="text-sm text-purple-600">Kit complet + Casquette premium</p>
                    </div>
                  </div>
                </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 sm:p-8 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-yellow-800 flex items-center">
                🏗️ Nommage d'Équipements
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-yellow-700">
                <li>• Don de 50K FCFA: Votre nom sur un équipement</li>
                <li>• Don de 500K FCFA: Nommage d'une salle de cours</li>
                <li>• Don de 1M FCFA: Nommage d'une salle de cours</li>
                <li>• Don de 2M FCFA: Plaque commémorative permanente</li>
                <li>• Don de 5M FCFA: Parrain officiel du centre</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-500 to-teal-400 text-white p-6 sm:p-8 rounded-xl text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">
              🚀 Rejoignez l'Aventure !
            </h3>
            <p className="mb-6 text-sm sm:text-base opacity-90">
              Chaque contribution compte pour développer les compétences en sécurité au Togo
            </p>
            <Link 
              href="#contribuer"
              className="inline-block bg-white text-green-600 font-semibold px-6 sm:px-8 py-3 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
            >
              Contribuer Maintenant
            </Link>
          </div>
        </section>
      )}
      </main>
    </div>
  );
}