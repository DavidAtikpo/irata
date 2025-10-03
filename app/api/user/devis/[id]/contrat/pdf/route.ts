import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
        contrat: true,
      },
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.userId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier qu'un contrat existe
    if (!devis.contrat) {
      return NextResponse.json(
        { message: 'Aucun contrat trouvé pour ce devis' },
        { status: 404 }
      );
    }

    const contrat = devis.contrat;

    // Créer le PDF du contrat
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // En-tête
    page.drawText('CI.DES AGREEMENT SERVICE CONTRACT', {
      x: 50, y: height - 50, size: 12, font: boldFont, color: rgb(0,0,0)
    });
    page.drawText('Revision: 02', { x: 400, y: height - 50, size: 9, font, color: rgb(0,0,0) });
    page.drawText('Code Number: ENR-CIDESA-RH 023', { x: 50, y: height - 70, size: 9, font, color: rgb(0,0,0) });
    page.drawText('Creation Date: 29/07/2024', { x: 400, y: height - 70, size: 9, font, color: rgb(0,0,0) });

    // Titre
    let y = height - 120;
    page.drawText('CONTRAT DE FORMATION PROFESSIONNELLE', {
      x: (width - 300) / 2, y, size: 14, font: boldFont, color: rgb(0,0,0)
    });
    
    y -= 40;
    page.drawText('A. Organisme de Formation :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText('CI.DES sasu, SIRET: 878407899 00011', { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText('Chez Chagneau, 17270 Boresse et Martron France', { x: 70, y, size: 9, font, color: rgb(0,0,0) });

    y -= 30;
    page.drawText('B. Stagiaire :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Nom : ${contrat.nom}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Prénom : ${contrat.prenom}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Adresse : ${contrat.adresse}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Email : ${devis.demande.user.email}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    if (contrat.profession) {
      y -= 15;
      page.drawText(`Profession : ${contrat.profession}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    }

    y -= 30;
    page.drawText('Formation :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Formation Cordiste IRATA - ${devis.demande.session}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Montant : ${(devis.montant || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} € net`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });
    y -= 15;
    page.drawText(`Date de formation : ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}`, { x: 70, y, size: 9, font, color: rgb(0,0,0) });

    y -= 30;
    page.drawText(`Date de signature : ${new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}`, { x: 50, y, size: 9, font: boldFont, color: rgb(0,0,0) });
    y -= 20;
    page.drawText(`Statut : ${contrat.statut}`, { x: 50, y, size: 9, font: boldFont, color: rgb(0,0,0) });

    // Signature si disponible
    if (contrat.signature && y > 100) {
      y -= 30;
      page.drawText('Signature du stagiaire :', { x: 50, y, size: 9, font: boldFont, color: rgb(0,0,0) });
      try {
        const pngBytes = await fetch(contrat.signature).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);
        page.drawImage(pngImage, { x: 200, y: y-40, width: 120, height: 40 });
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la signature:', error);
        y -= 20;
        page.drawText('Signature électronique disponible', { x: 200, y, size: 7, font, color: rgb(0.5,0.5,0.5) });
      }
    }

    // Articles du contrat (simplifié)
    if (y > 200) {
      y -= 40;
      page.drawText('Articles du contrat :', { x: 50, y, size: 11, font: boldFont, color: rgb(0,0,0) });
      y -= 20;
      page.drawText('• Formation de 5 jours + 1 jour d\'examen', { x: 70, y, size: 8, font, color: rgb(0,0,0) });
      y -= 12;
      page.drawText('• Certification IRATA', { x: 70, y, size: 8, font, color: rgb(0,0,0) });
      y -= 12;
      page.drawText('• Hébergement inclus', { x: 70, y, size: 8, font, color: rgb(0,0,0) });
      y -= 12;
      page.drawText('• Matériel fourni', { x: 70, y, size: 8, font, color: rgb(0,0,0) });
    }

    // Pied de page
    page.drawText('CI.DES sasu - Capital 2 500 Euros', { x: 50, y: 60, size: 7, font, color: rgb(0,0,0) });
    page.drawText('SIRET: 87840789900011 - VAT: FR71878407899', { x: 50, y: 45, size: 7, font, color: rgb(0,0,0) });

    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrat_${contrat.nom}_${contrat.prenom}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF du contrat' },
      { status: 500 }
    );
  }
} 