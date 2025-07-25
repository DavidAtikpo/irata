'use client';

import { useState } from 'react';

const formationsData = {
  France: {
    titre: 'Formation Cordiste IRATA – France',
    description: 'Formation professionnelle IRATA en Nouvelle-Aquitaine, hébergement inclus, certification reconnue internationalement.',
    infos: [
      { label: 'Lieu', value: 'Nouvelle-Aquitaine, France' },
      { label: 'Durée', value: '5 jours + 1 jour examen' },
      { label: 'Prix', value: '1350 € (hébergement inclus)' },
      { label: 'Certification', value: 'IRATA' },
    ],
    sessions: [
      { annee: '2025', mois: 'janvier', dates: 'Non programmé' },
      { annee: '2025', mois: 'février', dates: '03 au 08' },
      { annee: '2025', mois: 'mars', dates: 'Non programmé; Modifiable selon la demande' },
      { annee: '2025', mois: 'avril', dates: '31 mars au 05 avril' },
      { annee: '2025', mois: 'avril', dates: '21 au 26' },
      { annee: '2025', mois: 'juin', dates: '02 au 07' },
      { annee: '2025', mois: 'juillet', dates: '30 juin au 05 juillet' },
      { annee: '2025', mois: 'juillet', dates: '21 au 26' },
      { annee: '2025', mois: 'aout', dates: '18 au 23' },
      { annee: '2025', mois: 'septembre', dates: '01 au 06' },
      { annee: '2025', mois: 'octobre', dates: '06 au 11' },
      { annee: '2025', mois: 'novembre', dates: '03 au 08' },
      { annee: '2025', mois: 'décembre', dates: '15 au 20' },
    ],
  },
  Togo: {
    titre: 'Formation Cordiste IRATA – Togo',
    description: 'Formation IRATA à Lomé, Togo. Certification internationale, formateurs expérimentés.',
    infos: [
      { label: 'Lieu', value: 'Lomé, Togo' },
      { label: 'Durée', value: '6 jours (dont 1 jour examen)' },
      { label: 'Prix', value: '1 350 € Net (hébergement inclus)' },
      { label: 'Certification', value: 'IRATA' },
    ],
    sessions: [
      { annee: '2025', mois: 'mars', dates: '10 au 15' },
      { annee: '2025', mois: 'juin', dates: '02 au 07' },
      { annee: '2025', mois: 'novembre', dates: '16 au 21' },
    ],
  },
  Gabon: {
    titre: 'Formation Cordiste IRATA – Gabon',
    description: 'Formation IRATA à Libreville, Gabon. Certification reconnue, sessions régulières.',
    infos: [
      { label: 'Lieu', value: 'Libreville, Gabon' },
      { label: 'Durée', value: '5 jours + 1 jour examen' },
      { label: 'Prix', value: '1 350 € Net (hébergement inclus)' },
      { label: 'Certification', value: 'IRATA' },
    ],
    sessions: [
      { annee: '2025', mois: 'mai', dates: '05 au 10' },
      { annee: '2025', mois: 'août', dates: '12 au 17' },
      { annee: '2025', mois: 'octobre', dates: '07 au 12' },
    ],
  },
};

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
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: préinscription, 2: mot de passe
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);

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
        // Ici, tu peux envoyer la préinscription à une API si besoin
        setStep(2);
      } catch (err: any) {
        setError(err.message);
      }
    } else if (step === 2) {
      if (passwords.password !== passwords.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      try {
        // Ici, tu peux envoyer la création du compte à une API si besoin
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (success) {
    return (
      <div className="p-4 text-green-700 bg-green-50 border border-green-200 rounded mb-4 max-w-md mx-auto">
        Inscription réussie ! Vous pouvez maintenant vous connecter.
        <button onClick={onClose} className="ml-4 text-blue-600 underline">Fermer</button>
      </div>
    );
  }

  return (
    <form className="p-4 border border-gray-200 rounded mb-4 bg-white max-w-md mx-auto" onSubmit={handleSubmit}>
      <div className="mb-2 font-semibold text-blue-800">Session choisie : {sessionLabel}</div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-2" role="alert">
          {error}
        </div>
      )}
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <input name="prenom" type="text" required className="border rounded px-3 py-2 w-full" value={formData.prenom} onChange={handleChange} />
              <label className="block text-xs text-gray-700 mt-1">Prénom</label>
            </div>
            <div>
              <input name="nom" type="text" required className="border rounded px-3 py-2 w-full" value={formData.nom} onChange={handleChange} />
              <label className="block text-xs text-gray-700 mt-1">Nom</label>
            </div>
          </div>
          <div className="mb-2">
            <input name="email" type="email" required className="border rounded px-3 py-2 w-full" value={formData.email} onChange={handleChange} />
            <label className="block text-xs text-gray-700 mt-1">Email <span className="text-red-600">*</span></label>
          </div>
          <div className="mb-2">
            <textarea name="message" required className="border rounded px-3 py-2 w-full" value={formData.message} onChange={handleChange} />
            <label className="block text-xs text-gray-700 mt-1 font-semibold">Message</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer la pré-inscription</button>
            <button type="button" onClick={onClose} className="text-gray-500 underline">Annuler</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="grid grid-cols-1 gap-2 mb-2">
            <input name="password" type="password" required placeholder="Définir un mot de passe" className="border rounded px-3 py-2" value={passwords.password} onChange={handlePasswordChange} />
            <input name="confirmPassword" type="password" required placeholder="Confirmer le mot de passe" className="border rounded px-3 py-2" value={passwords.confirmPassword} onChange={handlePasswordChange} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Valider le mot de passe</button>
            <button type="button" onClick={onClose} className="text-gray-500 underline">Annuler</button>
          </div>
        </>
      )}
    </form>
  );
}

