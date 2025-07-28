import { useEffect } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';

export function useDevisNotifications() {
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    const handleDevisValidation = (event: CustomEvent) => {
      const { type, message, link } = event.detail;
      addNotification(type, message, link);
    };

    const handleNotificationAdded = (event: CustomEvent) => {
      const { type, message, link } = event.detail;
      addNotification(type, message, link);
    };

    // Écouter les événements de validation de devis
    window.addEventListener('devisValidated', handleDevisValidation as EventListener);
    
    // Écouter les notifications ajoutées globalement
    window.addEventListener('notificationAdded', handleNotificationAdded as EventListener);
    
    return () => {
      window.removeEventListener('devisValidated', handleDevisValidation as EventListener);
      window.removeEventListener('notificationAdded', handleNotificationAdded as EventListener);
    };
  }, [addNotification]);
} 