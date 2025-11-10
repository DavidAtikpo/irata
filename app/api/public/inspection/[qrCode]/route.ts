import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlugFromReference } from '@/lib/slug';

// Route publique pour accéder à une inspection via son slug (basé sur référence interne) ou QR code (sans authentification)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const resolvedParams = await params;
    let slugOrQrCode = resolvedParams.qrCode;

    // Nettoyer l'URL si elle contient "https:/" malformé (double slash manquant)
    // Cas: /inspection/https:/res.cloudinary.com/... 
    if (slugOrQrCode.startsWith('http')) {
      // Si le code commence par http, c'est probablement une URL Cloudinary mal stockée
      // On essaie d'extraire un code valide ou on retourne une erreur
      console.error('Code invalide détecté (URL au lieu de code):', slugOrQrCode);
      return NextResponse.json(
        { error: 'Code invalide. Veuillez régénérer le lien depuis la page admin.' },
        { status: 400 }
      );
    }

    // Nettoyer le code (enlever les préfixes http/https s'il y en a)
    slugOrQrCode = slugOrQrCode.replace(/^https?:\/?\/?/, '');

    let inspection = null;

    // Format attendu : [id]-[slug] ou juste [slug] (pour compatibilité)
    // Exemple : "clx1a2b3c4d5e6f7g8h9i0j1k2-ancrages-togo" ou "ancrages-togo-local-a-070-a-78"
    const parts = slugOrQrCode.split('-');
    
    // Les IDs Prisma sont généralement longs (25+ caractères alphanumériques)
    // Le slug généré à partir de référence interne est généralement court
    // Si le premier segment est très long (probablement un ID), on cherche directement par ID
    const possibleId = parts[0];
    // Pattern pour identifier un ID Prisma (généralement 25+ caractères, alphanumériques)
    const idPattern = /^[a-z0-9_-]{20,}$/i;
    
    // Chercher d'abord par ID si le format est [id]-[slug] et que le premier segment ressemble à un ID
    if (parts.length > 1 && idPattern.test(possibleId)) {
      try {
        inspection = await prisma.equipmentDetailedInspection.findUnique({
          where: {
            id: possibleId
          },
          include: {
            createdBy: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
            template: true,
          },
        });
      } catch (error) {
        // Si l'ID n'est pas valide, continuer avec les autres méthodes
        console.log('ID invalide, tentative avec autres méthodes');
      }
    }

    // Si pas trouvé par ID, chercher par qrCode (rétrocompatibilité)
    if (!inspection) {
      inspection = await prisma.equipmentDetailedInspection.findFirst({
        where: {
          qrCode: slugOrQrCode
        },
        include: {
          createdBy: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
          template: true,
        },
      });
    }

    // Si pas trouvé, chercher par slug seul (référence interne) pour compatibilité
    if (!inspection) {
      // Récupérer toutes les inspections
      const allInspections = await prisma.equipmentDetailedInspection.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
          template: true,
        },
      });

      // Trouver celle dont le slug correspond
      for (const insp of allInspections) {
        if (insp.referenceInterne) {
          const generatedSlug = generateSlugFromReference(insp.referenceInterne);
          if (generatedSlug === slugOrQrCode) {
            inspection = insp as any;
            break;
          }
        }
      }
    }

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection non trouvée' },
        { status: 404 }
      );
    }

    // Retourner les données de l'inspection (publiques, pas d'informations sensibles)
    return NextResponse.json(inspection);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

