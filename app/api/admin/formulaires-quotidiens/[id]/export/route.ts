import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le formulaire avec ses réponses
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id },
      include: {
        reponses: {
          include: {
            stagiaire: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          },
          orderBy: {
            dateReponse: 'asc'
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

    // Préparer les données pour Excel
    const questions = formulaire.questions as any[];
    const reponses = formulaire.reponses;

    // Créer les en-têtes
    const headers = [
      'Date de réponse',
      'Stagiaire',
      'Email',
      ...questions.map((q, index) => `Question ${index + 1}: ${q.question}`),
      'Commentaires'
    ];

    // Créer les lignes de données
    const data = reponses.map(reponse => {
      const reponsesData = reponse.reponses as any[];
      const row = [
        new Date(reponse.dateReponse).toLocaleDateString('fr-FR'),
        `${reponse.stagiaire.prenom} ${reponse.stagiaire.nom}`,
        reponse.stagiaire.email,
        ...reponsesData.map(r => {
          if (Array.isArray(r.reponse)) {
            return r.reponse.join(', ');
          }
          return r.reponse || '';
        }),
        reponse.commentaires || ''
      ];
      return row;
    });

    // Créer le workbook Excel
    const workbook = XLSX.utils.book_new();
    
    // Feuille principale avec les réponses
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses');

    // Feuille avec les questions
    const questionsData = questions.map((q, index) => [
      `Question ${index + 1}`,
      q.question,
      q.type,
      q.required ? 'Oui' : 'Non',
      q.options ? q.options.join(', ') : ''
    ]);
    const questionsHeaders = ['Numéro', 'Question', 'Type', 'Obligatoire', 'Options'];
    const questionsWorksheet = XLSX.utils.aoa_to_sheet([questionsHeaders, ...questionsData]);
    XLSX.utils.book_append_sheet(workbook, questionsWorksheet, 'Questions');

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reponses-formulaire-${formulaire.session}-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
} 