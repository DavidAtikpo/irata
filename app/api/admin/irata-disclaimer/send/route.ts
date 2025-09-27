import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ message: 'ID de soumission manquant' }, { status: 400 });
    }

    // Lire le fichier existant
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const submissions = JSON.parse(raw || '[]');

    // Trouver la soumission
    const submissionIndex = submissions.findIndex((s: any) => s.id === submissionId);
    
    if (submissionIndex === -1) {
      return NextResponse.json({ message: 'Soumission non trouvée' }, { status: 404 });
    }

    const submission = submissions[submissionIndex];

    // Vérifier que le document est signé par l'admin
    if (!submission.adminSignature) {
      return NextResponse.json({ message: 'Le document doit être signé avant envoi' }, { status: 400 });
    }

    // Mettre à jour le statut
    submissions[submissionIndex] = {
      ...submission,
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentBy: session.user?.name || 'Administrateur'
    };

    // Sauvegarder
    await fs.writeFile(FILE_PATH, JSON.stringify(submissions, null, 2), 'utf8');

    // TODO: Ici vous pouvez ajouter la logique d'envoi (email, notification, etc.)
    // Exemples possibles :
    // - Envoyer un email à l'utilisateur avec le document signé
    // - Créer une notification dans l'application
    // - Sauvegarder le document dans l'espace utilisateur
    
    /*
    // Exemple d'envoi d'email (nécessite une configuration email)
    await sendEmailToUser({
      userEmail: submission.user?.email,
      userName: submission.name,
      documentUrl: generateDocumentPDF(submission),
      subject: 'Votre déclaration IRATA signée est disponible'
    });
    */

    return NextResponse.json({ 
      message: 'Document envoyé avec succès à l\'utilisateur',
      submission: submissions[submissionIndex]
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Fonction utilitaire pour générer le PDF complet (à implémenter selon vos besoins)
function generateDocumentPDF(submission: any): string {
  // TODO: Générer un PDF avec le document complet incluant les deux signatures
  // Vous pouvez utiliser des bibliothèques comme puppeteer, jsPDF, etc.
  
  // Pour l'instant, retourner un placeholder
  return `/api/documents/irata-disclaimer/${submission.id}/pdf`;
}
