'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

function SearchIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-gray-700">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/formations', label: 'Formations' },
  { href: '/contact', label: 'Contacts' },
  { href: '/historique', label: 'Historique' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isWeglotReady, setIsWeglotReady] = useState(false);



  return (
    <header className="bg-white shadow sticky top-0 z-50 border-b border-orange-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-10 sm:h-14 lg:h-16 ">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="CI.DES Logo"
                width={100}
                height={100}
                className="object-contain w-10 sm:w-10 lg:w-10"
                priority
              />
            </Link>
          </div>

          {/* Menu desktop + loupe à droite */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <Link
              href="/login"
              className="ml-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              data-wg-notranslate="true"
            >
              Accéder à mon espace
            </Link>
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  className="uppercase font-semibold text-black tracking-wide px-2 text-xs lg:text-sm hover:text-blue-600 transition-colors duration-200 no-translate"
                  data-wg-notranslate="true"
                >
                  {link.label}
                </Link>
                {pathname === link.href && (
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-yellow-400 rounded" />
                )}
              </div>
            ))}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                href="/dashboard"
                className="block w-full text-center px-3 py-2 rounded-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
                data-wg-notranslate="true"
              >
                Accéder à mon espace
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium uppercase tracking-wide transition-colors duration-200 no-translate ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-wg-notranslate="true"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

