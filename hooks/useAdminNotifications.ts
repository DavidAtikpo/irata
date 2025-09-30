import { useState, useEffect } from 'react';

interface NotificationCounts {
  demandes: number;
  devisEnAttente: number;
  contratsSignes: number;
}

export function useAdminNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    demandes: 0,
    devisEnAttente: 0,
    contratsSignes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async (url: string): Promise<number> => {
      try {
        const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
        if (!res.ok) return 0;
        const data = await res.json();
        if (typeof data === 'number') return data;
        if (Array.isArray(data)) return data.length;
        return 0;
      } catch (e) {
        console.error('Fetch error for', url, e);
        return 0;
      }
    };

    const fetchCounts = async () => {
      try {
        const [demandes, devis, contrats] = await Promise.all([
          fetchCount('/api/admin/demandes?statut=EN_ATTENTE'),
          fetchCount('/api/admin/devis?statut=EN_ATTENTE'),
          fetchCount('/api/admin/contrats?statut=SIGNE')
        ]);

        setCounts({
          demandes,
          devisEnAttente: devis,
          contratsSignes: contrats
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des compteurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { counts, loading };
}
