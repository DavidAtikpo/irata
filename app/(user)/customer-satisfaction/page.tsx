'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import EnvironmentReceptionForm from '@/app/components/customer-satisfaction/EnvironmentReceptionForm';
import EquipmentForm from '@/app/components/customer-satisfaction/EquipmentForm';
import TrainingPedagogyForm from '@/app/components/customer-satisfaction/TrainingPedagogyForm';

type FormType = 'ENVIRONMENT_RECEPTION' | 'EQUIPMENT' | 'TRAINING_PEDAGOGY';

export default function CustomerSatisfactionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<FormType>('ENVIRONMENT_RECEPTION');
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [sharedSignature, setSharedSignature] = useState<string>('');
  const [envData, setEnvData] = useState<any>(null);
  const [equipData, setEquipData] = useState<any>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà soumis les formulaires
    const checkSubmissionStatus = async () => {
      try {
        const response = await fetch('/api/user/customer-satisfaction/status');
        if (response.ok) {
          const data = await response.json();
          if (data.submitted) {
            setIsSubmitted(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    if (status === 'authenticated') {
      checkSubmissionStatus();
    }
  }, [status]);

  // Charger les données persistées depuis localStorage
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const savedEnvData = localStorage.getItem('customer-satisfaction-env');
        const savedEquipData = localStorage.getItem('customer-satisfaction-equip');
        const savedTrainingData = localStorage.getItem('customer-satisfaction-training');
        
        if (savedEnvData) {
          setEnvData(JSON.parse(savedEnvData));
        }
        if (savedEquipData) {
          setEquipData(JSON.parse(savedEquipData));
        }
        if (savedTrainingData) {
          setTrainingData(JSON.parse(savedTrainingData));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données persistées:', error);
      }
    };

    loadPersistedData();
  }, []);

  const today = new Date().toLocaleDateString('fr-FR');
  const [traineeName, setTraineeName] = useState('');

  // Callback stable pour onDataChange
  const handleTrainingDataChange = useCallback((data: any) => {
    setTrainingData(data);
    localStorage.setItem('customer-satisfaction-training', JSON.stringify(data));
  }, []);

  // Récupérer le nom de l'utilisateur depuis le profil
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          let fullName = '';
          if (data?.user?.prenom && data?.user?.nom) {
            fullName = `${data.user.prenom} ${data.user.nom}`;
          } else if (data?.user?.name) {
            fullName = data.user.name;
          } else if (data?.user?.nom) {
            fullName = data.user.nom;
          } else if (data?.user?.prenom) {
            fullName = data.user.prenom;
          }
          
          if (fullName) {
            setTraineeName(fullName);
          } else {
            setTraineeName(data?.user?.email || 'Utilisateur');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setTraineeName('Utilisateur');
      }
    };

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h1 className="text-xl font-semibold mb-3">Questionnaire de satisfaction client</h1>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Choisissez un formulaire:</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selected}
              onChange={(e) => setSelected(e.target.value as FormType)}
            >
              <option value="ENVIRONMENT_RECEPTION">Environnement et réception</option>
              <option value="EQUIPMENT">les équipements d entraînement</option>
              <option value="TRAINING_PEDAGOGY">Equipe pédagogique et le programme</option>
            </select>
          </div>
        </div>

        {/* Formulaires avec navigation responsive */}
        <div className="space-y-4 sm:space-y-6">
          {selected === 'ENVIRONMENT_RECEPTION' && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Étape 1/3 : Environnement et réception
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <EnvironmentReceptionForm
                  date={today}
                  traineeName={traineeName}
                  step={step}
                  totalSteps={totalSteps}
                  onNext={() => {
                    setSelected('EQUIPMENT');
                    setStep(2);
                  }}
                  onNextWithData={(data) => {
                    setEnvData(data);
                    localStorage.setItem('customer-satisfaction-env', JSON.stringify(data));
                  }}
                  onPrev={() => {
                    // at step 1, prev does nothing
                  }}
                />
              </div>
            </div>
          )}

          {selected === 'EQUIPMENT' && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Étape 2/3 : Équipements d'entraînement
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <EquipmentForm
                  date={today}
                  traineeName={traineeName}
                  step={step}
                  totalSteps={totalSteps}
                  onPrev={() => {
                    setSelected('ENVIRONMENT_RECEPTION');
                    setStep(1);
                  }}
                  onNext={() => {
                    setSelected('TRAINING_PEDAGOGY');
                    setStep(3);
                  }}
                  onNextWithData={(data) => {
                    setEquipData(data);
                    localStorage.setItem('customer-satisfaction-equip', JSON.stringify(data));
                  }}
                />
              </div>
            </div>
          )}

          {selected === 'TRAINING_PEDAGOGY' && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Étape 3/3 : Équipe pédagogique et programme
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <TrainingPedagogyForm
                  date={today}
                  traineeName={traineeName}
                  aggregated={{ env: envData, equip: equipData }}
                  onDataChange={handleTrainingDataChange}
                  onSubmitAll={() => {
                    // After all three submissions success
                    setIsSubmitted(true);
                    setSelected('ENVIRONMENT_RECEPTION');
                    setStep(1);
                    setEnvData(null);
                    setEquipData(null);
                    setTrainingData(null);
                    // Nettoyer le localStorage après soumission
                    localStorage.removeItem('customer-satisfaction-env');
                    localStorage.removeItem('customer-satisfaction-equip');
                    localStorage.removeItem('customer-satisfaction-training');
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation des étapes responsive */}
        {/* <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base text-gray-600">Étape :</span>
              <span className="text-sm sm:text-base font-medium text-blue-600">
                {step} sur {totalSteps}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                    if (step === 2) setSelected('ENVIRONMENT_RECEPTION');
                    if (step === 3) setSelected('EQUIPMENT');
                  }
                }}
                disabled={step === 1}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                ← Précédent
              </button>
              
              <button
                onClick={() => {
                  if (step < totalSteps) {
                    setStep(step + 1);
                    if (step === 1) setSelected('EQUIPMENT');
                    if (step === 2) setSelected('TRAINING_PEDAGOGY');
                  }
                }}
                disabled={step === totalSteps}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}


