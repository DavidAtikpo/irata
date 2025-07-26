import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

async function getStats() {
  const [
    totalDemandes,
    demandesEnAttente,
    totalDevis,
    devisEnAttente,
    totalContrats,
    contratsEnAttente,
    montantTotalDevis,
    montantTotalContrats
  ] = await Promise.all([
    prisma.demande.count(),
    prisma.demande.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.devis.count(),
    prisma.devis.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.contrat.count(),
    prisma.contrat.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.devis.aggregate({
      where: { statut: 'VALIDE' },
      _sum: { montant: true }
    }),
    prisma.contrat.findMany({
      where: { statut: 'VALIDE' },
      include: {
        devis: {
          select: { montant: true }
        }
      }
    })
  ]);

  return {
    totalDemandes,
    demandesEnAttente,
    totalDevis,
    devisEnAttente,
    totalContrats,
    contratsEnAttente,
    montantTotalDevis: montantTotalDevis._sum?.montant || 0,
    montantTotalContrats: montantTotalContrats.reduce((sum: number, contrat: any) => sum + (contrat.devis?.montant || 0), 0)
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const stats = await getStats();

  const cards = [
    {
      name: 'Demandes',
      value: stats.totalDemandes,
      pending: stats.demandesEnAttente,
      icon: ClipboardDocumentListIcon,
      href: '/admin/demandes',
    },
    {
      name: 'Devis',
      value: stats.totalDevis,
      pending: stats.devisEnAttente,
      icon: DocumentTextIcon,
      href: '/admin/devis',
    },
    {
      name: 'Contrats',
      value: stats.totalContrats,
      pending: stats.contratsEnAttente,
      icon: DocumentDuplicateIcon,
      href: '/admin/contrats',
    },
    {
      name: 'Montant Total',
      value: `${(stats.montantTotalDevis + stats.montantTotalContrats).toLocaleString('fr-FR')} €`,
      icon: BanknotesIcon,
      href: '/admin/devis',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.name}
            href={card.href}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {card.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {card.value}
              </p>
              {card.pending !== undefined && (
                <p className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                  ({card.pending} en attente)
                </p>
              )}
            </dd>
          </a>
        ))}
      </div>
    </div>
  );
}