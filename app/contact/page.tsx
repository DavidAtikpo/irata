'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: 'success' | 'error'; message: string }>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Exemple : appel API fictif (à remplacer)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Votre message a été envoyé avec succès !' });
        setFormData({ nom: '', email: '', sujet: '', message: '' });
      } else {
        throw new Error('Erreur lors de l’envoi du message.');
      }
    } catch (error) {
      setFeedback({ type: 'error', message: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contactez-nous</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Infos de contact */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-700">Adresse</h3>
                  <p>123 Rue de la Formation<br />75000 Paris, France</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Téléphone</h3>
                  <p>+33 1 23 45 67 89</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <p>contact@irata-formation.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Horaires</h3>
                  <p>Lundi - Vendredi : 9h00 - 18h00<br />Samedi - Dimanche : Fermé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-6 space-y-6"
              aria-label="Formulaire de contact"
            >
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="sujet" className="block text-sm font-medium text-gray-700">Sujet</label>
                <select
                  id="sujet"
                  name="sujet"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.sujet}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="information">Demande d'information</option>
                  <option value="devis">Demande de devis</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {feedback && (
                <div
                  className={`text-sm ${
                    feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
