import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { sendEmail } from 'lib/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== Début de la requête POST contrat ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session récupérée:', { isAuthenticated: !!session, userId: session?.user?.id });

    if (!session) {
      console.log('Erreur: Utilisateur non authentifié');
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('ID du devis:', id);

    const data = await req.json();
    console.log('Données reçues:', { ...data, signature: data.signature ? `[SIGNATURE length=${String(data.signature).length}]` : 'null' });

    const {
      signature,
      nom,
      prenom,
      adresse,
      profession,
      telephone,
      email,
      dateNaissance,
      lieuNaissance,
      // Champs adresse personnel
      pays,
      codePostal,
      ville,
      // Champs entreprise pour convention
      entrepriseNom,
      entrepriseAdresse,
      entrepriseCodePostal,
      entrepriseVille,
      entrepriseTelephone,
      ...otherData
    } = data;

    console.log('Tentative de récupération du devis...');
    
    // Récupérer le devis
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

    console.log('Devis récupéré:', { 
      found: !!devis, 
      devisId: devis?.id,
      userId: devis?.userId,
      statut: devis?.statut,
      demandeSession: devis?.demande?.session
    });

    if (!devis) {
      console.log('Erreur: Devis non trouvé');
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.userId !== session?.user?.id) {
      console.log('Erreur: Devis n\'appartient pas à l\'utilisateur', {
        devisUserId: devis.userId,
        sessionUserId: session?.user?.id
      });
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que le devis est validé
    if (devis.statut !== 'VALIDE') {
      console.log('Erreur: Devis non validé, statut:', devis.statut);
      return NextResponse.json(
        { message: 'Le devis doit être validé pour créer un contrat' },
        { status: 400 }
      );
    }

    console.log('Tentative de création/mise à jour du contrat...');

    // Si un contrat existe déjà, on conserve ses numéros
    const existing = await prisma.contrat.findUnique({ where: { devisId: id } });
    let numeroComputed = (existing as any)?.numero || '';
    let referenceComputed = (existing as any)?.reference || '';
    
    // Si pas de contrat existant, générer les numéros définitifs
    if (!existing || !numeroComputed) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const isEntreprise = devis.demande?.typeInscription?.toLowerCase() === 'entreprise' || !!devis.demande?.entreprise;
      const prefix = isEntreprise ? 'CI.ICE' : 'CI.ICP';

      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const yearCount = await prisma.contrat.count({
        where: { createdAt: { gte: startOfYear, lt: endOfYear } },
      });
      
      // Compter les contrats pour cette session spécifique
      const sessionCount = await prisma.contrat.count({
        where: {
          devis: {
            demande: {
              session: devis.demande?.session
            }
          }
        }
      });
      
      const nthYear = String(yearCount + 1).padStart(3, '0');
      const nthSession = String(sessionCount + 1).padStart(3, '0');
      numeroComputed = `${prefix} ${yy}${mm}${nthYear}`;
      referenceComputed = `${prefix} ${yy}${mm} ${nthSession}`;
    }
    console.log('Données pour contrat:', {
      devisId: id,
      userId: session.user.id,
      nom,
      prenom,
      adresse,
      profession: profession || '',
      dateSignature: new Date(),
      signature: signature ? `[length=${String(signature).length}]` : 'null',
      statut: 'SIGNE'
    });

    // Normaliser champs entreprise/perso
    const entrepriseCodePostalStr = (entrepriseCodePostal ?? '').toString().trim();
    const entrepriseVilleStr = (entrepriseVille ?? '').toString().trim();
    const entrepriseAdresseStr = (entrepriseAdresse ?? '').toString().trim();
    const codePostalStr = (codePostal ?? '').toString().trim();
    const villeStr = (ville ?? '').toString().trim();
    const paysStr = (pays ?? '').toString().trim();

    console.log('Champs entreprise reçus:', {
      entrepriseNom,
      entrepriseAdresse: entrepriseAdresseStr,
      entrepriseVille: entrepriseVilleStr,
      entrepriseCodePostal: entrepriseCodePostalStr,
      entrepriseTelephone,
    });

    // Construire une adresse complète (personnelle ou entreprise)
    const isEntreprise = devis.demande?.typeInscription?.toLowerCase() === 'entreprise' || !!devis.demande?.entreprise;
    const baseAdresse = (isEntreprise ? (entrepriseAdresseStr || adresse) : adresse) || '';
    const city = (isEntreprise ? entrepriseVilleStr : villeStr) || '';
    const zip = (isEntreprise ? entrepriseCodePostalStr : codePostalStr) || '';
    const country = paysStr || '';
    const fullAdresse = [baseAdresse, city].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '') + (country ? `, ${country}` : '');

    // Utiliser upsert pour créer ou mettre à jour le contrat
    const contrat = await prisma.contrat.upsert({
      where: {
        devisId: id,
      },
      update: {
        nom: nom || (isEntreprise ? entrepriseNom || '' : ''),
        prenom: prenom || '',
        adresse: fullAdresse.trim(),
        profession: profession || '',
        // Champs adresse personnels
        ville: villeStr,
        codePostal: codePostalStr,
        pays: paysStr,
        telephone: telephone || '',
        // Champs entreprise
        entrepriseNom: entrepriseNom || '',
        entrepriseAdresse: entrepriseAdresseStr,
        entrepriseVille: entrepriseVilleStr,
        entrepriseCodePostal: entrepriseCodePostalStr,
        entrepriseTelephone: entrepriseTelephone || '',
        dateSignature: new Date(),
        signature: signature || '',
        statut: 'SIGNE',
        ...(numeroComputed && { numero: numeroComputed }),
        ...(referenceComputed && { reference: referenceComputed }),
      },
      create: {
        devisId: id,
        userId: session.user.id,
        nom: nom || (isEntreprise ? entrepriseNom || '' : ''),
        prenom: prenom || '',
        adresse: fullAdresse.trim(),
        profession: profession || '',
        // Champs adresse personnels
        ville: villeStr,
        codePostal: codePostalStr,
        pays: paysStr,
        telephone: telephone || '',
        // Champs entreprise
        entrepriseNom: entrepriseNom || '',
        entrepriseAdresse: entrepriseAdresseStr,
        entrepriseVille: entrepriseVilleStr,
        entrepriseCodePostal: entrepriseCodePostalStr,
        entrepriseTelephone: entrepriseTelephone || '',
        dateSignature: new Date(),
        signature: signature || '',
        statut: 'SIGNE',
        ...(numeroComputed && { numero: numeroComputed }),
        ...(referenceComputed && { reference: referenceComputed }),
      },
    });

    console.log('Contrat créé avec succès:', { contratId: contrat.id });

    // Envoyer les emails de notification
    try {
      console.log('Tentative d\'envoi des emails...');
      
      const formData = { nom, prenom, adresse, profession, telephone, email, dateNaissance, lieuNaissance };
      
      // Email à l'utilisateur
      await sendEmail({
        to: email || devis.demande.user.email,
        subject: 'Contrat de formation signé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Contrat de formation signé</h2>
            <p>Bonjour ${prenom} ${nom},</p>
            <p>Votre contrat de formation a été signé avec succès pour la session <strong>${devis.demande.session}</strong>.</p>
            <p>Détails du contrat :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Formation : Formation Cordiste IRATA - ${devis.demande.session}</li>
              <li>Montant : ${devis.montant} €</li>
              <li>Date de formation : ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
            </ul>
            <p>Nous vous contacterons prochainement pour finaliser les détails pratiques de la formation.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });

      console.log('Email utilisateur envoyé avec succès');

      // Email à l'admin
      await sendEmail({
        to: 'com,pmcides@gmail.com,pm@cides.tf',
        subject: 'Nouveau contrat signé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Nouveau contrat signé</h2>
            <p>Un nouveau contrat a été signé par ${prenom} ${nom}.</p>
            <p>Détails :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Formation : Formation Cordiste IRATA - ${devis.demande.session}</li>
              <li>Email : ${email || devis.demande.user.email}</li>
              <li>Téléphone : ${telephone}</li>
              <li>Adresse : ${adresse}</li>
              <li>Date de naissance : ${dateNaissance}</li>
              <li>Lieu de naissance : ${lieuNaissance}</li>
              <li>Profession : ${profession}</li>
            </ul>
            <p>Vous pouvez consulter les détails complets du contrat dans votre espace administrateur.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });

      console.log('Email admin envoyé avec succès');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // On continue même si l'email échoue
    }

    console.log('=== Succès: Contrat créé et emails envoyés ===');
    return NextResponse.json(contrat);
  } catch (error) {
    console.error('=== ERREUR DÉTAILLÉE ===');
    console.error('Type d\'erreur:', error?.constructor?.name);
    console.error('Message:', error instanceof Error ? error.message : 'Erreur inconnue');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    console.error('Erreur complète:', error);
    
    return NextResponse.json(
      { 
        message: 'Erreur lors de la création du contrat',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
} 