'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function SearchIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-gray-700">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = [
  { href: '/', label: 'ACCUEIL' },
  { href: '/formations', label: 'FORMATIONS' },
  { href: '/contact', label: 'CONTACTS' },
  { href: '/histoire', label: 'HISTOIRE' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="CI.DES Logo"
                width={260}
                height={70}
                className="object-contain w-20 sm:w-20 lg:w-20"
                priority
              />
            </Link>
          </div>

          {/* Menu desktop + loupe à droite */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  className="uppercase font-semibold text-black tracking-wide px-2 text-sm lg:text-[15px] hover:text-blue-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
                {pathname === link.href && (
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-yellow-400 rounded" />
                )}
              </div>
            ))}
            <button aria-label="Recherche" className="focus:outline-none hover:text-blue-600 transition-colors duration-200">
              <SearchIcon />
            </button>
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium uppercase tracking-wide transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button 
                aria-label="Recherche" 
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <SearchIcon />
                  <span className="ml-2">Recherche</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
