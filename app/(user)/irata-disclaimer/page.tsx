import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import IrataDisclaimerFormClient from '@/app/(user)/irata-disclaimer/IrataDisclaimerFormClient';

export default async function IrataDisclaimerPage() {
  const session = await getServerSession(authOptions);
  const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="border border-gray-300 p-6 rounded-lg shadow-md">
        {/* Header Section */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p><strong>N° Doc. :</strong> FM014ENG</p>
            <p><strong>Date d'émission :</strong> 01/07/19</p>
            <p><strong>N° d'édition :</strong> 005</p>
            <p><strong>Page 1 sur 1</strong></p>
          </div>
          <div className="col-span-1 text-center font-bold text-lg flex items-center justify-center">
            DÉCLARATION DE NON-RESPONSABILITÉ <br /> ET DÉCHARGE DE RESPONSABILITÉ DU CANDIDAT
          </div>
          <div className="flex justify-end items-start">
            {/* Placeholder for IRATA logo */}
            <img src="/logo.png" alt="Logo IRATA International" className="h-16" />
          </div>
        </div>

        {/* Main Content (static) */}
        <p className="mb-4 text-sm">
          Ceci est un document important - veuillez le lire attentivement avant de le signer, car vous acceptez l&apos;entière responsabilité de
          votre propre santé et condition médicale et déchargez l&apos;IRATA, ses sociétés membres, et leur
          personnel respectif, les instructeurs de formation et les évaluateurs IRATA (collectivement dénommés <strong>Fournisseurs</strong>) de toute responsabilité.
        </p>
        <p className="mb-4 text-sm">
          L&apos;accès par corde en altitude ou en profondeur est une composante intrinsèque de la formation et de l&apos;évaluation. Par conséquent, les candidats doivent être physiquement aptes et non affectés par toute condition médicale qui pourrait les empêcher d&apos;entreprendre leurs exigences de formation et d&apos;effectuer toute manœuvre requise pendant la formation et l&apos;évaluation.
        </p>

        <h2 className="font-bold text-md mb-2">Déclaration</h2>
        <p className="mb-4 text-sm">
          Je déclare être en bonne santé, physiquement apte et me considérer comme apte à entreprendre une formation et une évaluation d&apos;accès par corde. Je n&apos;ai aucune condition médicale ou contre-indication qui pourrait m&apos;empêcher de travailler en toute sécurité.
        </p>

        <h3 className="font-semibold text-sm mb-2">Les principales contre-indications au travail en hauteur incluent (mais ne sont pas limitées à) :</h3>
        <ul className="list-disc list-inside ml-4 mb-4 text-sm">
          <li>médicaments sur ordonnance pouvant altérer les fonctions physiques et/ou mentales ;</li>
          <li>dépendance à l&apos;alcool ou aux drogues ;</li>
          <li>diabète, glycémie élevée ou basse ;</li>
          <li>hypertension ou hypotension ;</li>
          <li>épilepsie, crises ou périodes d&apos;inconscience, par ex. évanouissements ;</li>
          <li>vertiges, étourdissements ou difficultés d&apos;équilibre ;</li>
          <li>maladie cardiaque ou douleurs thoraciques ;</li>
          <li>fonction des membres altérée ;</li>
          <li>problèmes musculo-squelettiques, par ex. maux de dos ;</li>
          <li>maladie psychiatrique ;</li>
          <li>peur des hauteurs ;</li>
          <li>déficience sensorielle, par ex. cécité, surdité.</li>
        </ul>

        <h2 className="font-bold text-md mb-2">Risque et Déni de Responsabilité</h2>
        <p className="mb-4 text-sm">
          Je comprends que l&apos;accès par corde en hauteur ou en profondeur, ainsi que la formation et l&apos;évaluation y afférentes, comportent des risques pour ma personne et autrui de blessures corporelles (y compris l&apos;invalidité permanente et le décès) en raison de la possibilité de chutes et de collisions, et qu&apos;il s&apos;agit d&apos;une activité intense.
        </p>
        <p className="mb-4 text-sm">
          En mon nom et au nom de ma succession, je décharge irrévocablement les Fournisseurs, leurs dirigeants et leur personnel de toutes responsabilités, réclamations, demandes et dépenses, y compris les frais juridiques découlant de ou en relation avec mon engagement dans la formation et l&apos;évaluation d&apos;accès par corde impliquant l&apos;obtention de la certification IRATA.
        </p>

        <h3 className="font-semibold text-sm mb-2">En signant cette déclaration, je garantis et reconnais que :</h3>
        <ol className="list-lower-alpha list-inside ml-4 mb-6 text-sm">
          <li>les informations que j&apos;ai fournies sont exactes et sur lesquelles les Fournisseurs s&apos;appuieront ;</li>
          <li>au meilleur de mes connaissances et de ma conviction, l&apos;engagement dans des activités d&apos;accès par corde ne serait pas préjudiciable à ma santé, mon bien-être ou ma condition physique, ni à d&apos;autres personnes qui pourraient être affectées par mes actes ou omissions ;</li>
          <li>une société membre a le droit de m&apos;exclure de la formation et un évaluateur a le droit de m&apos;exclure de l&apos;évaluation, s&apos;ils ont des préoccupations concernant ma santé, ma forme physique ou mon attitude envers la sécurité ;</li>
          <li>(sauf lorsque les Fournisseurs ne peuvent exclure leur responsabilité par la loi), j&apos;accepte que cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat reste légalement contraignante même si les garanties et la déclaration données par moi sont fausses et j&apos;accepte les risques impliqués dans l&apos;entreprise de la formation et de l&apos;évaluation ; et</li>
          <li>je conseillerai à l&apos;IRATA si ma santé ou ma vulnérabilité à une blessure change et cesserai immédiatement les activités d&apos;accès par corde, à moins d&apos;approbation d&apos;un médecin.</li>
        </ol>

        <p className="mb-6 text-sm">
          Cette Déclaration de Non-responsabilité et de Dégagement de Responsabilité du Candidat sera interprétée et régie conformément au droit anglais et les parties se soumettent à la compétence exclusive des tribunaux anglais.
        </p>

        {/* Client form component */}
        <IrataDisclaimerFormClient user={session?.user as any || {}} currentDate={currentDate} />

        <p className="text-center text-xs text-gray-500 mt-6">NON CONTRÔLÉ LORS DE L'IMPRESSION</p>
      </div>
    </div>
  );
}
