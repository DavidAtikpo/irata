import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  request: NextRequest,
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

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        demande: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Créer le PDF du devis
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // En-tête
    page.drawText('DEVIS FORMATION CORDISTE IRATA', {
      x: 50, y: height - 50, size: 16, font: boldFont, color: rgb(0,0,0)
    });
    
    let y = height - 90;
    page.drawText(`Numéro de devis: ${devis.numero}`, { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Date: ${new Date(devis.createdAt).toLocaleDateString('fr-FR')}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });

    // Informations entreprise
    y -= 40;
    page.drawText('CI.DES sasu', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('SIRET: 878407899 00011', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('Chez Chagneau, 17270 Boresse et Martron', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('France', { x: 50, y, size: 10, font, color: rgb(0,0,0) });

    // Informations client
    y -= 40;
    page.drawText('Client:', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`${devis.demande.user.prenom} ${devis.demande.user.nom}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Email: ${devis.demande.user.email}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    if (devis.adresse) {
      y -= 15;
      page.drawText(`Adresse: ${devis.adresse}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    }

    // Détails de la formation
    y -= 40;
    page.drawText('Détails de la formation:', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Formation: Formation Cordiste IRATA - ${devis.demande.session}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Désignation: ${devis.designation}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Quantité: ${devis.quantite || 0} ${devis.unite || ''}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Prix unitaire: ${(devis.prixUnitaire || 0).toLocaleString('fr-FR').replace(/\s/g, ' ')} €`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`TVA: ${devis.tva || 0}%`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });

    if (devis.dateFormation) {
      y -= 15;
      page.drawText(`Date de formation: ${new Date(devis.dateFormation).toLocaleDateString('fr-FR')}`, { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    }

    // Montant total
    y -= 30;
    page.drawText(`MONTANT TOTAL: ${(devis.montant || 0).toLocaleString('fr-FR').replace(/\s/g, ' ')} € NET`, { 
      x: 50, y, size: 14, font: boldFont, color: rgb(0,0,0) 
    });

    // Conditions
    y -= 40;
    page.drawText('Conditions:', { x: 50, y, size: 12, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('• Formation de 5 jours + 1 jour d\'examen', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('• Hébergement inclus', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('• Certification IRATA', { x: 50, y, size: 10, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('• Matériel fourni', { x: 50, y, size: 10, font, color: rgb(0,0,0) });

    // Pied de page
    page.drawText('CI.DES sasu - Capital 2 500 Euros', { x: 50, y: 60, size: 8, font, color: rgb(0,0,0) });
    page.drawText('SIRET: 87840789900011 - VAT: FR71878407899', { x: 50, y: 45, size: 8, font, color: rgb(0,0,0) });
    page.drawText('Devis valable 30 jours', { x: 50, y: 30, size: 8, font, color: rgb(0,0,0) });

    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis_${devis.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF du devis' },
      { status: 500 }
    );
  }
} 