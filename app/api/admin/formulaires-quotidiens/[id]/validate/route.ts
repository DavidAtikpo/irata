import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { sendFormulaireValidationNotification } from 'lib/email';
import { getSessionLabel } from 'lib/sessions';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
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
        // Debug: Vérifier la session et niveau du formulaire
        console.log(`Formulaire session: "${formulaire.session}", niveau: "${formulaire.niveau}"`);
        
        // Fonction pour convertir le format de session
        const convertSessionFormat = (sessionValue: string): string => {
          // Convertir "2025-septembre-08-13" vers "2025 septembre 08 au 13"
          const parts = sessionValue.split('-');
          if (parts.length === 4) {
            const [annee, mois, debut, fin] = parts;
            return `${annee} ${mois} ${debut} au ${fin}`;
          }
          return sessionValue;
        };
        
        const sessionFormatted = convertSessionFormat(formulaire.session);
        console.log(`Session formatée pour recherche: "${sessionFormatted}"`);
        
        // Récupérer toutes les demandes pour debug
        const allDemandes = await prisma.demande.findMany({
          select: {
            session: true,
            user: {
              select: {
                email: true,
                role: true,
                niveau: true
              }
            }
          }
        });
        
        console.log('Toutes les demandes:', allDemandes);
        
        // Récupérer les stagiaires de la session ET du niveau du formulaire
        let stagiaires = await prisma.user.findMany({
          where: {
            role: 'USER',
            niveau: formulaire.niveau, // Filtrer par niveau
            demandes: {
              some: {
                OR: [
                  { session: formulaire.session }, // Format original
                  { session: sessionFormatted }    // Format converti
                ]
              }
            }
          },
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            niveau: true,
            demandes: {
              select: {
                session: true,
                statut: true
              }
            }
          }
        });

        console.log('Stagiaires trouvés:', stagiaires);
        
        // Si aucun stagiaire trouvé, essayer une recherche manuelle plus flexible
        if (stagiaires.length === 0) {
          console.log('Aucun stagiaire trouvé avec la correspondance exacte, tentative avec recherche flexible...');
          
          const stagiairesFallback = await prisma.user.findMany({
            where: {
              role: 'USER',
              niveau: formulaire.niveau // Toujours filtrer par niveau
            },
            select: {
              id: true,
              email: true,
              nom: true,
              prenom: true,
              niveau: true,
              demandes: {
                select: {
                  session: true,
                  statut: true
                }
              }
            }
          });
          
          // Filtrer manuellement les utilisateurs qui ont la session correspondante
          const stagiairesFiltres = stagiairesFallback.filter(user => 
            user.demandes.some(demande => 
              demande.session === formulaire.session ||
              demande.session === sessionFormatted ||
              demande.session?.toLowerCase() === formulaire.session?.toLowerCase() ||
              demande.session?.toLowerCase() === sessionFormatted?.toLowerCase()
            )
          );
          
          console.log('Stagiaires trouvés avec recherche flexible:', stagiairesFiltres);
          
          // Utiliser les stagiaires trouvés avec la recherche flexible
          if (stagiairesFiltres.length > 0) {
            stagiaires = stagiairesFiltres;
          }
        }
        
        console.log(`Envoi de notifications à ${stagiaires.length} stagiaires de la session "${formulaire.session}" niveau ${formulaire.niveau} pour le formulaire: ${formulaire.titre}`);

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
        const sessionLabel = getSessionLabel(formulaire.session);
        const notificationData = {
          type: 'FORMULAIRE_VALIDATED',
          message: `Formulaire "${formulaire.titre}" validé pour la session ${sessionLabel} niveau ${formulaire.niveau} - ${successful} notifications envoyées à ${stagiaires.length} stagiaires`,
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