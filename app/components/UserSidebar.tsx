'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface UserSidebarProps {
  user: {
    nom?: string;
    prenom?: string;
    email?: string;
  };
  collapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function UserSidebar({ user, collapsed = false, isMobileOpen = false, onMobileClose }: UserSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    // { name: 'Demander une formation', href: '/demande', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { name: 'Mes demandes', href: '/mes-demandes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Mon devis', href: '/mes-devis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Mon contrat', href: '/mon-contrat', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Mes documents', href: '/documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'Formulaires quotidiens', href: '/formulaires-quotidiens', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Convocation', href: '/convocation-cides', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Trainee Follow Up', href: '/trainee-follow-up', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'IRATA Disclaimer', href: '/irata-disclaimer', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Trainee Induction', href: '/trainee-induction', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Déclaration Médicale', href: '/medical-declaration', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Mon profil', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'trame facture', href: '/facture-trame', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Irata-signed', href: '/documents/irata-signed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Attendance', href: '/attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Pre-Job Training', href: '/pre-job-training', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Questionnaire de satisfaction', href: '/customer-satisfaction', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  const isActive = (href: string) => {
    // Pour le dashboard, on vérifie si on est exactement sur /dashboard
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // Pour les autres pages, on vérifie si le pathname commence par l'href
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar - Full screen overlay approach */}
      {isMobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
            onClick={onMobileClose}
          />
          
          {/* Sidebar panel */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs z-50">
            <div className="flex flex-col w-full bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 bg-indigo-600">
                <h2 className="text-white text-lg font-semibold">CI.DES User</h2>
                <button
                  onClick={onMobileClose}
                  className="text-indigo-200 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActiveItem = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onMobileClose}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActiveItem
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <svg
                          className={`mr-3 h-6 w-6 ${
                            isActiveItem ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onMobileClose?.();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                >
                  <svg
                    className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:bg-white lg:shadow-lg lg:border-r lg:border-gray-200
        ${collapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
      `}>
        <div className="h-full flex flex-col">
          {/* Spacer pour éviter que le contenu soit caché sous le header */}
          <div className="h-16"></div>
          
          {/* Navigation desktop */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200 rounded-r-md`}
                title={collapsed ? item.name : undefined}
              >
                <svg
                  className={`${
                    isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  } flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            ))}
          </div>

          {/* Logout button desktop */}
          <div className="px-2 py-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-r-md"
              title={collapsed ? 'Se déconnecter' : undefined}
            >
              <svg
                className={`text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span className="truncate">Se déconnecter</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 