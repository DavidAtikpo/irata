'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminHeader from '@/app/components/AdminHeader';
import Sidebar from '@/app/components/Sidebar';
import { NotificationProvider } from '../../../contexts/NotificationContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const hideChrome = false; // Désactivé pour afficher l'header et sidebar sur toutes les pages

  useEffect(() => {
    console.log('🔍 Admin Layout - Status:', status);
    console.log('🔍 Admin Layout - Session:', session);
    
    if (status === 'unauthenticated') {
      console.log('❌ Utilisateur non authentifié, redirection vers /login');
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      console.log('❌ Utilisateur authentifié mais pas admin, redirection vers /');
      console.log('🔍 Rôle de l\'utilisateur:', session?.user?.role);
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      console.log('✅ Utilisateur admin authentifié');
    }
  }, [status, session, router]);

  // Charger l'état de la sidebar depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Raccourci clavier pour toggler la sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {!hideChrome && (
          <div className="print:hidden">
            <AdminHeader 
              onToggleSidebar={toggleSidebar}
              onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              isSticky={true}
            />
          </div>
        )}
        
        {/* Sidebar */}
        {!hideChrome && (
          <div className="print:hidden">
            <Sidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggle={toggleSidebar}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={closeMobileSidebar}
            />
          </div>
        )}
        
        {/* Main content */}
        <main className={`
          overflow-y-auto ${hideChrome ? 'bg-white' : 'bg-gray-100'} p-4 sm:p-6 lg:p-8 transition-all duration-300 min-h-screen
          ${hideChrome ? '' : 'pt-28 lg:pt-32'}
          ${hideChrome ? '' : (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}
          print:bg-white print:p-0 print:m-0 print:pt-0 print:ml-0
        `}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}