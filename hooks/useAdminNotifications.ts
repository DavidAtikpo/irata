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
    const fetchCounts = async () => {
      try {
        const [demandesRes, devisRes, contratsRes] = await Promise.all([
          fetch('/api/admin/demandes?statut=EN_ATTENTE'),
          fetch('/api/admin/devis?statut=EN_ATTENTE'),
          fetch('/api/admin/contrats?statut=SIGNE')
        ]);

        const [demandes, devis, contrats] = await Promise.all([
          demandesRes.json(),
          devisRes.json(),
          contratsRes.json()
        ]);

        setCounts({
          demandes: typeof demandes === 'number' ? demandes : demandes.length || 0,
          devisEnAttente: typeof devis === 'number' ? devis : devis.length || 0,
          contratsSignes: typeof contrats === 'number' ? contrats : contrats.length || 0
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
