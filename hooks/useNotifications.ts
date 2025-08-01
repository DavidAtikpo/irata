'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationStats, createNotification, formatRelativeTime, getNotificationIcon } from '../lib/notifications';

// Stockage local des notifications (simulation d'une base de données)
const STORAGE_KEY = 'admin_notifications';

// Fonction pour charger les notifications depuis le localStorage
function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
  }
  
  return [];
}

// Fonction pour sauvegarder les notifications dans le localStorage
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
}

// Notifications de démonstration


export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, recent: 0 });

  // Charger les notifications au montage
  useEffect(() => {
    const storedNotifications = loadNotifications();
    
    // Si aucune notification stockée, utiliser les notifications de démonstration
    if (storedNotifications.length === 0) {
    } else {
      setNotifications(storedNotifications);
    }
  }, []);

  // Calculer les statistiques
  useEffect(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      recent: notifications.filter(n => n.timestamp > oneDayAgo).length
    };
    
    setStats(stats);
  }, [notifications]);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((type: keyof typeof import('../lib/notifications').NOTIFICATION_TYPES, message: string, link?: string) => {
    const newNotification = createNotification(type, message, link);
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Supprimer une notification
  const removeNotification = useCallback((id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Supprimer toutes les notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  // Obtenir les notifications récentes (non lues ou des dernières 24h)
  const getRecentNotifications = useCallback(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return notifications.filter(n => !n.read || n.timestamp > oneDayAgo);
  }, [notifications]);

  // Simuler une nouvelle notification (pour les tests)
  const simulateNewNotification = useCallback(() => {
    const types = ['NEW_DEMANDE', 'NEW_REPONSE', 'DOCUMENT_UPLOADED', 'FORMATION_STARTING'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const messages = [
      'Nouvelle activité détectée',
      'Action requise de votre part',
      'Mise à jour importante',
      'Nouveau contenu disponible'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    addNotification(randomType, randomMessage);
  }, [addNotification]);

  return {
    notifications,
    stats,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getRecentNotifications,
    simulateNewNotification,
    formatRelativeTime,
    getNotificationIcon
  };
} 