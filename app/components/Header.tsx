'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              IRATA
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/formations" className="text-gray-600 hover:text-blue-600 transition">
              Formations
            </Link>
            <Link href="/demande" className="text-gray-600 hover:text-blue-600 transition">
              Demander une formation
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">
              Contact
            </Link>

            {session ? (
              <div className="flex space-x-4 items-center">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">
                    Administration
                  </Link>
                )}
                {session.user.role === 'GESTIONNAIRE' && (
                  <Link href="/gestionnaire" className="text-gray-600 hover:text-blue-600 transition">
                    Gestion
                  </Link>
                )}
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition">
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-red-600 transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-4 border-t pt-4">
            <Link href="/formations" className="block text-gray-700 hover:text-blue-600">
              Formations
            </Link>
            <Link href="/demande" className="block text-gray-700 hover:text-blue-600">
              Demander une formation
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-blue-600">
              Contact
            </Link>

            {session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="block text-gray-700 hover:text-blue-600">
                    Administration
                  </Link>
                )}
                {session.user.role === 'GESTIONNAIRE' && (
                  <Link href="/gestionnaire" className="block text-gray-700 hover:text-blue-600">
                    Gestion
                  </Link>
                )}
                <Link href="/profile" className="block text-gray-700 hover:text-blue-600">
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left text-red-600 hover:underline"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block text-white bg-blue-600 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
