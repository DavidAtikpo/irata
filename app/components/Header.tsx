'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo à gauche */}
          <div className="flex items-center min-w-[320px]">
            <Link href="/">
              <Image
                src="/logoCIDES-formations-cordistes.png"
                alt="CI.DES Logo"
                width={260}
                height={90}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Menu + loupe à droite */}
          <div className="flex items-center space-x-4 ml-auto">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  className="uppercase font-semibold text-black tracking-wide px-2 text-[15px]"
                >
                  {link.label}
                </Link>
                {pathname === link.href && (
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-yellow-400 rounded" />
                )}
              </div>
            ))}
            <button aria-label="Recherche" className="focus:outline-none">
              <SearchIcon />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
