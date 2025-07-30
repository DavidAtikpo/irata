import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TraineeData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface TraineeProgress {
  syllabusItem: string;
  traineeId: string;
  day: string;
  completed: boolean;
}

interface LevelData {
  syllabusItem: string;
  level: string;
  required: boolean;
}

interface SignatureData {
  traineeId: string;
  signature: string;
  adminSignature: string;
}

interface TrainingSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function generateTraineeFollowUpPDF(
  trainees: TraineeData[],
  traineeProgress: TraineeProgress[],
  levelData: LevelData[],
  signatures: SignatureData[],
  currentSession: TrainingSession | null
) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Configuration des couleurs
  const colors = {
    header: [255, 255, 255] as [number, number, number], // Blanc
    level: [255, 255, 224] as [number, number, number],  // Jaune clair
    trainee: [255, 255, 255] as [number, number, number], // Bleu ciel
    completed: [221, 221, 221] as [number, number, number], // Gris
    border: [128, 128, 128] as [number, number, number]  // Gris
  };

  // En-tête du formulaire - Tableau 4 colonnes, 2 lignes
  const headerData = [
    ['Titre', 'Code Number', 'Revision', 'Creation date'],
    ['CI.DES TRAINEE FOLLOW UP FORM', 'ENR-CIFRA-FORM 004', '01', '09/10/2023']
  ];

  // Générer l'en-tête du formulaire
  autoTable(doc, {
    head: [headerData[0]],
    body: [headerData[1]],
    startY: 20,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: colors.border,
      lineWidth: 0.5,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    headStyles: {
      fillColor: colors.header,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 }
    }
  });

  // Titre principal après l'en-tête
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAINEE FOLLOW UP FORM - VUE ADMIN', 105, 45, { align: 'center' });

  // Informations de session
  if (currentSession) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Session: ${currentSession.name}`, 20, 55);
    doc.text(`Du ${new Date(currentSession.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentSession.endDate).toLocaleDateString('fr-FR')}`, 20, 60);
  }

  // Préparer les données du tableau
  const days = ['J1', 'J2', 'J3', 'J4', 'J5'];
  const levels = ['Level 1', 'Level 2', 'Level 3'];
  
  const syllabus = [
    'Planification et gestion',
    'Système IRATA International',
    'Cadre légal',
    'Identification des dangers et évaluation des risques',
    'Sélection de la méthode d\'accès',
    'Sélection du personnel et compétences',
    'Déclaration de méthode de sécurité',
    'Zones de sélection, permis de travail, etc.',
    'Planification des urgences',
    'Premiers secours et tolérance à la suspension',
    'Sélection de l\'équipement',
    'Inspection et maintenance de l\'équipement',
    'Contrôle de pression de l\'équipement',
    'Inspections détaillées et intermédiaires',
    'Assemblage de l\'équipement et vérification mutuelle',
    'Sélection d\'ancrages',
    'Nœuds et manipulation de corde',
    'Système d\'ancrage de base',
    'Formes en Y',
    'Évitement des dangers et protection des cordes',
    'Réancrages',
    'Déviations',
    'Traction sur points d\'insertion',
    'Lignes de travail résistantes',
    'Système d\'arrêt de chute verticale',
    'Lignes tendues',
    'Systèmes de descente',
    'Systèmes de hissage',
    'Hissage croisé',
    'Systèmes de sauvetage complexes (exercice d\'équipe)',
    'Dispositifs de secours',
    'Descente',
    'Montée',
    'Changements de mode',
    'Descente avec dispositifs de montée',
    'Montée avec dispositifs de descente',
    'Déviation simple',
    'Déviation double',
    'Transferts corde à corde',
    'Réancrages niveau 1 (<1.5 m)',
    'Réancrages niveau 2 et 3 (>1.5 m)',
    'Passage des nœuds en milieu de corde',
    'Obstacles de bord en haut',
    'Utilisation des sièges de travail (sièges confort)',
    'Passage des protections en milieu de corde',
    'Escalade aidée mobile horizontale',
    'Escalade aidée fixe horizontale',
    'Escalade aidée verticale',
    'Escalade avec équipement d\'arrêt de chute',
    'Sauvetage en mode descente',
    'Sauvetage en mode montée',
    'Passage d\'une déviation avec victime',
    'Transfert corde à corde avec victime',
    'Passage d\'un petit réancrage avec victime',
    'Sauvetage en milieu de transfert',
    'Passage de nœuds en milieu de corde avec victime',
    'Utilisation de cordes tendues pour le sauvetage',
    'Sauvetage en escalade aidée',
    'Sauvetage avec équipement d\'arrêt de chute',
    'Sauvetage en escalade aidée : liaison courte'
  ];

  // Créer les en-têtes multi-lignes du tableau
  const headerRow1 = ['Éléments du programme', ...levels];
  const headerRow2 = ['', '', '', ''];
  
  // Ajouter les noms des stagiaires et leurs jours sur les deux lignes d'en-tête
  trainees.forEach(trainee => {
    // Nom du stagiaire sur la première ligne
    headerRow1.push(`${trainee.prenom} ${trainee.nom}`);
    headerRow2.push(''); // Espace vide pour les niveaux
    
    // Jours pour ce stagiaire sur la deuxième ligne
    days.forEach(day => {
      headerRow1.push('');
      headerRow2.push(day);
    });
  });

  // Créer les données du tableau
  const tableData = syllabus.map(item => {
    const row = [item];
    
    // Ajouter les niveaux
    levels.forEach(level => {
      const isRequired = levelData.find(l => l.syllabusItem === item && l.level === level)?.required || false;
      row.push(isRequired ? '✓' : '');
    });
    
    // Ajouter les jours pour chaque stagiaire
    trainees.forEach(trainee => {
      days.forEach(day => {
        const isCompleted = traineeProgress.find(p => 
          p.syllabusItem === item && 
          p.traineeId === trainee.id && 
          p.day === day
        )?.completed || false;
        row.push(isCompleted ? '✓' : '');
      });
    });
    
    return row;
  });

  // Ajouter la ligne de signature des stagiaires
  const signatureRow = ['Signature Stagiaire'];
  levels.forEach(() => signatureRow.push(''));
  trainees.forEach(trainee => {
    const signature = signatures.find(s => s.traineeId === trainee.id)?.signature;
    days.forEach(() => {
      signatureRow.push(signature ? '✓ Signé' : 'Non signé');
    });
  });
  tableData.push(signatureRow);

  // Générer le tableau avec en-têtes multi-lignes
  autoTable(doc, {
    head: [headerRow1, headerRow2],
    body: tableData,
    startY: 70,
    styles: {
      fontSize: 6,
      cellPadding: 1,
      lineColor: colors.border,
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      // fontStyle: 'bold',
    },
    headStyles: {
      fillColor: colors.header,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Éléments du programme
      1: { cellWidth: 8, fillColor: colors.level }, // Level 1
      2: { cellWidth: 8, fillColor: colors.level }, // Level 2
      3: { cellWidth: 8, fillColor: colors.level }, // Level 3
    },
    didParseCell: function(data) {
      // Colorer les cellules des stagiaires (noms et jours)
      if (data.column.index > 3) {
        data.cell.styles.fillColor = colors.trainee;
      }
      
      // Colorer les cases cochées avec texte blanc pour meilleure visibilité
      if (data.cell.text[0] === '✓') {
        data.cell.styles.fillColor = colors.completed;
        data.cell.styles.textColor = [255, 255, 255] as [number, number, number]; // Texte blanc
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Colorer les signatures
      if (data.cell.text.includes('Signé')) {
        data.cell.styles.fillColor = [144, 238, 144] as [number, number, number]; // Vert clair pour les signatures
        data.cell.styles.textColor = [0, 0, 0] as [number, number, number]; // Texte noir
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: function(data) {
      // Ajouter la signature admin en bas
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Signature Admin:', 20, pageHeight - 20);
      doc.setFont('helvetica', 'normal');
      doc.text('_________________________________', 20, pageHeight - 15);
    }
  });

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('ENR-CIFRA-FORM 004 CI.DES Trainee Follow Up Form', 20, pageHeight - 10);
  doc.text('CI.DES sasu Capital 2 500 Euros | SIRET: 87840789900011 TVA: FR71878407899', 20, pageHeight - 7);
  doc.text('Copie non contrôlée imprimée | Page 1 sur 1', 20, pageHeight - 4);

  return doc;
}

export function generateTraineeIndividualPDF(
  traineeName: string,
  traineeProgress: TraineeProgress[],
  levelData: LevelData[],
  signature: string | undefined,
  currentSession: TrainingSession | null,
  currentDay: number
) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Configuration des couleurs
  const colors = {
    header: [240, 248, 255] as [number, number, number], // Bleu clair
    level: [255, 255, 224] as [number, number, number],  // Jaune clair
    trainee: [173, 216, 230] as [number, number, number], // Bleu ciel
    completed: [0, 128, 0] as [number, number, number], // Vert foncé pour meilleure visibilité
    border: [200, 200, 200] as [number, number, number]  // Gris
  };

  // En-tête du formulaire - Tableau 4 colonnes, 2 lignes
  const headerData = [
    ['Titre', 'Code Number', 'Revision', 'Creation date'],
    ['CI.DES TRAINEE FOLLOW UP FORM', 'ENR-CIFRA-FORM 004', '01', '09/10/2023']
  ];

  // Générer l'en-tête du formulaire
  autoTable(doc, {
    head: [headerData[0]],
    body: [headerData[1]],
    startY: 20,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: colors.border,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: colors.header,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 }
    }
  });

  // Titre principal après l'en-tête
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAINEE FOLLOW UP FORM - VUE STAGIAIRE', 105, 45, { align: 'center' });

  // Informations de session
  if (currentSession) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Session: ${currentSession.name}`, 20, 55);
    doc.text(`Du ${new Date(currentSession.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentSession.endDate).toLocaleDateString('fr-FR')}`, 20, 60);
  }

  // Informations du stagiaire
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Stagiaire: ${traineeName}`, 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Jour actuel: ${currentDay}/5`, 20, 75);

  // Préparer les données du tableau
  const days = ['J1', 'J2', 'J3', 'J4', 'J5'];
  const levels = ['Level 1', 'Level 2', 'Level 3'];
  
  const syllabus = [
    'Planification et gestion',
    'Système IRATA International',
    'Cadre légal',
    'Identification des dangers et évaluation des risques',
    'Sélection de la méthode d\'accès',
    'Sélection du personnel et compétences',
    'Déclaration de méthode de sécurité',
    'Zones de sélection, permis de travail, etc.',
    'Planification des urgences',
    'Premiers secours et tolérance à la suspension',
    'Sélection de l\'équipement',
    'Inspection et maintenance de l\'équipement',
    'Contrôle de pression de l\'équipement',
    'Inspections détaillées et intermédiaires',
    'Assemblage de l\'équipement et vérification mutuelle',
    'Sélection d\'ancrages',
    'Nœuds et manipulation de corde',
    'Système d\'ancrage de base',
    'Formes en Y',
    'Évitement des dangers et protection des cordes',
    'Réancrages',
    'Déviations',
    'Traction sur points d\'insertion',
    'Lignes de travail résistantes',
    'Système d\'arrêt de chute verticale',
    'Lignes tendues',
    'Systèmes de descente',
    'Systèmes de hissage',
    'Hissage croisé',
    'Systèmes de sauvetage complexes (exercice d\'équipe)',
    'Dispositifs de secours',
    'Descente',
    'Montée',
    'Changements de mode',
    'Descente avec dispositifs de montée',
    'Montée avec dispositifs de descente',
    'Déviation simple',
    'Déviation double',
    'Transferts corde à corde',
    'Réancrages niveau 1 (<1.5 m)',
    'Réancrages niveau 2 et 3 (>1.5 m)',
    'Passage des nœuds en milieu de corde',
    'Obstacles de bord en haut',
    'Utilisation des sièges de travail (sièges confort)',
    'Passage des protections en milieu de corde',
    'Escalade aidée mobile horizontale',
    'Escalade aidée fixe horizontale',
    'Escalade aidée verticale',
    'Escalade avec équipement d\'arrêt de chute',
    'Sauvetage en mode descente',
    'Sauvetage en mode montée',
    'Passage d\'une déviation avec victime',
    'Transfert corde à corde avec victime',
    'Passage d\'un petit réancrage avec victime',
    'Sauvetage en milieu de transfert',
    'Passage de nœuds en milieu de corde avec victime',
    'Utilisation de cordes tendues pour le sauvetage',
    'Sauvetage en escalade aidée',
    'Sauvetage avec équipement d\'arrêt de chute',
    'Sauvetage en escalade aidée : liaison courte'
  ];

  // Créer les en-têtes du tableau
  const headers = ['Éléments du programme', ...levels, ...days];

  // Créer les données du tableau
  const tableData = syllabus.map(item => {
    const row = [item];
    
    // Ajouter les niveaux
    levels.forEach(level => {
      const isRequired = levelData.find(l => l.syllabusItem === item && l.level === level)?.required || false;
      row.push(isRequired ? '✓' : '');
    });
    
    // Ajouter les jours
    days.forEach(day => {
      const isCompleted = traineeProgress.find(p => 
        p.syllabusItem === item && 
        p.day === day
      )?.completed || false;
      row.push(isCompleted ? '✓' : '');
    });
    
    return row;
  });

  // Ajouter la ligne de signature
  const signatureRow = ['Ma Signature', '', '', '', signature ? '✓ Signé' : 'Non signé', '', '', '', ''];
  tableData.push(signatureRow);

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 85,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: colors.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: colors.header,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 60 }, // Éléments du programme
      1: { cellWidth: 15, fillColor: colors.level }, // Level 1
      2: { cellWidth: 15, fillColor: colors.level }, // Level 2
      3: { cellWidth: 15, fillColor: colors.level }, // Level 3
    },
    didParseCell: function(data) {
      // Colorer les cellules des jours
      if (data.column.index > 3) {
        data.cell.styles.fillColor = colors.trainee;
      }
      
      // Colorer les cases cochées avec texte blanc pour meilleure visibilité
      if (data.cell.text[0] === '✓') {
        data.cell.styles.fillColor = colors.completed;
        data.cell.styles.textColor = [255, 255, 255] as [number, number, number]; // Texte blanc
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Colorer les signatures
      if (data.cell.text.includes('Signé')) {
        data.cell.styles.fillColor = [144, 238, 144] as [number, number, number]; // Vert clair pour les signatures
        data.cell.styles.textColor = [0, 0, 0] as [number, number, number]; // Texte noir
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Section de signature du stagiaire
  let individualSignatureY = 0;
  autoTable(doc, {
    head: [['Ma Signature']],
    body: [],
    startY: 0,
    styles: {
      fontSize: 12,
      cellPadding: 5,
      lineColor: colors.border,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: colors.header,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    didDrawPage: function(data) {
      individualSignatureY = data.cursor?.y || 0;
    }
  });

  // Ajouter la signature du stagiaire
  let currentY = individualSignatureY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${traineeName}:`, 20, currentY);
  
  if (signature) {
    try {
      // Ajouter l'image de signature
      doc.addImage(signature, 'PNG', 80, currentY - 5, 40, 20);
      doc.text('✓ Signé', 130, currentY + 5);
    } catch (error) {
      doc.text('✓ Signé (erreur affichage)', 80, currentY + 5);
    }
  } else {
    doc.text('Non signé', 80, currentY + 5);
  }

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('ENR-CIFRA-FORM 004 CI.DES Trainee Follow Up Form', 20, pageHeight - 10);
  doc.text('CI.DES sasu Capital 2 500 Euros | SIRET: 87840789900011 TVA: FR71878407899', 20, pageHeight - 7);
  doc.text('Copie non contrôlée imprimée | Page 1 sur 1', 20, pageHeight - 4);

  return doc;
} 