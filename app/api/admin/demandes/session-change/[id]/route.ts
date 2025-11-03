import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import { prisma } from 'lib/prisma';

// Fonction pour extraire la date de début au format ISO (YYYY-MM-DD) depuis le format de session
function parseSessionStartISO(raw: string): string | null {
  if (!raw) return null;
  
  // Cas avec "(Examen XX)" - extraire la date de début
  const mExam = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+).*?du\s+(\d{1,2})\s+au\s+(\d{1,2})/i);
  if (mExam) {
    const [, year, monthFr, dayStart] = mExam;
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return null;
    const dd = dayStart.padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }
  
  // Format classique: "2025 octobre 20 au 24"
  const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(?:du\s+)?(\d{1,2})\s+au\s+(\d{1,2})/i);
  if (!m) return null;
  
  const [, year, monthFr, dayStart] = m;
  const monthMap: Record<string, string> = {
    janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
    mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
    septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
  };
  const mm = monthMap[monthFr.toLowerCase()];
  if (!mm) return null;
  const dd = dayStart.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Fonction pour extraire la date d'examen au format ISO (YYYY-MM-DD) depuis le format de session
function parseSessionEndISO(raw: string): string | null {
  if (!raw) return null;
  
  // Cas 1: présence explicite de "(Examen 25)"
  const mExam = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+).*?\(\s*Examen\s+(\d{1,2})\s*\)/i);
  if (mExam) {
    const [, year, monthFr, examDay] = mExam;
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return null;
    const dd = examDay.padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }
  
  // Cas 2: format classique avec "au" (la date de fin est l'examen)
  const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(?:du\s+)?(\d{1,2})\s+au\s+(\d{1,2})/i);
  if (!m) return null;
  
  const [, year, monthFr, , dayEnd] = m;
  const monthMap: Record<string, string> = {
    janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
    mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
    septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
  };
  const mm = monthMap[monthFr.toLowerCase()];
  if (!mm) return null;
  const dd = dayEnd.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// POST /api/admin/demandes/session-change/[id] - Approuver ou refuser une demande de changement
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminComment } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      );
    }

    // Récupérer la demande avec son devis
    const demande = await prisma.demande.findUnique({
      where: { id },
      include: {
        devis: true,
      },
    });

    if (!demande) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier qu'il y a une demande de changement en attente
    if (demande.sessionChangeStatus !== 'PENDING' || !demande.sessionChangeRequest) {
      return NextResponse.json(
        { error: 'Aucune demande de changement en attente' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Extraire les dates de la nouvelle session
      const newSession = demande.sessionChangeRequest;
      const dateFormationISO = parseSessionStartISO(newSession);
      const dateExamenISO = parseSessionEndISO(newSession);

      // Approuver : changer la session et mettre à jour le statut
      const updatedDemande = await prisma.demande.update({
        where: { id },
        data: {
          session: newSession,
          sessionChangeStatus: 'APPROVED',
          commentaire: adminComment 
            ? `${demande.commentaire ? demande.commentaire + '\n\n' : ''}Changement de session approuvé: ${adminComment}`
            : demande.commentaire,
          updatedAt: new Date(),
        },
      });

      // Si un devis existe, mettre à jour ses dates de formation et d'examen
      if (demande.devis && dateFormationISO && dateExamenISO) {
        try {
          await prisma.devis.update({
            where: { id: demande.devis.id },
            data: {
              dateFormation: new Date(dateFormationISO),
              dateExamen: new Date(dateExamenISO),
              updatedAt: new Date(),
            },
          });
          console.log(`✅ Devis ${demande.devis.numero} mis à jour avec les nouvelles dates:`, {
            dateFormation: dateFormationISO,
            dateExamen: dateExamenISO,
          });
        } catch (devisError) {
          console.error('Erreur lors de la mise à jour du devis:', devisError);
          // On continue même si la mise à jour du devis échoue
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Demande de changement approuvée',
        demande: updatedDemande,
      });
    } else {
      // Refuser : garder la session actuelle et mettre à jour le statut
      const updatedDemande = await prisma.demande.update({
        where: { id },
        data: {
          sessionChangeStatus: 'REJECTED',
          commentaire: adminComment 
            ? `${demande.commentaire ? demande.commentaire + '\n\n' : ''}Changement de session refusé: ${adminComment}`
            : demande.commentaire,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Demande de changement refusée',
        demande: updatedDemande,
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    );
  }
}

