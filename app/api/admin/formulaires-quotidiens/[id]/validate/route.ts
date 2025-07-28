import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendFormulaireValidationNotification } from '@/lib/email';
import { getSessionLabel } from '@/lib/sessions';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { valide } = await req.json();

    // Récupérer le formulaire
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reponses: true
          }
        }
      }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de validation
    const updatedFormulaire = await prisma.formulairesQuotidiens.update({
      where: { id },
      data: { valide: Boolean(valide) }
    });

    // Si le formulaire est validé, envoyer des notifications à tous les stagiaires
    if (valide) {
      try {
        // Récupérer tous les stagiaires (utilisateurs avec rôle USER)
        const stagiaires = await prisma.user.findMany({
          where: {
            role: 'USER'
          },
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        });

        console.log(`Envoi de notifications à ${stagiaires.length} stagiaires pour le formulaire: ${formulaire.titre}`);

        // Envoyer les notifications en parallèle
        const notificationPromises = stagiaires.map(async (stagiaire) => {
          try {
            const stagiaireNom = `${stagiaire.prenom || ''} ${stagiaire.nom || ''}`.trim() || 'Stagiaire';
            const sessionLabel = getSessionLabel(formulaire.session);
            
            await sendFormulaireValidationNotification(
              stagiaire.email,
              stagiaireNom,
              formulaire.titre,
              sessionLabel,
              formulaire.dateDebut.toISOString(),
              formulaire.dateFin.toISOString()
            );
            
            return { success: true, email: stagiaire.email };
          } catch (error) {
            console.error(`Erreur lors de l'envoi de la notification à ${stagiaire.email}:`, error);
            return { success: false, email: stagiaire.email, error: error instanceof Error ? error.message : 'Erreur inconnue' };
          }
        });

        const results = await Promise.allSettled(notificationPromises);
        
        // Compter les succès et échecs
        const successful = results.filter(result => 
          result.status === 'fulfilled' && result.value.success
        ).length;
        
        const failed = results.filter(result => 
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        ).length;

        console.log(`Notifications envoyées: ${successful} succès, ${failed} échecs`);

        // Créer une notification pour l'admin
        const notificationData = {
          type: 'FORMULAIRE_VALIDATED',
          message: `Formulaire "${formulaire.titre}" validé - ${successful} notifications envoyées à ${stagiaires.length} stagiaires`,
          link: `/admin/formulaires-quotidiens/reponses`
        };

        return NextResponse.json({
          message: `Formulaire ${valide ? 'validé' : 'masqué'} avec succès`,
          formulaire: {
            id: updatedFormulaire.id,
            titre: updatedFormulaire.titre,
            valide: updatedFormulaire.valide
          },
          notifications: {
            total: stagiaires.length,
            successful,
            failed
          },
          adminNotification: notificationData
        });

      } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
        
        // Retourner le succès de la validation même si les notifications échouent
        return NextResponse.json({
          message: `Formulaire ${valide ? 'validé' : 'masqué'} avec succès, mais erreur lors de l'envoi des notifications`,
          formulaire: {
            id: updatedFormulaire.id,
            titre: updatedFormulaire.titre,
            valide: updatedFormulaire.valide
          },
          notificationError: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    } else {
      // Si le formulaire est masqué, pas besoin d'envoyer de notifications
      return NextResponse.json({
        message: 'Formulaire masqué avec succès',
        formulaire: {
          id: updatedFormulaire.id,
          titre: updatedFormulaire.titre,
          valide: updatedFormulaire.valide
        }
      });
    }

  } catch (error) {
    console.error('Erreur lors de la validation du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la validation du formulaire' },
      { status: 500 }
    );
  }
} 