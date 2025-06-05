'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  DocumentDuplicateIcon,
  AcademicCapIcon,
  UserGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
  { name: 'Demandes', href: '/admin/demandes', icon: ClipboardDocumentListIcon },
  { name: 'Devis', href: '/admin/devis', icon: DocumentTextIcon },
  { name: 'Contrats', href: '/admin/contrats', icon: DocumentDuplicateIcon },
  { name: 'Formations', href: '/admin/formations', icon: AcademicCapIcon },
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: UserGroupIcon },
  { name: 'Paramètres', href: '/admin/parametres', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-white">IRATA Admin</h1>
      </div>
      <nav className="flex flex-1 flex-col">
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
                        group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                        ${isActive 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
} 