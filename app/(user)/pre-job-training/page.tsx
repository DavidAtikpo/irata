import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import PreJobTrainingFormClient from '@/app/(user)/pre-job-training/PreJobTrainingFormClient';

export default async function PreJobTrainingPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || '';
  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Pre-Job Training Form</h1>
      <p className="mb-4 text-sm">Veuillez remplir le formulaire de pré-job avant la réunion.</p>

      <PreJobTrainingFormClient />
    </div>
  );
}


