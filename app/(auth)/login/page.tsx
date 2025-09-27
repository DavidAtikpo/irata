'use client';

import { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Récupérer l'URL de callback si elle existe
  const callbackUrl = searchParams.get('callbackUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        console.log('✅ Connexion réussie, redirection en cours...');
        console.log('🔍 URL de callback brute:', callbackUrl);
        console.log('🔍 Type de callbackUrl:', typeof callbackUrl);
        console.log('🔍 CallbackUrl est null/undefined:', callbackUrl === null || callbackUrl === undefined);
        
        // Utiliser une approche plus simple : rediriger directement et laisser le middleware gérer
        if (callbackUrl && callbackUrl !== 'null' && callbackUrl !== 'undefined') {
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          console.log('URL de callback décodée:', decodedCallbackUrl);
          
          let pathname = '';
          
          // Gérer les URLs complètes et les chemins relatifs
          if (decodedCallbackUrl.startsWith('http')) {
            try {
              const url = new URL(decodedCallbackUrl);
              pathname = url.pathname;
              console.log('Chemin extrait de l\'URL complète:', pathname);
            } catch (error) {
              console.warn('URL de callback invalide:', decodedCallbackUrl);
              pathname = decodedCallbackUrl;
            }
          } else {
            // C'est déjà un chemin relatif
            pathname = decodedCallbackUrl;
            console.log('Chemin relatif détecté:', pathname);
          }
          
          console.log('🚀 Redirection vers l\'URL de callback:', pathname);
          router.push(pathname);
        } else {
          // Pas d'URL de callback, récupérer la session et rediriger selon le rôle
          console.log('🚀 Pas d\'URL de callback valide, récupération de la session...');
          
          // Attendre un peu pour que la session soit mise à jour
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          try {
            const response = await fetch('/api/auth/session');
            const session = await response.json();
            
            console.log('Session récupérée pour redirection:', session);
            
            if (session?.user?.role) {
              let redirectUrl = '/';
              
              if (session.user.role === 'ADMIN') {
                redirectUrl = '/admin/dashboard';
              } else if (session.user.role === 'USER') {
                redirectUrl = '/dashboard';
              } else if (session.user.role === 'GESTIONNAIRE') {
                redirectUrl = '/gestionnaire/dashboard';
              }
              
              console.log('🚀 Redirection selon le rôle vers:', redirectUrl);
              window.location.href = redirectUrl;
            } else {
              console.log('🚀 Rôle non trouvé, redirection vers la page d\'accueil');
              window.location.href = '/';
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de la session:', error);
            window.location.href = '/';
          }
        }
      } else {
        setError('Erreur de connexion inattendue');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="https://cides.tf/formations-accueil/formation-france/formation-cordistes/" className="font-medium text-blue-600 hover:text-blue-500">
              créer un nouveau compte
            </Link>
          </p>
        </div>

        {searchParams.get('registered') && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Compte créé avec succès ! Vous pouvez maintenant vous connecter.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Adresse email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
} 