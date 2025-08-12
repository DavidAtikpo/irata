'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const sessions = [
  { annee: '2025', mois: 'janvier', dates: 'Non programmé' },
  { annee: '2025', mois: 'février', dates: '03 au 08' },
  { annee: '2025', mois: 'mars', dates: 'Non programmé; Modifiable selon la demande' },
  { annee: '2025', mois: 'avril', dates: '31 mars au 05 avril' },
  { annee: '2025', mois: 'avril', dates: '21 au 26' },
  { annee: '2025', mois: 'juin', dates: '02 juin au 07 juin' },
  { annee: '2025', mois: 'juillet', dates: '30 juin au 05 juillet' },
  { annee: '2025', mois: 'juillet', dates: '21 au 26' },
  { annee: '2025', mois: 'aout', dates: '18 au 23' },
  { annee: '2025', mois: 'septembre', dates: '01 au 06' },
  { annee: '2025', mois: 'octobre', dates: '06 au 11' },
  { annee: '2025', mois: 'novembre', dates: '03 au 08' },
  // { annee: '2025', mois: 'décembre', dates: '15 au 20' },
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
          body: JSON.stringify({ ...formData, step: 1 }),
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

function HomeContent() {
  const searchParams = useSearchParams();
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
      {/* Financement Participatif Banner */}
      <section className="bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-2xl sm:rounded-3xl shadow-lg px-4 sm:px-6 py-6 sm:py-8 text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 sm:mb-3">
          🎯 Aidez-nous à équiper l'un des premiers centres de multi formations en sécurité du Togo
        </h2>
        <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 opacity-90">
          Participez au développement d'un centre de formation révolutionnaire avec des avantages exclusifs pour vous !
        </p>
        <Link
          href="/financement-participatif"
          className="inline-block bg-white text-green-600 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-sm sm:text-base mr-2 sm:mr-4"
        >
          Découvrir le projet
        </Link>
        <Link
          href="/financement-participatif#contribuer"
          className="inline-block bg-yellow-400 text-green-800 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:bg-yellow-300 transition duration-300 text-sm sm:text-base"
        >
          Contribuer maintenant
        </Link>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-gray-800 rounded-2xl sm:rounded-3xl shadow-lg px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
          Formation Cordiste IRATA en France <span className="text-yellow-700">– CI.DES</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-2 font-semibold">
          5 Jours + 1 Jour d'Examen, Hébergement Inclus, <span className="text-blue-700">1350 € Net</span>
        </p>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base">France, Nouvelle-Aquitaine, en Campagne (17)</p>
        <Link
          href="#preinscription"
          className="inline-block bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-md hover:bg-blue-800 transition duration-300 text-sm sm:text-base"
        >
          Préinscription
        </Link>
      </section>

      {/* Infos clés */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {[
          {
            title: 'Durée',
            value: '5 jours + 1 jour examen',
          },
          {
            title: 'Prix',
            value: '1350 € Net (hébergement inclus)',
          },
          {
            title: 'Certification',
            value: 'IRATA reconnue internationalement',
          },
          {
            title: 'Lieu',
            value: 'Nouvelle-Aquitaine (17), France',
          },
        ].map((info, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200"
          >
            <span className="text-blue-700 font-bold text-base sm:text-lg mb-1">{info.title}</span>
            <span className="text-gray-700 text-sm sm:text-base">{info.value}</span>
          </div>
        ))}
      </section>

      {/* Prochaines sessions */}
      <section id="preinscription" className="mb-8 sm:mb-12 bg-gray-50 rounded-xl sm:rounded-2xl shadow-inner p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-800">Prochaines sessions / Pré-inscription</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg sm:rounded-xl shadow text-xs sm:text-sm border border-gray-200">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-2 sm:px-4 text-left w-6 sm:w-8"></th>
                <th className="py-2 px-2 sm:px-4 text-left">Année</th>
                <th className="py-2 px-2 sm:px-4 text-left">Mois</th>
                <th className="py-2 px-2 sm:px-4 text-left">Dates</th>
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
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.annee}</td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.mois}</td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 border-b border-gray-200 align-top">{session.dates}</td>
                    </tr>
                    {isOpen && !isDisabled && (
                      <tr>
                        <td colSpan={4} className="p-0">
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

      {/* Présentation détaillée */}
      <section className="mb-8 sm:mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-3">Pourquoi choisir CI.DES ?</h2>
          <p className="mb-3 text-sm sm:text-base">CI.DES est un centre reconnu, situé dans le Sud-Ouest en Nouvelle-Aquitaine, qui forme chaque année des cordistes professionnels. Notre centre est implanté à 70 km de Bordeaux, en pleine campagne, pour un apprentissage dans des conditions réelles et sereines.</p>
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Débouchés du métier de cordiste</h3>
          <p className="mb-3 text-sm sm:text-base">Le métier de cordiste donne accès à des emplois dans le BTP, l'éolien, l'industrie, en France et à l'international. La certification IRATA vous ouvre les portes d'un secteur en forte demande.</p>
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Objectifs de la formation</h3>
          <ul className="list-disc list-inside mb-3 text-gray-700 text-sm sm:text-base">
            <li>Acquérir les techniques de progression sur cordes et de sécurité</li>
            <li>Maîtriser les manœuvres de secours et bonnes pratiques du travail en hauteur</li>
            <li>Préparer l'examen IRATA selon les normes internationales</li>
          </ul>
          <h3 className="font-semibold mb-1 text-sm sm:text-base">À qui s'adresse cette formation ?</h3>
          <p className="mb-3 text-sm sm:text-base">Débutants ou professionnels souhaitant obtenir la certification IRATA. Être apte médicalement, majeur, en bonne condition physique.</p>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-3">Détails pratiques</h2>
          <ul className="mb-3 text-gray-700 text-sm sm:text-base">
            <li><b>Durée :</b> 5 jours de cours (40h) + 1 jour d'examen (samedi)</li>
            <li><b>Hébergement :</b> Inclus dans le tarif</li>
            <li><b>Matériel :</b> Fourni</li>
            <li><b>Certification :</b> IRATA reconnue en France et à l'international</li>
            <li><b>NDA :</b> 75170322717</li>
            <li><b>Accessibilité :</b> Accès possible aux personnes en situation de handicap (nous contacter)</li>
            <li><b>Lieu :</b> Chez Chagneau, 17270 Boresse-et-Martron (GPS : 45.286198, -0.145154)</li>
          </ul>
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Méthodes pédagogiques</h3>
          <ul className="list-disc list-inside mb-3 text-gray-700 text-sm sm:text-base">
            <li>Alternance théorie/pratique</li>
            <li>Encadrement par des formateurs certifiés IRATA</li>
            <li>Examen par un tiers indépendant</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">FAQ – Formation cordiste IRATA</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Combien coûte la formation ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base">Le tarif est de 1350€ Net, tout compris (hébergement inclus).</p>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Combien de temps dure la formation ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base">5 jours de cours + 1 jour d'examen, soit 48h de formation professionnelle.</p>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">La formation est-elle reconnue ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base">Oui, la certification IRATA est reconnue en France et à l'international.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Où se déroule la formation ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base">CI.DES, Chez Chagneau, 17270 Boresse-et-Martron, Nouvelle-Aquitaine.</p>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Comment s'inscrire ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base">Remplissez notre formulaire en ligne pour recevoir un devis personnalisé et réserver votre place. Attention : nombre de places limité à chaque session.</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="demande" className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-inner">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Prêt à rejoindre la prochaine session ?</h2>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto text-sm sm:text-base">
          Suivez une formation cordiste IRATA en France chez CI.DES et boostez votre avenir professionnel !
        </p>
        <Link
          href="/register"
          className="bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors text-sm sm:text-base"
        >
          Connectez-vous à votre espace personnel
        </Link>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
