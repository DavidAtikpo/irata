import Image from 'next/image';
import Link from 'next/link';

type HistoriqueItem = {
  id: string;
  annee: string;
  session: string;
  commentaire: string | null;
  document: { id: string; nom: string; url: string };
};

async function getHistorique(): Promise<HistoriqueItem[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.VERCEL_URL && process.env.VERCEL_URL.trim().length > 0
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/historique`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [] as any;
  const data = await res.json();
  return (data.items || []) as HistoriqueItem[];
}

export default async function HistoriquePage() {
  const items = await getHistorique();
  // Grouper par session (année + session)
  const grouped = items.reduce((acc: Record<string, HistoriqueItem[]>, it) => {
    const key = `${it.annee} • ${it.session}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(it);
    return acc;
  }, {} as Record<string, HistoriqueItem[]>);
  const groupKeys = Object.keys(grouped);

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Historique des formations IRATA</h1>
        <p className="text-gray-700 leading-relaxed">
          Formation cordiste IRATA actuellement en cours — Saisissez cette chance unique!,
     Places ultra-limitées — Réservez MAINTENANT pour ne pas regretter,
     TOUT INCLUS: Hébergement + formation + certification — 1350€ seulement!,
     Certification IRATA,
     débutant à cordiste certifié en 6 jours,
        </p>
        <p className="text-gray-700 leading-relaxed">
        OPPORTUNITÉ UNIQUE: Investissez dans l'un des premiers centres de multi-formations en sécurité du Togo
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-blue-900">
            Pour mieux comprendre la formation et le financement, visitez aussi:
            <span className="animate-pulse"> DERNIERS JOURS:</span> Rejoignez nos investisseurs pionniers et participez à la success story du centre — Chaque euro compte et rapporte!
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/" className="inline-block text-sm font-semibold text-blue-700 underline hover:text-blue-900">
              Page d’accueil (infos formation)
            </Link>
            <span className="text-sm text-blue-900">•</span>
            <Link href="/financement-participatif" className="inline-block text-sm font-semibold text-blue-700 underline hover:text-blue-900">
              Financement participatif (opportunités d’investissement)
            </Link>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-gray-600">Aucun historique disponible pour le moment.</div>
      ) : (
        <div className="space-y-10">
          {groupKeys.map((key) => (
            <section key={key} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">{key}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[key].map((item) => (
                  <article key={item.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                    <div className="relative w-full h-44 sm:h-48 lg:h-52">
                      <Image
                        src={item.document.url}
                        alt={item.document.nom}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="text-sm font-semibold truncate">{item.document.nom}</h3>
                      {item.commentaire && (
                        <p className="text-xs text-gray-700 line-clamp-3">{item.commentaire}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}


