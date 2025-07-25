'use client';

import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
    <div className="min-h-screen bg-gray-100">
      {/* User Header */}
      <UserHeader 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={toggleSidebar} 
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <UserSidebar user={session.user} />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:block lg:fixed lg:inset-y-0 lg:z-30 lg:bg-white lg:shadow-lg lg:transition-all lg:duration-300 lg:ease-in-out ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} lg:top-16 lg:bottom-0`}>
        <div className="flex flex-col h-full">
          <UserSidebar user={session.user} collapsed={sidebarCollapsed} />
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:pt-16 lg:transition-all lg:duration-300 lg:ease-in-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {session.user.prenom?.charAt(0) || ''}{session.user.nom?.charAt(0) || ''}
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {session.user.prenom} {session.user.nom}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 