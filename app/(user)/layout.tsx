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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Charger l'état de la sidebar depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('user-sidebar-collapsed');
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
    localStorage.setItem('user-sidebar-collapsed', JSON.stringify(newState));
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Chargement...</h2>
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
      <UserHeader onToggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <UserSidebar 
        user={session.user}
        collapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      
      {/* Main content */}
      <main className={`
        flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 min-h-screen
        pt-16 lg:pt-32
        lg:ml-64 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {children}
      </main>
    </div>
  );
} 