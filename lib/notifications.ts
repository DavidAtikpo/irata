export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  icon?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  recent: number;
}

// Types de notifications
export const NOTIFICATION_TYPES = {
  NEW_DEMANDE: 'Nouvelle demande de formation',
  NEW_DEVIS: 'Nouveau devis créé',
  DEVIS_VALIDATED: 'Devis validé',
  NEW_CONTRAT: 'Nouveau contrat signé',
  NEW_STAGIAIRE: 'Nouveau stagiaire inscrit',
  NEW_FORMULAIRE: 'Nouveau formulaire créé',
  FORMULAIRE_VALIDATED: 'Formulaire quotidien validé',
  FORMULAIRE_DELETED: 'Formulaire supprimé',
  NEW_REPONSE: 'Nouvelle réponse au formulaire',
  DOCUMENT_UPLOADED: 'Document téléchargé',
  DOCUMENT_APPROVED: 'Document approuvé',
  DOCUMENT_REJECTED: 'Document rejeté',
  INSPECTION_DUE: 'Inspection d\'équipement due',
  FORMATION_STARTING: 'Formation qui commence bientôt',
  PAYMENT_RECEIVED: 'Paiement reçu',
  PAYMENT_OVERDUE: 'Paiement en retard'
} as const;

// Fonction pour créer une notification
export function createNotification(
  type: keyof typeof NOTIFICATION_TYPES,
  message: string,
  link?: string,
  icon?: string
): Notification {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: getNotificationType(type),
    title: NOTIFICATION_TYPES[type],
    message,
    timestamp: new Date(),
    read: false,
    link,
    icon
  };
}

// Fonction pour déterminer le type de notification
function getNotificationType(type: keyof typeof NOTIFICATION_TYPES): 'info' | 'success' | 'warning' | 'error' {
  const typeMap: Record<keyof typeof NOTIFICATION_TYPES, 'info' | 'success' | 'warning' | 'error'> = {
    NEW_DEMANDE: 'info',
    NEW_DEVIS: 'info',
    DEVIS_VALIDATED: 'success',
    NEW_CONTRAT: 'success',
    NEW_STAGIAIRE: 'info',
    NEW_FORMULAIRE: 'info',
    FORMULAIRE_VALIDATED: 'success',
    FORMULAIRE_DELETED: 'warning',
    NEW_REPONSE: 'info',
    DOCUMENT_UPLOADED: 'info',
    DOCUMENT_APPROVED: 'success',
    DOCUMENT_REJECTED: 'error',
    INSPECTION_DUE: 'warning',
    FORMATION_STARTING: 'warning',
    PAYMENT_RECEIVED: 'success',
    PAYMENT_OVERDUE: 'error'
  };
  
  return typeMap[type];
}

// Fonction pour formater la date relative
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
  
  return date.toLocaleDateString('fr-FR');
}

// Fonction pour obtenir l'icône de notification
export function getNotificationIcon(type: 'info' | 'success' | 'warning' | 'error'): string {
  const icons = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  return icons[type];
} 