import { prisma } from '@/lib/prisma';

export default async function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const devis = await prisma.devis.findUnique({ 
    where: { id },
    include: {
      demande: {
        include: {
          user: true
        }
      }
    }
  });

  if (!devis) {
    return <div className="p-8 text-center text-red-600">Devis introuvable.</div>;
  }

  const adresseFacturationFixe = 'CI.DES BP212 Votokondji TOGO';
  const numeroCode = 'ENR-CIFRA-COMP 00X';
  const referenceAffaire = 'CI.DES';
  const titre = 'TRAME BDC DEVIS FACTURE';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">{titre}</h2>
        
        {/* Section Session de formation */}
        <fieldset className="border p-6 rounded mb-6 bg-blue-50">
          <legend className="text-xl font-bold text-blue-900 px-2">Session de formation</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Session demandée</div>
              <div className="input text-gray-900 bg-gray-100">{devis.demande?.session || 'Non spécifiée'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Message du client</div>
              <div className="input text-gray-900 bg-gray-100">{devis.demande?.message || 'Aucun message'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Titre & Code */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">En-tête</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Titre</div>
              <div className="input text-gray-900 bg-gray-100">{titre}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numéro de code</div>
              <div className="input text-gray-900 bg-gray-100">{numeroCode}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Informations principales */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Informations principales</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numéro de facture</div>
              <div className="input text-gray-900 bg-gray-100">{devis.numero}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Notre référence Affaire</div>
              <div className="input text-gray-900 bg-gray-100">{referenceAffaire}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Client</div>
              <div className="input text-gray-900 bg-gray-100">{devis.client}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Email</div>
              <div className="input text-gray-900 bg-gray-100">{devis.mail}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Adresses */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Adresses</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Adresse de facturation</div>
              <div className="input text-gray-900 bg-gray-100">{adresseFacturationFixe}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Adresse de livraison</div>
              <div className="input text-gray-900 bg-gray-100">{devis.adresseLivraison || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de livraison</div>
              <div className="input text-gray-900 bg-gray-100">{devis.dateLivraison ? new Date(devis.dateLivraison).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date examen</div>
              <div className="input text-gray-900 bg-gray-100">{devis.dateExamen ? new Date(devis.dateExamen).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Adresse client</div>
              <div className="input text-gray-900 bg-gray-100">{devis.adresse || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">SIRET / NIF</div>
              <div className="input text-gray-900 bg-gray-100">{devis.siret || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Intervention */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Intervention</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numéro NDA</div>
              <div className="input text-gray-900 bg-gray-100">{devis.numNDA || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date formation</div>
              <div className="input text-gray-900 bg-gray-100">{devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Suivi par</div>
              <div className="input text-gray-900 bg-gray-100">{devis.suiviPar || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Désignation (tableau) */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Désignation</legend>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-base text-gray-900">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Désignation</th>
                  <th className="border px-2 py-1">Quantité</th>
                  <th className="border px-2 py-1">Unité</th>
                  <th className="border px-2 py-1">Prix unitaire HT</th>
                  <th className="border px-2 py-1">Prix total HT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">{devis.designation}</td>
                  <td className="border px-2 py-1">{devis.quantite}</td>
                  <td className="border px-2 py-1">{devis.unite}</td>
                  <td className="border px-2 py-1">{devis.prixUnitaire} €</td>
                  <td className="border px-2 py-1">{(devis.prixUnitaire * devis.quantite).toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </fieldset>

        {/* Section TVA et Exonération */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">TVA et Exonération</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">TVA (%)</div>
              <div className="input text-gray-900 bg-gray-100">{devis.tva}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Exonération</div>
              <div className="input text-gray-900 bg-gray-100">{devis.exoneration || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de prise d'effet</div>
              <div className="input text-gray-900 bg-gray-100">{devis.datePriseEffet ? new Date(devis.datePriseEffet).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Informations bancaires */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Informations bancaires</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">IBAN</div>
              <div className="input text-gray-900 bg-gray-100">{devis.iban || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">BIC</div>
              <div className="input text-gray-900 bg-gray-100">{devis.bic || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Banque</div>
              <div className="input text-gray-900 bg-gray-100">{devis.banque || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Intitulé du compte</div>
              <div className="input text-gray-900 bg-gray-100">{devis.intituleCompte || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Signature */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Signature</legend>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Signature</div>
              <div className="input text-gray-900 bg-gray-100">{devis.signature || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Statut et dates */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Statut et dates</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Statut</div>
              <div className="input text-gray-900 bg-gray-100">{devis.statut}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de création</div>
              <div className="input text-gray-900 bg-gray-100">{devis.createdAt ? new Date(devis.createdAt).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de mise à jour</div>
              <div className="input text-gray-900 bg-gray-100">{devis.updatedAt ? new Date(devis.updatedAt).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
} 