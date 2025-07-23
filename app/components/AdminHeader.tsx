'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CalendarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const navigationTabs = [
  {
    name: 'Suivi stagiaires',
    href: '/admin/suivi-stagiaire',
    icon: UserGroupIcon,
    description: 'Suivi des stagiaires en formation'
  },
  {
    name: 'Suivi IRATA',
    href: '/admin/suivi-irata',
    icon: ShieldCheckIcon,
    description: 'Suivi des certifications IRATA'
  },
  {
    name: 'Liste présence',
    href: '/admin/liste-presence',
    icon: CalendarIcon,
    description: 'Gestion des présences'
  },
  {
    name: 'Rapports',
    href: '/admin/rapports',
    icon: ChartBarIcon,
    description: 'Rapports et statistiques'
  },
  {
    name: 'Paramètres',
    href: '/admin/parametres',
    icon: CogIcon,
    description: 'Configuration du système'
  }
];

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveTab = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Barre principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            {/* Bouton toggle sidebar */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                title="Basculer la sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            
            <div className="flex-shrink-0">
              <Link href="/admin">
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600">IRATA Admin</h1>
              </Link>
            </div>
          </div>

          {/* Barre de recherche centrale */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher stagiaires, formations, documents..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
              >
                <BellIcon className="h-6 w-6" />
                {/* Badge de notification */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* Dropdown notifications */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Nouvelle demande de formation</p>
                          <p className="text-sm text-gray-500">Jean Dupont a soumis une demande</p>
                          <p className="text-xs text-gray-400">Il y a 5 minutes</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-green-400 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Contrat signé</p>
                          <p className="text-sm text-gray-500">Marie Martin a signé son contrat</p>
                          <p className="text-xs text-gray-400">Il y a 1 heure</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link href="/admin/notifications" className="text-sm text-indigo-600 hover:text-indigo-500">
                        Voir toutes les notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profil utilisateur */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {/* Avatar */}
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.name ? getInitials(session.user.name) : 'AD'}
                  </span>
                </div>
                
                {/* Nom et rôle */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Administrateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.role || 'ADMIN'}
                  </p>
                </div>
                
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name || 'Administrateur'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session?.user?.email || 'admin@irata.com'}
                      </p>
                    </div>
                    
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-2" />
                        Mon profil
                      </div>
                    </Link>
                    
                    <Link
                      href="/admin/parametres"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center">
                        <CogIcon className="h-4 w-4 mr-2" />
                        Paramètres
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de navigation avec onglets */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isActiveTab(tab.href);
              
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
} 