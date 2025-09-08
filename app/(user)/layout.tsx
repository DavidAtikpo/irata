'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserSidebar from '../components/UserSidebar';
import UserHeader from '../components/UserHeader';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Marquer le composant comme monté pour éviter les erreurs d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Charger l'état de la sidebar depuis localStorage
  useEffect(() => {
    if (isMounted) {
      const savedState = localStorage.getItem('user-sidebar-collapsed');
      if (savedState !== null) {
        setIsSidebarCollapsed(JSON.parse(savedState));
      }
    }
  }, [isMounted]);

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
    localStorage.setItem('user-sidebar-collapsed', JSON.stringify(newState));
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Éviter les erreurs d'hydratation en attendant que le composant soit monté
  if (!isMounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (session?.user?.role !== 'USER') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        sidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onMobileToggle={toggleMobileSidebar}
      />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <UserSidebar 
          user={session.user}
          collapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        
        {/* Main content */}
        <main className={`
          flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 min-h-[calc(100vh-4rem)]
          ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
} 