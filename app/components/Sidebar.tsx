'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  DocumentDuplicateIcon,
  AcademicCapIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
  { name: 'Demandes', href: '/admin/demandes', icon: ClipboardDocumentListIcon },
  { name: 'Devis', href: '/admin/devis', icon: DocumentTextIcon },
  { name: 'Contrats', href: '/admin/contrats', icon: DocumentDuplicateIcon },
  // { name: 'Documents', href: '/admin/documents', icon: FolderIcon },
  { name: 'Inspections', href: '/admin/inspections', icon: ClipboardDocumentCheckIcon },
  // { name: 'Formulaires quotidiens', href: '/admin/formulaires-quotidiens', icon: ClipboardDocumentIcon },
  // { name: '⚠️ État Cloudinary', href: '/admin/cloudinary-info', icon: ExclamationTriangleIcon },
  { name: 'Formations', href: '/admin/formations', icon: AcademicCapIcon },
  { name: 'Stagiaires', href: '/admin/utilisateurs', icon: UserGroupIcon },
  { name: 'Paramètres', href: '/admin/parametres', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <div className={`fixed top-16 left-0 h-full flex flex-col bg-gray-900 transition-all duration-300 z-30 
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
      `}>
        {/* Header avec bouton de toggle */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">IRATA Admin</h1>
          )}
          
          {/* Bouton fermer pour mobile */}
          <button
            onClick={onMobileClose}
            className="lg:hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            title="Fermer le menu"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          {/* Bouton toggle pour desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:block rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            title={isCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          // Fermer la sidebar mobile lors du clic sur un lien
                          if (isMobileOpen && onMobileClose) {
                            onMobileClose();
                          }
                        }}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 relative
                          ${isActive 
                            ? 'bg-gray-800 text-white' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }
                          ${isCollapsed ? 'lg:justify-center' : ''}
                        `}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                        
                        {/* Tooltip pour la version collapsed - uniquement sur desktop */}
                        {isCollapsed && (
                          <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap pointer-events-none border border-gray-700">
                            {item.name}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
        
        {/* Footer mobile avec informations utilisateur */}
        <div className="lg:hidden border-t border-gray-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}