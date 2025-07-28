'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationContextType {
  notifications: any[];
  addNotification: (type: any, message: string, link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getRecentNotifications: () => any[];
  simulateNewNotification: () => void;
  formatRelativeTime: (date: Date) => string;
  getNotificationIcon: (type: 'info' | 'success' | 'warning' | 'error') => string;
  stats: {
    total: number;
    unread: number;
    recent: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationUtils = useNotifications();

  return (
    <NotificationContext.Provider value={notificationUtils}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// Fonction utilitaire pour ajouter des notifications depuis n'importe où
export function addGlobalNotification(type: any, message: string, link?: string) {
  // Cette fonction sera utilisée pour ajouter des notifications depuis les API routes
  // Elle stockera temporairement les notifications dans localStorage
  if (typeof window !== 'undefined') {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: type,
      title: type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      link
    };
    notifications.unshift(newNotification);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    
    // Déclencher un événement personnalisé pour notifier les composants
    const event = new CustomEvent('notificationAdded', {
      detail: { type, message, link }
    });
    window.dispatchEvent(event);
  }
}

// Fonction pour déclencher une notification de devis validé
export function triggerDevisValidationNotification(devisData: any) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('devisValidated', {
      detail: {
        type: 'DEVIS_VALIDATED',
        message: `Devis ${devisData.numero} accepté par ${devisData.client} - Montant: ${devisData.montant}€`,
        link: `/admin/devis/${devisData.id}`
      }
    });
    window.dispatchEvent(event);
  }
} 