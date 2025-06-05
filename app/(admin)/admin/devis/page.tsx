import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DevisListPage() {
  const devis = await prisma.devis.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Liste des devis</h2>
          <Link href="/admin/devis/nouveau" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Nouveau devis</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-base text-gray-900">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Numéro</th>
                <th className="border px-2 py-1">Client</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Montant</th>
                <th className="border px-2 py-1">Statut</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Aucun devis trouvé.</td>
                </tr>
              ) : (
                devis.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{d.numero}</td>
                    <td className="border px-2 py-1">{d.client}</td>
                    <td className="border px-2 py-1">{d.mail}</td>
                    <td className="border px-2 py-1">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</td>
                    <td className="border px-2 py-1">{d.montant} €</td>
                    <td className="border px-2 py-1">{d.statut || '-'}</td>
                    <td className="border px-2 py-1">
                      <Link href={`/admin/devis/${d.id}`} className="text-indigo-600 hover:underline">Voir</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 