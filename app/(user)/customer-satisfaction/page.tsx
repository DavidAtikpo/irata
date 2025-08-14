'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const today = new Date().toLocaleDateString('fr-FR');
  const traineeName = `${session?.user?.prenom ?? ''} ${session?.user?.nom ?? ''}`.trim();

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
              <option value="ENVIRONMENT_RECEPTION">Cadre, environnement & accueil</option>
              <option value="EQUIPMENT">Équipements de formation</option>
              <option value="TRAINING_PEDAGOGY">Pédagogie & formation</option>
            </select>
          </div>
        </div>

        {selected === 'ENVIRONMENT_RECEPTION' && (
          <EnvironmentReceptionForm date={today} traineeName={traineeName} />
        )}
        {selected === 'EQUIPMENT' && (
          <EquipmentForm date={today} traineeName={traineeName} />
        )}
        {selected === 'TRAINING_PEDAGOGY' && (
          <TrainingPedagogyForm date={today} traineeName={traineeName} />
        )}
      </div>
    </div>
  );
}


