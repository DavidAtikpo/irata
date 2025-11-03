'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import React from 'react';
import { useSession } from 'next-auth/react';

// Données des sessions avec IDs
const sessions = [
  { id: '1', annee: '2026', mois: 'janvier', dates: 'du 26 au 30 (Examen 31)' },
  { id: '2', annee: '2026', mois: 'février', dates: 'du 09 au 13 (Examen 14)' },
  { id: '3', annee: '2026', mois: 'mars', dates: 'du 23 au 27 (Examen 28)' },
  { id: '4', annee: '2026', mois: 'avril', dates: 'du 06 au 10 (Examen 11)' },
  { id: '5', annee: '2026', mois: 'mai', dates: 'du 18 au 22 (Examen 23)' },
  { id: '6', annee: '2026', mois: 'juin', dates: 'du 15 au 19 (Examen 20)' },
  { id: '7', annee: '2026', mois: 'juillet', dates: 'du 29 juin au 03 juillet (Examen 04)' },
  { id: '8', annee: '2026', mois: 'aout', dates: 'du 17 au 21 (Examen 22)' },
  { id: '9', annee: '2025', mois: 'septembre', dates: 'du 01 au 05 (Examen 06)' },
  { id: '10', annee: '2025', mois: 'septembre', dates: 'du 08 au 12 (Examen 13)' },
  { id: '11', annee: '2025', mois: 'octobre', dates: 'du 06 au 10 (Examen 11)' },
  { id: '12', annee: '2025', mois: 'octobre', dates: 'du 20 au 24 (Examen 25)' },
  { id: '13', annee: '2025', mois: 'novembre', dates: 'du 03 au 07 (Examen 08)' },
  { id: '14', annee: '2025', mois: 'novembre', dates: 'du 17 au 21 (Examen 22)' },
  { id: '15', annee: '2025', mois: 'décembre', dates: 'du 15 au 19 (Examen 20)' },
];

type SessionRegisterFormProps = {
  sessionLabel: string;
  onClose: () => void;
};

