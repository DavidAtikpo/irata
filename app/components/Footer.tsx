import Link from 'next/link';
import Image from 'next/image';

const socialLinks = [
  {
    href: 'https://twitter.com/',
    label: 'X',
    svg: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="inline">
        <path fill="currentColor" d="M17.53 6.47a.75.75 0 0 0-1.06 0l-4.47 4.47-4.47-4.47a.75.75 0 1 0-1.06 1.06l4.47 4.47-4.47 4.47a.75.75 0 1 0 1.06 1.06l4.47-4.47 4.47 4.47a.75.75 0 1 0 1.06-1.06l-4.47-4.47 4.47-4.47a.75.75 0 0 0 0-1.06z"/>
      </svg>
    ),
  },
  {
    href: 'https://facebook.com/',
    label: 'Facebook',
    svg: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="inline">
        <path fill="currentColor" d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12z"/>
      </svg>
    ),
  },
  {
    href: 'https://instagram.com/',
    label: 'Instagram',
    svg: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="inline">
        <rect width="18" height="18" x="3" y="3" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: 'https://youtube.com/',
    label: 'YouTube',
    svg: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="inline">
        <rect width="20" height="14" x="2" y="5" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <polygon points="10,9 16,12 10,15" fill="currentColor"/>
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <Image 
              src="/logoCIDES-formations-cordistes.png" 
              alt="CI.DES Logo" 
              width={140} 
              height={60} 
              className="object-contain w-32 sm:w-36 lg:w-40" 
            />
          </div>
          
          {/* Copyright centré */}
          <div className="text-center lg:flex-1">
            <span className="text-gray-300 text-xs sm:text-sm" data-wg-notranslate>
              © 2025 CI.DES - Formation Cordiste IRATA
            </span>
            <p className="text-gray-400 text-xs mt-1" data-wg-notranslate>
              Nouvelle-Aquitaine, France
            </p>
          </div>
          
          {/* Réseaux sociaux à droite */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex flex-col items-center group"
              >
                <span className="text-xl sm:text-2xl group-hover:text-yellow-400 transition-colors duration-200">{item.svg}</span>
                <span className="block w-4 sm:w-6 h-1 bg-yellow-400 mt-1 rounded group-hover:w-6 sm:group-hover:w-8 transition-all duration-200"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
