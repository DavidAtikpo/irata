'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  nom: string;
  prenom: string;
  email: string;
};

type PasswordData = {
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    email: '',
  });

  const [passwords, setPasswords] = useState<PasswordData>({ password: '', confirmPassword: '' });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.nom || !formData.prenom || !formData.email) {
        setError('Veuillez remplir tous les champs.');
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, step: 1 }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Erreur lors de la vérification.');
        }
        setStep(2);
      } catch (err: any) {
        setError(err.message);
      }
    } else if (step === 2) {
      if (passwords.password !== passwords.confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (!passwords.password) {
        setError('Le mot de passe est requis.');
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, password: passwords.password, step: 2 }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Erreur lors de la création du compte.');
        }
        router.push('/login?registered=true');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Créer un compte' : 'Sécuriser votre compte'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              se connecter
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {['nom', 'prenom', 'email'].map((field) => (
              <div key={field}>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  required
                  value={(formData as any)[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Continuer
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <p className="font-semibold mb-2">Pour finaliser, définissez un mot de passe.</p>
              <div><strong>Nom:</strong> {formData.nom}</div>
              <div><strong>Prénom:</strong> {formData.prenom}</div>
              <div><strong>Email:</strong> {formData.email}</div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {['password', 'confirmPassword'].map((field, i) => (
                <div key={field}>
                  <input
                    type="password"
                    name={field}
                    placeholder={i === 0 ? 'Mot de passe' : 'Confirmer le mot de passe'}
                    required
                    value={(passwords as any)[field]}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Créer mon compte
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
