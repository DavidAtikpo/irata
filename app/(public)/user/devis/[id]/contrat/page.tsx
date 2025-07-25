import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContractForm } from '@/app/components/ContractForm';
import { redirect } from 'next/navigation';

export default async function ContratPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const devis = await prisma.devis.findUnique({
    where: { id },
    include: {
      demande: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!devis) {
    redirect('/user/devis');
  }

  if (devis.userId !== session.user.id) {
    redirect('/user/devis');
  }

  if (devis.statut !== 'VALIDE') {
    redirect('/user/devis');
  }

  const handleSubmit = async (data: any) => {
    'use server';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/contrat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la soumission du contrat');
    }

    return response.json();
  };

  return (
    <div className="container mx-auto py-8">
      <ContractForm devis={devis} onSubmit={handleSubmit} />
    </div>
  );
} 