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
  ClipboardDocumentIcon,
  UserIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Demandes', href: '/admin/demandes', icon: ClipboardDocumentListIcon },
  { name: 'Devis', href: '/admin/devis', icon: DocumentTextIcon },
  { name: 'Contrats', href: '/admin/contrats', icon: DocumentDuplicateIcon },
  { name: 'Trame facture', href: '/admin/facture-trame', icon: ReceiptPercentIcon },
  { name: 'Envoyer documents', href: '/admin/documents', icon: FolderIcon },
  { name: 'Convocation', href: '/admin/convocation', icon: ClipboardDocumentCheckIcon },
  { name: 'fiche de présence', href: '/admin/presence', icon: ClipboardDocumentCheckIcon },
  { name: 'Gestion présence', href: '/admin/attendance', icon: ClipboardDocumentCheckIcon },
  { name: 'Pré-job training', href: '/admin/pre-job-training', icon: ClipboardDocumentIcon },
  { name: 'Job Planing', href: '/admin/job-planing', icon: ClipboardDocumentCheckIcon },
  { name: 'Satisfaction stagiaire', href: '/admin/customer-satisfaction', icon: ClipboardDocumentIcon },
  { name: 'Induction Stagiaires', href: '/admin/trainee-induction', icon: ClipboardDocumentCheckIcon },
  { name: 'Signatures induction', href: '/admin/trainee-signatures', icon: ClipboardDocumentCheckIcon },
  { name: 'Trainee Follow Up', href: '/admin/trainee-folow-up', icon: UserIcon },
  { name: 'Irata-disclaimer', href: '/admin/irata-disclaimer', icon: ClipboardDocumentCheckIcon },
  { name: 'Questionnaires', href: '/admin/formulaires-quotidiens', icon: ClipboardDocumentIcon },
  { name: 'Inspections', href: '/admin/inspections', icon: ClipboardDocumentCheckIcon },
  { name: 'Déclaration Médicale', href: '/admin/medical-declaration', icon: ClipboardDocumentCheckIcon },
  { name: 'Non-conformités', href: '/admin/non-conformites', icon: ExclamationCircleIcon },
  { name: 'Actions correctives', href: '/admin/actions-correctives', icon: CheckCircleIcon },
  { name: 'Edge and Rope Management', href: '/admin/edge-and-rope-management', icon: ClipboardDocumentCheckIcon },

  { name: 'Formations', href: '/admin/formations', icon: AcademicCapIcon },
  { name: 'Stagiaires', href: '/admin/utilisateurs', icon: UserGroupIcon },
  { name: 'Financement Participatif', href: '/admin/financement-participatif', icon: CurrencyDollarIcon },

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
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Spacer pour éviter que le contenu soit caché sous le header principal */}
          <div className="h-28 lg:h-32"></div>
          
          {/* Header mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">IRATA Admin</h1>
            <button
              onClick={onMobileClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation mobile */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={`
                        group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold
                        ${isActive 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:bg-gray-900
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
      `}>
        <div className="h-full flex flex-col">
          {/* Spacer pour éviter que le contenu soit caché sous le header principal */}
          <div className="h-28 lg:h-32"></div>
          
          {/* Header desktop */}
          <div className="flex h-16 shrink-0 items-center justify-between px-4">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white">IRATA Admin</h1>
            )}
            
            {/* Bouton toggle pour desktop */}
            <button
              onClick={onToggle}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              title={isCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation desktop */}
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
                          
                          {/* Tooltip pour la version collapsed */}
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
        </div>
      </div>
    </>
  );
}