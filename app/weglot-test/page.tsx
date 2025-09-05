import LanguageSelector from '../components/LanguageSelector';
import WeglotDiagnostic from '../components/WeglotDiagnostic';
import WeglotTestButton from '../components/WeglotTestButton';

export default function WeglotTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WeglotDiagnostic />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Page de test Weglot</h1>
        <LanguageSelector />
      </div>
      
      <div className="space-y-4">
        <WeglotTestButton />
        
        <h2 className="text-2xl font-semibold">Contenu à traduire</h2>
        
        <p className="text-lg">
          Cette page contient du contenu en français qui devrait être traduit automatiquement par Weglot.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Section importante</h3>
          <p>
            Voici un paragraphe avec des informations importantes sur la formation cordiste IRATA.
            Cette formation est reconnue internationalement et permet d'obtenir une certification professionnelle.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Avantages de la formation</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Certification reconnue internationalement</li>
            <li>Formation intensive de 5 jours</li>
            <li>Hébergement inclus</li>
            <li>Matériel fourni</li>
            <li>Encadrement par des professionnels</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Informations pratiques</h3>
          <p>
            <strong>Durée :</strong> 5 jours de formation + 1 jour d'examen<br/>
            <strong>Prix :</strong> 1350€ net (hébergement inclus)<br/>
            <strong>Lieu :</strong> Nouvelle-Aquitaine, France<br/>
            <strong>Certification :</strong> IRATA
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Contact</h3>
          <p>
            Pour plus d'informations, n'hésitez pas à nous contacter.
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Éléments non traduisibles</h3>
        <div className="no-translate">
          <p>Ce contenu ne sera pas traduit car il a la classe "no-translate".</p>
          <p>ACCUEIL - FORMATIONS - CONTACTS - HISTOIRE</p>
        </div>
      </div>
    </div>
  );
}
