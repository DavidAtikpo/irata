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
}

export default function UserSidebar({ user, collapsed = false }: UserSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { name: 'Demander une formation', href: '/demande', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { name: 'Mes demandes', href: '/mes-demandes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Mes devis', href: '/mes-devis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Mes documents', href: '/documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'Mon profil', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              isActive(item.href)
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200 rounded-r-md`}
            title={collapsed ? item.name : undefined}
          >
            <svg
              className={`${
                isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
              } mr-3 flex-shrink-0 h-5 w-5 ${collapsed ? 'mr-0' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {!collapsed && item.name}
          </Link>
        ))}
      </div>

      {/* Logout button */}
      <div className="px-2 py-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full group flex items-center px-3 py-2 text-sm font-medium border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-r-md"
          title={collapsed ? 'Se déconnecter' : undefined}
        >
          <svg
            className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && 'Se déconnecter'}
        </button>
      </div>
    </div>
  );
}