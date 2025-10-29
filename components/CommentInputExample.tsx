'use client';

import { useState } from 'react';
import CommentInput from './CommentInput';

export default function CommentInputExample() {
  const [comment, setComment] = useState('');
  const [savedComments, setSavedComments] = useState<string[]>([]);

  const handleSave = () => {
    if (comment.trim()) {
      setSavedComments(prev => [...prev, comment.trim()]);
      setComment('');
    }
  };

  const handleCancel = () => {
    setComment('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Test du composant CommentInput</h2>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Tapez "merci" pour tester :</h3>
        <CommentInput
          value={comment}
          onChange={setComment}
          onSave={handleSave}
          onCancel={handleCancel}
          placeholder="Tapez votre commentaire ici..."
        />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Commentaires sauvegardés :</h3>
        <div className="space-y-2">
          {savedComments.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun commentaire sauvegardé</p>
          ) : (
            savedComments.map((savedComment, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                {index + 1}. {savedComment}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>Instructions :</p>
        <ul className="list-disc list-inside mt-1">
          <li>Tapez du texte dans le champ ci-dessus</li>
          <li>Appuyez sur Entrée pour sauvegarder</li>
          <li>Appuyez sur Échap pour annuler</li>
          <li>Vérifiez que "merci" s'affiche correctement (pas "icrem")</li>
        </ul>
      </div>
    </div>
  );
}
