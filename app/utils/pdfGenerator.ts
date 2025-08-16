import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentData {
  id: string;
  name: string | null;
  address: string | null;
  signature: string | null;
  session?: string | null;
  adminSignature: string | null;
  adminSignedAt: string | null;
  createdAt: string;
}

export const generateIrataPDF = async (documentData: DocumentData): Promise<Blob> => {
  // Créer un élément temporaire avec le contenu du document
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.padding = '20mm';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';

  tempDiv.innerHTML = `
    <div style="max-width: 170mm; margin: 0 auto;">
      <!-- Header du document -->
      <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 12px;">
        <div>
          <p><strong>N° Doc. :</strong> FM014ENG</p>
          <p><strong>Date d'émission :</strong> 01/07/19</p>
          <p><strong>N° d'édition :</strong> 005</p>
          <p><strong>Page 1 sur 1</strong></p>
        </div>
        <div style="text-align: center; font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center;">
          DÉCLARATION DE NON-RESPONSABILITÉ<br/>ET DÉCHARGE DE RESPONSABILITÉ DU CANDIDAT
        </div>
        <div style="text-align: right;">
          <div style="width: 60px; height: 60px; border: 1px solid #ccc; display: inline-block; text-align: center; line-height: 60px; font-size: 10px;">
            LOGO IRATA
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div style="font-size: 11px; line-height: 1.4; margin-bottom: 20px;">
        <p style="margin-bottom: 15px;">
          Ceci est un document important - veuillez le lire attentivement avant de le signer, car vous acceptez l'entière responsabilité de
          votre propre santé et condition médicale et déchargez l'IRATA, ses sociétés membres, et leur
          personnel respectif, les instructeurs de formation et les évaluateurs IRATA (collectivement dénommés <strong>Fournisseurs</strong>) de toute responsabilité.
        </p>
        <p style="margin-bottom: 15px;">
          L'accès par corde en altitude ou en profondeur est une composante intrinsèque de la formation et de l'évaluation. Par conséquent, les candidats doivent être physiquement aptes et non affectés par toute condition médicale qui pourrait les empêcher d'entreprendre leurs exigences de formation et d'effectuer toute manœuvre requise pendant la formation et l'évaluation.
        </p>

        <h2 style="font-weight: bold; font-size: 13px; margin: 20px 0 10px 0;">Déclaration</h2>
        <p style="margin-bottom: 15px;">
          Je déclare être en bonne santé, physiquement apte et me considérer comme apte à entreprendre une formation et une évaluation d'accès par corde. Je n'ai aucune condition médicale ou contre-indication qui pourrait m'empêcher de travailler en toute sécurité.
        </p>

        <h3 style="font-weight: 600; font-size: 11px; margin: 15px 0 10px 0;">Les principales contre-indications au travail en hauteur incluent (mais ne sont pas limitées à) :</h3>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>médicaments sur ordonnance pouvant altérer les fonctions physiques et/ou mentales ;</li>
          <li>dépendance à l'alcool ou aux drogues ;</li>
          <li>diabète, glycémie élevée ou basse ;</li>
          <li>hypertension ou hypotension ;</li>
          <li>épilepsie, crises ou périodes d'inconscience, par ex. évanouissements ;</li>
          <li>vertiges, étourdissements ou difficultés d'équilibre ;</li>
          <li>maladie cardiaque ou douleurs thoraciques ;</li>
          <li>fonction des membres altérée ;</li>
          <li>problèmes musculo-squelettiques, par ex. maux de dos ;</li>
          <li>maladie psychiatrique ;</li>
          <li>peur des hauteurs ;</li>
          <li>déficience sensorielle, par ex. cécité, surdité.</li>
        </ul>

        <h2 style="font-weight: bold; font-size: 13px; margin: 20px 0 10px 0;">Risque et Déni de Responsabilité</h2>
        <p style="margin-bottom: 15px;">
          Je comprends que l'accès par corde en hauteur ou en profondeur, ainsi que la formation et l'évaluation y afférentes, comportent des risques pour ma personne et autrui de blessures corporelles (y compris l'invalidité permanente et le décès) en raison de la possibilité de chutes et de collisions, et qu'il s'agit d'une activité intense.
        </p>
        <p style="margin-bottom: 15px;">
          En mon nom et au nom de ma succession, je décharge irrévocablement les Fournisseurs, leurs dirigeants et leur personnel de toutes responsabilités, réclamations, demandes et dépenses, y compris les frais juridiques découlant de ou en relation avec mon engagement dans la formation et l'évaluation d'accès par corde impliquant l'obtention de la certification IRATA.
        </p>

        <h3 style="font-weight: 600; font-size: 11px; margin: 15px 0 10px 0;">En signant cette déclaration, je garantis et reconnais que :</h3>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>les informations que j'ai fournies sont exactes et sur lesquelles les Fournisseurs s'appuieront ;</li>
          <li>au meilleur de mes connaissances et de ma conviction, l'engagement dans des activités d'accès par corde ne serait pas préjudiciable à ma santé, mon bien-être ou ma condition physique, ni à d'autres personnes qui pourraient être affectées par mes actes ou omissions ;</li>
          <li>une société membre a le droit de m'exclure de la formation et un évaluateur a le droit de m'exclure de l'évaluation, s'ils ont des préoccupations concernant ma santé, ma forme physique ou mon attitude envers la sécurité ;</li>
          <li>(sauf lorsque les Fournisseurs ne peuvent exclure leur responsabilité par la loi), j'accepte que cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat reste légalement contraignante même si les garanties et la déclaration données par moi sont fausses et j'accepte les risques impliqués dans l'entreprise de la formation et de l'évaluation ; et</li>
          <li>je conseillerai à l'IRATA si ma santé ou ma vulnérabilité à une blessure change et cesserai immédiatement les activités d'accès par corde, à moins d'approbation d'un médecin.</li>
        </ol>

        <p style="margin-bottom: 30px; font-size: 10px;">
          Cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat sera interprétée et régie conformément au droit anglais et les parties se soumettent à la compétence exclusive des tribunaux anglais.
        </p>
      </div>

      <!-- Informations candidat -->
      <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px;">
        <h3 style="font-weight: 600; margin-bottom: 15px;">Informations du candidat :</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
          <div><strong>Nom :</strong> ${documentData.name || 'Non spécifié'}</div>
          <div><strong>N° IRATA :</strong> ENR-CIFRA-FORM 004</div>
          <div><strong>Date :</strong> ${new Date(documentData.createdAt).toLocaleDateString('fr-FR')}</div>
          <div><strong>Session :</strong> ${documentData.session || 'Non spécifiée'}</div>
          <div style="grid-column: span 2;"><strong>Adresse :</strong> ${documentData.address || 'Non spécifiée'}</div>
        </div>
      </div>

      <!-- Signatures -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <!-- Signature candidat -->
        <div>
          <h4 style="font-weight: 600; margin-bottom: 15px; font-size: 12px;">Signature du candidat :</h4>
          <div style="border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; min-height: 80px; text-align: center;">
            ${documentData.signature ? `<img src="${documentData.signature}" style="max-height: 60px; max-width: 100%;" alt="Signature candidat"/>` : 'Non signée'}
          </div>
        </div>

        <!-- Signature administrateur -->
        <div>
          <h4 style="font-weight: 600; margin-bottom: 15px; font-size: 12px;">Signature de l'administrateur IRATA :</h4>
          <div style="border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; min-height: 80px; text-align: center;">
            ${documentData.adminSignature ? 
              `<img src="${documentData.adminSignature}" style="max-height: 60px; max-width: 100%;" alt="Signature admin"/>
               <p style="font-size: 9px; color: #666; margin-top: 5px;">Signé le ${new Date(documentData.adminSignedAt!).toLocaleDateString('fr-FR')}</p>` 
              : 'En attente de signature admin'}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
        <p>NON CONTRÔLÉ LORS DE L'IMPRESSION</p>
        <p style="margin-top: 5px;">Document officiel IRATA - ID: ${documentData.id}</p>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Générer le canvas à partir du HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    });

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Retourner le blob
    return pdf.output('blob');
  } finally {
    // Nettoyer
    document.body.removeChild(tempDiv);
  }
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
