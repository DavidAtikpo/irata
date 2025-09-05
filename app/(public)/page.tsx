'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import LanguageSelector from '../components/LanguageSelector';

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
  const rotatingMessages = [
    "  Formation cordiste IRATA actuellement en cours — Saisissez cette chance unique!",
    " Places ultra-limitées — Réservez MAINTENANT pour ne pas regretter",
    " TOUT INCLUS: Hébergement + formation + certification — 1350€ seulement!",
    " Certification IRATA",
    "  débutant à cordiste certifié en 6 jours",
   
  ];
  const [motdIdx, setMotdIdx] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const trainingImages = [
    {
      src: '/formations/centre.jpg',
      alt: 'Formation cordiste en action - Progression sur cordes',
      title: '🧗‍♂️ Progression sur cordes',
      description: 'Apprentissage des techniques de progression verticale en toute sécurité'
    },
    {
      src: '/formations/cides1.jpg', 
      alt: 'Centre de formation CI.DES - Équipements professionnels',
      title: '🎯 Équipements professionnels',
      description: 'Matériel de dernière génération pour un apprentissage optimal'
    },
    {
      src: '/formations/cides2.jpg',
      alt: '',
      title: '',
      description: ''
    },
    {
      src: '/formations/Formation cordiste.jpg',
      alt: 'Examen pratique IRATA',
      title: '📝 Examen pratique',
      description: 'Évaluation rigoureuse selon les standards IRATA'
    },
    {
      src: '/formations/formation-cordiste-1',
      alt: 'Centre CI.DES en Nouvelle-Aquitaine',
      title: '🏢 Centre CI.DES ',
      description: 'France Nouvelle-Aquitaine'
    }
  ];

  useEffect(() => {
    if (sessionParam) {
      const sessionLabel = sessionParam.replace(/_/g, ' ');
      const idx = sessions.findIndex(
        s => `${s.annee} ${s.mois} ${s.dates}`.replace(/\s+/g, ' ').trim() === sessionLabel
      );
      if (idx !== -1 && !sessions[idx].dates.toLowerCase().includes('non programmé')) setOpenIdx(idx);
    }
  }, [sessionParam]);

  useEffect(() => {
    const id = setInterval(() => {
      setMotdIdx((prev) => (prev + 1) % rotatingMessages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trainingImages.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [trainingImages.length]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trainingImages.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trainingImages.length) % trainingImages.length);
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <main className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto text-gray-800">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      {/* Financement Participatif Banner (Investisseurs) */}
      <section className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 text-white rounded-2xl sm:rounded-3xl shadow-2xl px-4 sm:px-6 py-6 sm:py-8 text-center mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 sm:mb-3">
           OPPORTUNITÉ UNIQUE: Investissez dans l'un des premiers centres de multi-formations en sécurité du Togo
        </h2>

        <p className="text-xs sm:text-sm md:text-base opacity-90 mb-3 sm:mb-4">
          <span className="animate-pulse"> DERNIERS JOURS:</span> Rejoignez nos investisseurs pionniers et participez à la success story du centre — Chaque euro compte et rapporte!
        </p>
        <Link
          href="/financement-participatif"
          className="inline-block bg-white text-green-600 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-sm sm:text-base mr-2 sm:mr-4 border-2 border-white"
        >
           Découvrir les opportunités
        </Link>
        <Link
          href="/financement-participatif#contribuer"
          className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-green-900 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:from-yellow-300 hover:to-orange-300 hover:scale-105 transition-all duration-300 text-sm sm:text-base animate-pulse"
        >
          💰 INVESTIR MAINTENANT
        </Link>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-lg animate-bounce"></div>
      </section>

      {/* Hero Section (Inscriptions) */}
      <section className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 text-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center mb-8 sm:mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20"></div>
        <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-lg mb-4 sm:mb-6 animate-bounce">
          <span className="text-2xl sm:text-3xl animate-pulse">🇫🇷</span>
          <span className="text-sm sm:text-base font-bold tracking-wide"> EN FRANCE — Opportunité historique à saisir!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 sm:mb-3 animate-fade-in">
          🏆 Formation Cordiste IRATA en France <span className="text-yellow-700 bg-yellow-200/30 px-2 py-1 rounded">– CI.DES</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-2 font-bold">
          ⚡ 5 Jours Intensifs + 1 Jour d'Examen, Hébergement Inclus, <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-lg animate-pulse">SEULEMENT 1350 € Net</span>
        </p>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base">France, Nouvelle-Aquitaine, en Campagne (17)</p>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 italic">
          {rotatingMessages[motdIdx]}
        </p>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-800 font-medium">
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold"> ALERTE:</span> Inscrivez-vous AUJOURD'HUI pour garantir votre place! Accompagnement  personnalisé, entraînement, et certification
          plébiscitée par les employeurs. <span className="text-red-600 font-bold animate-pulse">Les places s'envolent — RÉSERVEZ IMMÉDIATEMENT!</span>
        </p>
        <Link
          href="#preinscription"
          className="inline-block bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-xl hover:from-blue-800 hover:to-blue-950 hover:scale-110 active:scale-95 transition-all duration-300 text-base sm:text-lg animate-pulse border-2 border-blue-300"
        >
           RÉSERVER MA PLACE MAINTENANT
        </Link>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-2xl animate-bounce"></div>
      </section>

             {/* Slider photos de formation */}
       <section className="mb-8 sm:mb-12">
         <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-blue-800">
            Découvrez notre centre de formation en images
         </h2>
         <div className="relative max-w-6xl mx-auto">
           <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]  overflow-hidden shadow-2xl">
             {trainingImages.map((image, index) => (
               <div
                 key={index}
                 className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                   index === currentSlide ? 'opacity-100' : 'opacity-0'
                 }`}
               >
                 <div className="relative h-full">
                   <Image
                     src={image.src}
                     alt={image.alt}
                     fill
                     className="object-cover"
                     priority={index === 0}
                     unoptimized={true}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                   <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                     <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                       {image.title}
                     </h3>
                     <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                       {image.description}
                     </p>
                   </div>
                 </div>
               </div>
             ))}
             
             {/* Boutons de navigation */}
             <button
               onClick={prevSlide}
               className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
               aria-label="Photo précédente"
             >
               <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
             </button>
             <button
               onClick={nextSlide}
               className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
               aria-label="Photo suivante"
             >
               <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
             </button>
             
             {/* Indicateurs de slides */}
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
               {trainingImages.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => goToSlide(index)}
                   className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                     index === currentSlide
                       ? 'bg-white scale-125'
                       : 'bg-white/50 hover:bg-white/80'
                   }`}
                   aria-label={`Aller à la photo ${index + 1}`}
                 />
               ))}
             </div>
           </div>
           
           {/* Compteur de slides */}
           <div className="text-center mt-4">
             <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
               {currentSlide + 1} / {trainingImages.length}
             </span>
           </div>
         </div>
       </section>
       {/* Section Vidéo */}
       <section className="mb-8 ">
         <div className="max-w-4xl mx-auto">
           <div className="relative bg-gradient-to-br from-blue-50 to-purple-50">
             <div className="relative aspect-video  overflow-hidden shadow-2xl">
               <video
                  className="w-full h-full object-cover"
                  controls
                  poster="/formations/cides2.jpg"
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                >
                 <source src="/formations/centre de formations.mp4" type="video/mp4" />
                 {/* <source src="/formations/formation-cordiste.webm" type="video/webm" /> */}
                 Votre navigateur ne supporte pas la lecture de vidéos.
               </video>
               {/* Overlay avec bouton play personnalisé */}
               {/* <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors duration-300">
                 <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-lg">
                   <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z"/>
                   </svg>
                 </div>
               </div> */}
             </div>
             <div className="mt-4 sm:mt-6 text-center">
               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Formation Cordiste IRATA - CI.DES en action
               </h3>
               
             </div>
           </div>
         </div>
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
            title: 'Lieu 🇫🇷',
            value: 'Nouvelle-Aquitaine (17), France',
          },
        ].map((info, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-l-4 border-blue-500"
          >
            <span className="text-blue-700 font-bold text-base sm:text-lg mb-1 animate-fade-in">{info.title}</span>
            <span className="text-gray-700 text-sm sm:text-base font-medium">{info.value}</span>
          </div>
        ))}
      </section>

      {/* Prochaines sessions */}
      <section id="preinscription" className="mb-8 sm:mb-12 bg-gray-50 rounded-xl sm:rounded-2xl shadow-inner p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-800 animate-fade-in">
           Prochaines sessions EXCLUSIVES en France / Pré-inscription URGENTE
        </h2>
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
          <h2 className="text-lg sm:text-xl font-bold mb-3">🏆 Pourquoi CI.DES est LE choix gagnant ?</h2>
          <p className="mb-3 text-sm sm:text-base font-medium"><span className="bg-yellow-200 px-2 py-1 rounded font-bold">🇫🇷 EXCLUSIF FRANCE:</span> CI.DES est un centre d'excellence reconnu, stratégiquement situé dans le Sud-Ouest en Nouvelle-Aquitaine, qui transforme chaque année des débutants en cordistes professionnels très recherchés. Notre campus exclusif à 70 km de Bordeaux, en pleine campagne, garantit un apprentissage optimal dans des conditions réelles et sereines.</p>
          <h3 className="font-bold mb-1 text-sm sm:text-base text-green-700">💰 Débouchés EXCEPTIONNELS du métier de cordiste</h3>
          <p className="mb-3 text-sm sm:text-base"><span className="font-bold text-green-600">SECTEUR EN OR:</span> Le métier de cordiste vous propulse vers des emplois très bien rémunérés dans le BTP, l'éolien offshore, l'industrie pétrochimique, en France et à l'international. La certification IRATA est votre <span className="bg-green-200 px-1 rounded font-bold">passeport VIP</span> vers un secteur en pénurie de talents qualifiés!</p>
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Objectifs de la formation</h3>
          <ul className="list-disc list-inside mb-3 text-gray-700 text-sm sm:text-base">
            <li>Acquérir les techniques de progression sur cordes et de sécurité</li>
            <li>Maîtriser les manœuvres de secours et bonnes pratiques du travail en hauteur</li>
            <li>Préparer l'examen IRATA selon les normes internationales</li>
          </ul>
          <h3 className="font-bold mb-1 text-sm sm:text-base text-blue-700"> Cette formation TRANSFORMATRICE s'adresse à VOUS!</h3>
          <p className="mb-3 text-sm sm:text-base"><span className="bg-blue-200 px-2 py-1 rounded font-bold">ACCESSIBLE À TOUS:</span> Débutants motivés ou professionnels ambitieux souhaitant décrocher la certification IRATA. Conditions: être majeur, médicalement apte, et en bonne condition physique. <span className="text-red-600 font-bold">C'est VOTRE moment!</span></p>
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
            <li><b>Lieu 🇫🇷 :</b> Chez Chagneau, 17270 Boresse-et-Martron (GPS : 45.286198, -0.145154)</li>
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
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">❓ FAQ – Formation cordiste IRATA 🇫🇷</h2>
        <div className="text-center mb-6">
          <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold animate-pulse">💬 Réponses aux questions les plus posées</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="bg-blue-50 p-3 rounded-lg mb-3 border-l-4 border-blue-500">
              <h4 className="font-bold mb-1 text-sm sm:text-base text-blue-800">💰 Combien coûte la formation ?</h4>
              <p className="mb-0 text-gray-700 text-sm sm:text-base"><span className="font-bold text-green-600">PRIX IMBATTABLE:</span> Seulement 1350€ Net, tout compris (hébergement VIP inclus)!</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg mb-3 border-l-4 border-green-500">
              <h4 className="font-bold mb-1 text-sm sm:text-base text-green-800">⏱️ Combien de temps dure la formation ?</h4>
              <p className="mb-0 text-gray-700 text-sm sm:text-base"><span className="font-bold text-blue-600">INTENSIF & EFFICACE:</span> 5 jours de cours concentrés + 1 jour d'examen, soit 48h de formation professionnelle ultra-qualifiante.</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg mb-3 border-l-4 border-yellow-500">
              <h4 className="font-bold mb-1 text-sm sm:text-base text-yellow-800">🎖️ La formation est-elle reconnue ?</h4>
              <p className="mb-0 text-gray-700 text-sm sm:text-base"><span className="font-bold text-purple-600">RECONNAISSANCE MONDIALE:</span> Oui! La certification IRATA est le GOLD STANDARD reconnu en France et dans le monde entier.</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Où se déroule la formation 🇫🇷 ?</h4>
            <p className="mb-3 text-gray-700 text-sm sm:text-base"><span className="font-bold">🇫🇷 EN FRANCE:</span> CI.DES, Chez Chagneau, 17270 Boresse-et-Martron, Nouvelle-Aquitaine.</p>
            <div className="bg-red-50 p-3 rounded-lg mb-3 border-l-4 border-red-500">
              <h4 className="font-bold mb-1 text-sm sm:text-base text-red-800"> Comment s'inscrire ?</h4>
              <p className="mb-0 text-gray-700 text-sm sm:text-base"><span className="font-bold text-orange-600">PROCÉDURE EXPRESS:</span> Remplissez notre formulaire pour un devis personnalisé instantané et réservez votre place. <span className="text-red-600 font-bold animate-pulse">⚠️ ATTENTION: Places ultra-limitées!</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="demande" className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center shadow-inner">
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