function SessionRegisterForm({ sessionLabel, onClose }: SessionRegisterFormProps) {
  const [registrationType, setRegistrationType] = useState<'personnel' | 'entreprise'>('personnel');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    message: '',
    session: sessionLabel,
    entreprise: '',
    niveau: '1',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: préinscription, 2: mot de passe
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);
  const [alreadyUser, setAlreadyUser] = useState(false);
  const [shouldLogin, setShouldLogin] = useState(false);
  const [skipPassword, setSkipPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      // Validation des champs requis selon le type
      if (registrationType === 'entreprise') {
        if (!formData.entreprise) {
          setError('Le nom de l\'entreprise est requis');
          return;
        }
      }
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...formData, 
            registrationType,
            role: 'USER', 
            step: 1 
          }),
        });
        const data = await response.json().catch(() => ({} as any));
        if (!response.ok) {
          if (data.shouldLogin) {
            // L'utilisateur a déjà ce niveau, il doit se connecter
            setShouldLogin(true);
            return;
          }
          const msg = (data && (data.message || data.error)) || `Erreur ${response.status}`
          throw new Error(msg)
        }
        if (data.skipPassword) {
          // L'utilisateur existe mais avec un niveau différent, skip le mot de passe
          setSkipPassword(true);
          setStep(2);
        } else if (data.userExists) {
          setAlreadyUser(true);
        } else {
          setStep(2);
        }
      } catch (err: any) {
        console.error('Préinscription échouée:', err)
        setError(typeof err?.message === 'string' ? err.message : 'Une erreur est survenue');
      }
    } else if (step === 2) {
      // Exiger uniquement les champs nécessaires côté client
      const requiredFields = registrationType === 'entreprise'
        ? ['nom', 'prenom', 'email', 'entreprise']
        : ['nom', 'prenom', 'email']

      const missing = requiredFields.some((key) => !(formData as any)[key])
      if (missing) {
        setError("Veuillez renseigner au minimum prénom, nom, email" + (registrationType === 'entreprise' ? " et l'entreprise" : "") + ".")
        setStep(1)
        return
      }
      
      // Valider le mot de passe seulement si on ne skip pas
      if (!skipPassword) {
        if (passwords.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
          return
        }
        if (passwords.password !== passwords.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
      }
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            registrationType,
            password: skipPassword ? undefined : passwords.password,
            role: 'USER',
            step: 2,
          }),
        });
        const data = await response.json().catch(() => ({} as any));
        if (!response.ok) {
          const msg = (data && (data.message || data.error)) || `Erreur ${response.status}`
          throw new Error(msg)
        }
        setSuccess(true);
      } catch (err: any) {
        console.error('Inscription échouée:', err)
        setError(typeof err?.message === 'string' ? err.message : 'Une erreur est survenue');
      }
    }
  };

  if (success) {
    return (
      <div className="p-4 sm:p-6 text-green-700 bg-green-50 border border-green-200 rounded-lg mb-4 max-w-md mx-auto shadow-sm">
        <p className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">
          {skipPassword ? 'Demande enregistrée !' : 'Inscription réussie !'}
        </p>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm">
          {skipPassword 
            ? 'Votre nouvelle demande pour le niveau ' + formData.niveau + ' a été enregistrée. Vous pouvez vous connecter avec vos identifiants habituels.'
            : 'Vous pouvez maintenant vous connecter à votre espace personnel.'
          }
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
          <Link href="/login" className="px-3 sm:px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold no-underline text-sm transition-colors duration-200">
            Se connecter
          </Link>
          <button onClick={onClose} className="text-gray-600 underline text-sm">Fermer</button>
        </div>
      </div>
    );
  }
  if (shouldLogin) {
    return (
      <div className="p-4 sm:p-6 text-orange-900 bg-orange-50 border border-orange-200 rounded-lg mb-4 max-w-md mx-auto shadow-sm">
        <p className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">⚠️ Compte existant</p>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm">
          Vous avez déjà un compte avec ce niveau de formation (Niveau {formData.niveau}). 
          Veuillez vous connecter pour accéder à votre espace et suivre vos demandes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
          <Link href="/login" className="px-3 sm:px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 font-semibold no-underline text-sm transition-colors duration-200">
            Se connecter
          </Link>
          <button onClick={onClose} className="text-gray-600 underline text-sm">Fermer</button>
        </div>
      </div>
    );
  }
  if (alreadyUser) {
    return (
      <div className="p-4 sm:p-6 text-blue-900 bg-blue-50 border border-blue-200 rounded-lg mb-4 max-w-md mx-auto shadow-sm">
        <b className="text-sm sm:text-base">Votre demande a bien été enregistrée.</b><br />
        <span className="text-xs sm:text-sm">Vous avez déjà un compte, vous pouvez suivre l'évolution de votre inscription en vous connectant.</span>
        <br />
        <a href="/login" className="text-blue-700 underline text-sm">Cliquez ici pour vous connecter</a>.
        <button onClick={onClose} className="ml-2 sm:ml-4 text-blue-600 underline text-sm">Fermer</button>
      </div>
    );
  }

  return (
    <form className="p-4 sm:p-6 border border-gray-200 rounded-lg mb-4 bg-white max-w-lg mx-auto shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-4 font-semibold text-blue-800 text-sm sm:text-base">Session choisie : {sessionLabel}</div>
      
      {/* Sélection du type d'inscription */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Type d'inscription</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="registrationType"
              value="personnel"
              checked={registrationType === 'personnel'}
              onChange={(e) => setRegistrationType(e.target.value as 'personnel' | 'entreprise')}
              className="mr-2"
            />
            <span className="text-sm">Personnel</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="registrationType"
              value="entreprise"
              checked={registrationType === 'entreprise'}
              onChange={(e) => setRegistrationType(e.target.value as 'personnel' | 'entreprise')}
              className="mr-2"
            />
            <span className="text-sm">Entreprise</span>
          </label>
        </div>
        
        {/* Description explicative */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          {registrationType === 'personnel' ? (
            <div>
              <strong>Inscription personnelle :</strong> Pour les particuliers qui souhaitent suivre la formation à titre individuel.
            </div>
          ) : (
            <div>
              <strong>Inscription entreprise :</strong> Pour les entreprises qui envoient leurs employés en formation. Veuillez indiquer le nom de votre entreprise.
            </div>
          )}
        </div>
      </div>

      {/* Sélection du niveau */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau de formation <span className="text-red-600">*</span></label>
        <select
          name="niveau"
          value={formData.niveau}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="1">Niveau 1</option>
          <option value="2">Niveau 2</option>
          <option value="3">Niveau 3</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Sélectionnez le niveau IRATA que vous souhaitez passer</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded mb-3 text-xs sm:text-sm" role="alert">
          {error}
        </div>
      )}
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-700 mt-1">Prénom</label>
              <input name="prenom" type="text" required className="border rounded px-3 py-2 w-full text-sm" value={formData.prenom} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mt-1">Nom</label>
              <input name="nom" type="text" required className="border rounded px-3 py-2 w-full text-sm" value={formData.nom} onChange={handleChange} />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs text-gray-700 mt-1">Email <span className="text-red-600">*</span></label>
            <input name="email" type="email" required className="border rounded px-3 py-2 w-full text-sm" value={formData.email} onChange={handleChange} />
          </div>

          {registrationType === 'entreprise' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-700 mt-1">Nom de l'entreprise <span className="text-red-600">*</span></label>
              <input name="entreprise" type="text" required className="border rounded px-3 py-2 w-full text-sm" value={formData.entreprise} onChange={handleChange} />
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-xs text-gray-700 mt-1 font-semibold">Message</label>
            <textarea name="message" required className="border rounded px-3 py-2 w-full text-sm" rows={3} value={formData.message} onChange={handleChange} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors duration-200">Envoyer la pré-inscription</button>
            <button type="button" onClick={onClose} className="text-gray-500 underline text-sm">Annuler</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          {skipPassword ? (
            // Cas où l'utilisateur existe déjà - pas besoin de mot de passe
            <div className="mb-4 p-3 sm:p-4 bg-green-50 rounded text-green-900 text-xs sm:text-sm">
              <b>Votre compte existe déjà !</b><br />
              Nous allons créer une nouvelle demande pour le <strong>Niveau {formData.niveau}</strong> avec votre compte existant.
              <br /><br />
              Cliquez sur "Confirmer la demande" pour finaliser.
            </div>
          ) : (
            // Cas nouvel utilisateur - définir un mot de passe
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded text-blue-900 text-xs sm:text-sm">
              Merci pour votre préinscription.<br />
              <b>Pour suivre l'évolution de votre dossier, accéder à vos documents et recevoir des notifications, veuillez définir un mot de passe pour activer votre espace personnel.</b>
            </div>
          )}
          
          {!skipPassword && (
            <div className="grid grid-cols-1 gap-3 mb-3">
              <input name="password" type="password" required placeholder="Définir un mot de passe" className="border rounded px-3 py-2 text-sm" value={passwords.password} onChange={handlePasswordChange} />
              <input name="confirmPassword" type="password" required placeholder="Confirmer le mot de passe" className="border rounded px-3 py-2 text-sm" value={passwords.confirmPassword} onChange={handlePasswordChange} />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors duration-200"
              disabled={
                // Require only minimal fields for step 2
                !(formData.nom && formData.prenom && formData.email && (registrationType === 'entreprise' ? !!formData.entreprise : true))
                || (!skipPassword && (!passwords.password || !passwords.confirmPassword || passwords.password !== passwords.confirmPassword))
              }
            >
              {skipPassword ? 'Confirmer la demande' : 'Valider le mot de passe'}
            </button>
            <button type="button" onClick={onClose} className="text-gray-500 underline text-sm">Annuler</button>
          </div>
        </>
      )}
    </form>
  );
}

export default function SessionDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (params.id) {
      const sessionId = params.id as string;
      const foundSession = sessions.find(s => s.id === sessionId);
      setCurrentSession(foundSession);
    }
  }, [params.id]);

  if (!currentSession) {
    return (
      <main className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto text-gray-800">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">Session non trouvée</h1>
          <p className="text-gray-600 mb-6">La session demandée n'existe pas.</p>
          <Link 
            href="/sessions" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            ← Retour aux sessions
          </Link>
        </div>
      </main>
    );
  }

  const sessionLabel = `${currentSession.annee} ${currentSession.mois} ${currentSession.dates}`;
  const isDisabled = currentSession.dates.toLowerCase().includes('non programmé');

  return (
    <main className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto text-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-800 mb-4">
        Suivez une formation cordiste IRATA en France Chez CI.DES
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Session ID: {currentSession.id} - {sessionLabel}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="https://cides.tf/formations-accueil/formation-france/formation-cordistes/" 
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            ← Retour aux sessions
          </Link>
        </div>
      </div>

      {/* Détails de la session */}
      {/* <section className="mb-8 bg-gray-50 rounded-xl sm:rounded-2xl shadow-inner p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-800">
          Détails de la session
        </h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID de la session</label>
              <p className="text-lg font-bold text-blue-600">#{currentSession.id}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Année</label>
              <p className="text-lg">{currentSession.annee}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mois</label>
              <p className="text-lg capitalize">{currentSession.mois}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dates</label>
              <p className="text-lg">{currentSession.dates}</p>
            </div>
          </div>
          
          {!isDisabled && (
            <div className="text-center">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
              >
                {showForm ? 'Masquer le formulaire' : 'Afficher le formulaire'}
              </button>
            </div>
          )}
          
          {isDisabled && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold">Cette session n'est pas encore programmée</p>
            </div>
          )}
        </div>
      </section> */}

      {/* Formulaire d'inscription */}
      {showForm && !isDisabled && (
        <section className="mb-8">
          <SessionRegisterForm 
            sessionLabel={sessionLabel} 
            onClose={() => setShowForm(false)} 
          />
        </section>
      )}

      {/* Informations complémentaires */}
      {/* <section className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-inner">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Prêt à TRANSFORMER votre carrière ?</h2>
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 animate-pulse">
          <span className="text-sm font-bold">DERNIÈRES PLACES DISPONIBLES</span>
        </div>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto text-sm sm:text-base font-medium">
          <span className="text-2xl">🇫🇷</span> Suivez une formation cordiste IRATA <span className="bg-blue-200 px-2 py-1 rounded font-bold">EXCLUSIVEMENT en France</span> chez CI.DES et décollez vers un avenir professionnel exceptionnel!
        </p>
        <Link
          href="/register"
          className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold hover:from-blue-800 hover:to-purple-800 hover:scale-110 transition-all duration-300 text-sm sm:text-base shadow-xl border-2 border-white/20 animate-pulse"
        >
          ACCÉDER À MON ESPACE
        </Link>
      </section> */}
    </main>
  );
}
