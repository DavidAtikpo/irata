import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationData {
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  category: 'CROWDFUNDING' | 'PAYMENT' | 'SYSTEM' | 'USER';
  metadata?: Record<string, any>;
}

export async function createNotification(data: NotificationData) {
  try {
    // Créer une notification pour tous les administrateurs
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true
      }
    });

    const notifications = admins.map(admin => ({
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      userId: admin.id,
      isRead: false
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      });
    }

    console.log(`Notification créée pour ${notifications.length} administrateurs`);
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Erreur création notification:', error);
    return { success: false, error };
  }
}

export async function createContributionNotification(
  contributorName: string,
  amount: number,
  contributionType: string,
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED'
) {
  const statusText = {
    SUCCESS: 'réussie',
    FAILED: 'échouée',
    CANCELLED: 'annulée'
  }[status];

  const typeMap = {
    SUCCESS: 'SUCCESS' as const,
    FAILED: 'ERROR' as const,
    CANCELLED: 'WARNING' as const
  };

  const title = `Contribution ${statusText}`;
  const message = `Contribution de ${contributorName} (${amount.toLocaleString()} FCFA - ${contributionType}) ${statusText}`;

  return createNotification({
    title,
    message,
    type: typeMap[status],
    category: 'CROWDFUNDING',
    metadata: {
      contributorName,
      amount,
      contributionType,
      status,
      timestamp: new Date().toISOString()
    }
  });
}

export async function createPaymentNotification(
  paymentIntentId: string,
  amount: number,
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED',
  errorMessage?: string
) {
  const statusText = {
    SUCCESS: 'réussi',
    FAILED: 'échoué',
    CANCELLED: 'annulé'
  }[status];

  const typeMap = {
    SUCCESS: 'SUCCESS' as const,
    FAILED: 'ERROR' as const,
    CANCELLED: 'WARNING' as const
  };

  const title = `Paiement ${statusText}`;
  const message = `Paiement Stripe ${paymentIntentId} (${amount.toLocaleString()} FCFA) ${statusText}${errorMessage ? ` - ${errorMessage}` : ''}`;

  return createNotification({
    title,
    message,
    type: typeMap[status],
    category: 'PAYMENT',
    metadata: {
      paymentIntentId,
      amount,
      status,
      errorMessage,
      timestamp: new Date().toISOString()
    }
  });
}
