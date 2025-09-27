'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

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
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    message: '',
    session: sessionLabel,
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: préinscription, 2: mot de passe
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);
  const [alreadyUser, setAlreadyUser] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'USER', step: 1 }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Une erreur est survenue');
        }
        if (data.userExists) {
          setAlreadyUser(true);
        } else {
          setStep(2);
        }
      } catch (err: any) {
        setError(err.message);
      }
    } else if (step === 2) {
      if (Object.values(formData).some((field) => !field)) {
        setError('Veuillez compléter tous les champs du formulaire de préinscription.');
        setStep(1);
        return;
      }
      if (passwords.password !== passwords.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            password: passwords.password,
            role: 'USER',
            step: 2,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Une erreur est survenue');
        }
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (success) {
    return (
      <div className="p-4 sm:p-6 text-green-700 bg-green-50 border border-green-200 rounded-lg mb-4 max-w-md mx-auto shadow-sm">
        <p className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Inscription réussie !</p>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm">Vous pouvez maintenant vous connecter à votre espace personnel.</p>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
          <Link href="/login" className="px-3 sm:px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold no-underline text-sm transition-colors duration-200">
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
    <form className="p-4 sm:p-6 border border-gray-200 rounded-lg mb-4 bg-white max-w-md mx-auto shadow-sm" onSubmit={handleSubmit}>
      <div className="mb-3 font-semibold text-blue-800 text-sm sm:text-base">Session choisie : {sessionLabel}</div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded mb-3 text-xs sm:text-sm" role="alert">
          {error}
        </div>
      )}
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <input name="prenom" type="text" required className="border rounded px-3 py-2 w-full text-sm" value={formData.prenom} onChange={handleChange} />
              <label className="block text-xs text-gray-700 mt-1">Prénom</label>
            </div>
            <div>
              <input name="nom" type="text" required className="border rounded px-3 py-2 w-full text-sm" value={formData.nom} onChange={handleChange} />
              <label className="block text-xs text-gray-700 mt-1">Nom</label>
            </div>
          </div>
          <div className="mb-3">
            <input name="email" type="email" required className="border rounded px-3 py-2 w-full text-sm" value={formData.email} onChange={handleChange} />
            <label className="block text-xs text-gray-700 mt-1">Email <span className="text-red-600">*</span></label>
          </div>
          <div className="mb-3">
            <textarea name="message" required className="border rounded px-3 py-2 w-full text-sm" rows={3} value={formData.message} onChange={handleChange} />
            <label className="block text-xs text-gray-700 mt-1 font-semibold">Message</label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors duration-200">Envoyer la pré-inscription</button>
            <button type="button" onClick={onClose} className="text-gray-500 underline text-sm">Annuler</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded text-blue-900 text-xs sm:text-sm">
            Merci pour votre préinscription.<br />
            <b>Pour suivre l'évolution de votre dossier, accéder à vos documents et recevoir des notifications, veuillez définir un mot de passe pour activer votre espace personnel.</b>
          </div>
          <div className="grid grid-cols-1 gap-3 mb-3">
            <input name="password" type="password" required placeholder="Définir un mot de passe" className="border rounded px-3 py-2 text-sm" value={passwords.password} onChange={handlePasswordChange} />
            <input name="confirmPassword" type="password" required placeholder="Confirmer le mot de passe" className="border rounded px-3 py-2 text-sm" value={passwords.confirmPassword} onChange={handlePasswordChange} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors duration-200" disabled={Object.values(formData).some((f) => !f) || !passwords.password || !passwords.confirmPassword || passwords.password !== passwords.confirmPassword}>Valider le mot de passe</button>
            <button type="button" onClick={onClose} className="text-gray-500 underline text-sm">Annuler</button>
          </div>
        </>
      )}
    </form>
  );
}

function SessionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionParam = searchParams.get('session');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (sessionParam) {
      const sessionLabel = sessionParam.replace(/_/g, ' ');
      const idx = sessions.findIndex(
        s => `${s.annee} ${s.mois} ${s.dates}`.replace(/\s+/g, ' ').trim() === sessionLabel
      );
      if (idx !== -1 && !sessions[idx].dates.toLowerCase().includes('non programmé')) setOpenIdx(idx);
    }
  }, [sessionParam]);

  return (
    <main className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto text-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-800 mb-4">
          🏆 Sessions de Formation Cordiste IRATA
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Choisissez votre session et inscrivez-vous dès maintenant
        </p>
        <Link 
          href="/" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          ← Retour à l'accueil
        </Link>
      </div>

      {/* Prochaines sessions */}
      <section className="mb-8 sm:mb-12 bg-gray-50 rounded-xl sm:rounded-2xl shadow-inner p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-800 animate-fade-in">
           Prochaines sessions EXCLUSIVES en France / Pré-inscription URGENTE
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg sm:rounded-xl shadow text-xs sm:text-sm border border-gray-200">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-2 sm:px-4 text-left w-6 sm:w-8"></th>
                <th className="py-2 px-2 sm:px-4 text-left">ID</th>
                <th className="py-2 px-2 sm:px-4 text-left">Année</th>
                <th className="py-2 px-2 sm:px-4 text-left">Mois</th>
                <th className="py-2 px-2 sm:px-4 text-left">Dates</th>
                <th className="py-2 px-2 sm:px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => {
                const sessionLabel = `${session.annee} ${session.mois} ${session.dates}`;
                const isOpen = openIdx === idx;
                const isDisabled = session.dates.toLowerCase().includes('non programmé');
                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={
                        (idx % 2 === 0 ? 'bg-white' : 'bg-gray-100') +
                        (!isDisabled ? ' cursor-pointer hover:bg-blue-100 transition-colors duration-200' : ' opacity-60')
                      }
                      onClick={() => {
                        if (!isDisabled) setOpenIdx(isOpen ? null : idx);
                      }}
                    >
                      <td className="py-2 px-2 sm:px-4 align-top select-none">
                        <span className="text-lg sm:text-xl font-bold text-blue-700">
                          {isOpen ? '-' : '+'}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">
                        <span className="font-bold text-blue-600">#{session.id}</span>
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.annee}</td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.mois}</td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.dates}</td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">
                        <Link 
                          href={`/sessions/${session.id}`}
                          className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                    {isOpen && !isDisabled && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <SessionRegisterForm sessionLabel={sessionLabel} onClose={() => setOpenIdx(null)} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Informations complémentaires */}
      <section className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-inner">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 animate-fade-in"> Prêt à TRANSFORMER votre carrière ?</h2>
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 animate-pulse">
          <span className="text-sm font-bold"> DERNIÈRES PLACES DISPONIBLES</span>
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
      </section>
    </main>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionsContent />
    </Suspense>
  );
}