export default function FormationsPage() {
  const [selectedCountry, setSelectedCountry] = useState<'France' | 'Togo' | 'Gabon'>('France');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const country = formationsData[selectedCountry];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Formations IRATA</h1>
          <p className="text-lg text-gray-700 mb-4">Choisissez un pays pour voir les informations et sessions d'inscription.</p>
          <div className="flex justify-center gap-4 mb-4">
            {(['France', 'Togo', 'Gabon'] as const).map((pays) => (
              <button
                key={pays}
                onClick={() => { setSelectedCountry(pays); setOpenIdx(null); }}
                className={`px-6 py-2 rounded-full font-semibold border transition-colors ${selectedCountry === pays ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              >
                {pays}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">{country.titre}</h2>
          <p className="mb-4 text-gray-700">{country.description}</p>
          <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {country.infos.map((info, idx) => (
              <li key={idx} className="text-gray-800"><b>{info.label} :</b> {info.value}</li>
            ))}
          </ul>
        </div>
        <section className="mb-12 bg-gray-50 rounded-2xl shadow-inner p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Sessions d'inscription</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm border border-gray-200">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="py-2 px-4 text-left w-8"></th>
                  <th className="py-2 px-4 text-left">Année</th>
                  <th className="py-2 px-4 text-left">Mois</th>
                  <th className="py-2 px-4 text-left">Dates</th>
                </tr>
              </thead>
              <tbody>
                {country.sessions.map((session, idx) => {
                  const sessionLabel = `${session.annee} ${session.mois} ${session.dates}`;
                  const isOpen = openIdx === idx;
                  const isDisabled = session.dates.toLowerCase().includes('non programmé');
                  return (
                    <>
                      <tr
                        key={idx}
                        className={
                          (idx % 2 === 0 ? 'bg-white' : 'bg-gray-100') +
                          (!isDisabled ? ' cursor-pointer hover:bg-blue-100 transition-colors' : ' opacity-60')
                        }
                        onClick={() => {
                          if (!isDisabled) setOpenIdx(isOpen ? null : idx);
                        }}
                      >
                        <td className="py-2 px-4 align-top select-none">
                          <span className="text-xl font-bold text-blue-700">
                            {isOpen ? '-' : '+'}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-gray-800 border-b border-gray-200 align-top">{session.annee}</td>
                        <td className="py-2 px-4 text-gray-800 border-b border-gray-200 align-top">{session.mois}</td>
                        <td className="py-2 px-4 text-gray-800 border-b border-gray-200 align-top">{session.dates}</td>
                      </tr>
                      {isOpen && !isDisabled && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <SessionRegisterForm sessionLabel={sessionLabel} onClose={() => setOpenIdx(null)} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
} 