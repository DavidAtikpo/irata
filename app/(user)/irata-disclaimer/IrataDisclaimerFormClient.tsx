"use client";

import React, { useState, useEffect } from 'react';
import SignaturePad from '@/components/SignaturePad';

interface Props {
  user: {
    email?: string | null;
    name?: string | null;
    [key: string]: unknown;
  };
  currentDate: string;
}

export default function IrataDisclaimerFormClient({ user, currentDate }: Props) {
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [session, setSession] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const r = await fetch('/api/user/training-session');
        if (r.ok) {
          const data = await r.json();
          if (data?.name) setSession(data.name);
        }
      } catch {}
    };
    
    const fetchProfile = async () => {
      try {
        const r = await fetch('/api/user/profile');
        if (r.ok) {
          const data = await r.json();
          const fullName = [data?.prenom, data?.nom].filter(Boolean).join(' ').trim();
          if (fullName) setUserName(fullName);
        }
      } catch {}
    };
    
    fetchSession();
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      setMessage('Veuillez fournir une signature.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const payload = {
      name: userName,
      address,
      signature,
      date: currentDate,
      session,
      user,
    };

    try {
      const res = await fetch('/api/documents/irata-disclaimer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Erreur');

      setMessage('Document envoyé avec succès.');
      setAddress('');
      setSignature('');
      // Ne pas réinitialiser la session et le nom car ils viennent de l'API
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : 'Erreur lors de l envoi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="block font-medium text-gray-700">Nom :</label>
          <input 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full border rounded p-2" 
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">N° IRATA :</label>
          <input value="ENR-CIFRA-FORM 004" readOnly className="mt-1 block w-full border rounded p-2 bg-gray-100" />
        </div>
      </div>

      <div className="mb-4 text-sm">
        <label className="block font-medium text-gray-700">Session :</label>
        <input 
          value={session} 
          onChange={(e) => setSession(e.target.value)} 
          required 
          className="mt-1 block w-full border rounded p-2"
          placeholder="Session inscrite"
        />
      </div>

      <div className="mb-4 text-sm">
        <label className="block font-medium text-gray-700">Adresse :</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 block w-full border rounded p-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <label className="block font-medium text-gray-700">Signature :</label>
          <SignaturePad onSave={(data) => setSignature(data)} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Date :</label>
          <input value={currentDate} readOnly className="mt-1 block w-full border rounded p-2 bg-gray-100" />
        </div>
      </div>

      <div className="flex justify-center">
        <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
          {submitting ? 'Envoi...' : 'Soumettre la Déclaration de Non-responsabilité'}
        </button>
      </div>

      {message && <p className="text-center text-sm mt-3">{message}</p>}
    </form>
  );
}


