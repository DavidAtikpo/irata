'use client';

import React, { useRef, useEffect } from 'react';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  autoFocus?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function CommentInput({
  value,
  onChange,
  placeholder = "Ajouter votre commentaire...",
  className = "text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500",
  rows = 2,
  autoFocus = true,
  onSave,
  onCancel
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Forcer la direction LTR au niveau global quand le composant monte
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';
    document.documentElement.style.direction = 'ltr';
    document.body.style.direction = 'ltr';

    // Focus automatique si demandé
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(value.length, value.length);
        }
      }, 100);
    }

    // Nettoyer au démontage
    return () => {
      if (textareaRef.current) {
        textareaRef.current.dir = 'ltr';
        textareaRef.current.style.direction = 'ltr';
      }
    };
  }, [autoFocus, value.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    const newValue = target.value;

    // Forcer la direction LTR à chaque changement
    target.dir = 'ltr';
    target.style.direction = 'ltr';
    target.style.textAlign = 'left';
    target.style.unicodeBidi = 'bidi-override';

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onSave) {
      e.preventDefault();
      onSave();
    }
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="flex flex-col gap-2"
      dir="ltr"
      style={{
        direction: 'ltr',
        textAlign: 'left',
        unicodeBidi: 'bidi-override'
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          // Forcer LTR au focus
          const target = e.target as HTMLTextAreaElement;
          target.dir = 'ltr';
          target.style.direction = 'ltr';
          target.style.textAlign = 'left';
          target.style.unicodeBidi = 'bidi-override';
        }}
        onInput={(e) => {
          // Forcer LTR à chaque saisie
          const target = e.target as HTMLTextAreaElement;
          target.dir = 'ltr';
          target.style.direction = 'ltr';
          target.style.textAlign = 'left';
          target.style.unicodeBidi = 'bidi-override';
        }}
        className={className}
        placeholder={placeholder}
        rows={rows}
        dir="ltr"
        style={{
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'bidi-override',
          writingMode: 'horizontal-tb'
        }}
      />
      {(onSave || onCancel) && (
        <div className="flex gap-2">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Enregistrer
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
