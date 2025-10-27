'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useNotificationContext } from '../../contexts/NotificationContext';
import {
  UserCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

const navigationTabs = [
  {
    name: 'Financement Participatif',
    href: '/admin/financement-participatif',
    icon: CurrencyDollarIcon,
    description: 'Gestion du financement participatif'
  },
  {
    name: 'Suivi IRATA',
    href: '/admin/suivi-irata',
    icon: ShieldCheckIcon,
    description: 'Suivi des certifications IRATA'
  },
  {
    name: 'QR Generator',
    href: '/admin/qr-generator',
    icon: QrCodeIcon,
    description: 'Gestion des QR Codes'
  },
  {
    name: 'Diplômes',
    href: '/admin/diplomes',
    icon: DocumentIcon,
    description: 'Gestion des diplômes'
  },
  {
    name: 'Actions Correctives',
    href: '/admin/actions-correctives',
    icon: ClipboardDocumentIcon,
    description: 'Gestion des actions correctives'
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
  },
  {
    name: 'Historique',
    href: '/admin/historique-management',
    icon: CalendarIcon,
    description: 'Historique des modifications'
  }
];

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onMobileToggle?: () => void;
  isSticky?: boolean;
}

export default function AdminHeader({ onToggleSidebar, onMobileToggle, isSticky = true }: AdminHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getRecentNotifications,
    formatRelativeTime,
    getNotificationIcon
  } = useNotificationContext();

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

  const handleNotificationClick = (notification: { id: string; link?: string }) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRemoveNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeNotification(id);
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
    <header className={`bg-white border-b border-orange-300 shadow-sm ${isSticky ? 'fixed top-0 left-0 right-0 w-full z-[60]' : 'relative'}`}>
      {/* Barre principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            {/* Bouton toggle sidebar - Desktop uniquement */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:block p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                title="Basculer la sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={onMobileToggle}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex-shrink-0">
              <Link href="/admin">
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                   CI.DES Admin
                </h1>
                <h1 className="text-lg font-bold text-gray-900 sm:hidden">
                  CI.DES
                </h1>
              </Link>
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche - Cachée sur mobile */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Notifications - Cachées sur très petit écran */}
            <div className="relative hidden sm:block" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full relative"
                title="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                {stats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unread > 9 ? '9+' : stats.unread}
                  </span>
                )}
              </button>

              {/* Dropdown notifications */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      {stats.unread > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {getRecentNotifications().length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <BellIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">Aucune notification</p>
                        </div>
                      ) : (
                        getRecentNotifications().slice(0, 8).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                              notification.read ? 'border-transparent' : 'border-indigo-500 bg-indigo-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.timestamp)}</p>
                              </div>
                              <button
                                onClick={(e) => handleRemoveNotification(e, notification.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600 text-xs"
                                title="Supprimer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {getRecentNotifications().length > 8 && (
                      <div className="border-t border-gray-100">
                        <Link
                          href="/admin/notifications"
                          className="block px-4 py-3 text-sm text-center text-indigo-600 hover:bg-gray-50"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          Voir toutes les notifications ({stats.total})
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profil utilisateur */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getInitials(session?.user?.name || 'Admin')}
                  </span>
                </div>
                
                {/* Nom et rôle - Cachés sur mobile */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Administrateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.role || 'ADMIN'}
                  </p>
                </div>
                
                <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
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

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {/* Barre de recherche mobile */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Navigation mobile */}
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isActiveTab(tab.href);
              
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium
                    ${isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-6 w-6" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}

            {/* Notifications mobile */}
            <div className="sm:hidden border-t border-gray-200 pt-4 mt-4">
              <Link
                href="/admin/notifications"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BellIcon className="h-6 w-6" />
                <span>Notifications</span>
                {stats.unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unread > 9 ? '9+' : stats.unread}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation avec onglets - Desktop uniquement */}
      <div className="hidden lg:block border-t border-gray-200 bg-gray-50">
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