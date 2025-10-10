"use client";

import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialValue?: string;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export default function SignaturePad({ 
  onSave, 
  initialValue = '', 
  disabled = false,
  width = 400,
  height = 200 
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas - version simplifiée pour mobile
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Charger la signature initiale si elle existe
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialValue;
    }
  }, [width, height, initialValue]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    // Empêcher le scroll de la page sur mobile
    if ('touches' in e) {
      e.preventDefault();
    }
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Pour les événements tactiles, utiliser les coordonnées relatives à la taille d'affichage
    const x = 'touches' in e ? 
      e.touches[0].clientX - rect.left : 
      e.clientX - rect.left;
    const y = 'touches' in e ? 
      e.touches[0].clientY - rect.top : 
      e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    // Empêcher le scroll de la page sur mobile
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Pour les événements tactiles, utiliser les coordonnées relatives à la taille d'affichage
    const x = 'touches' in e ? 
      e.touches[0].clientX - rect.left : 
      e.clientX - rect.left;
    const y = 'touches' in e ? 
      e.touches[0].clientY - rect.top : 
      e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e && 'touches' in e) {
      e.preventDefault();
    }
    setIsDrawing(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (disabled || !hasSignature) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`cursor-crosshair ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          style={{ 
            width, 
            height,
            touchAction: 'none' // Empêche les gestes tactiles par défaut
          }}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
          className={`px-4 py-2 rounded ${
            disabled || !hasSignature
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={disabled || !hasSignature}
          className={`px-4 py-2 rounded ${
            disabled || !hasSignature
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Sauvegarder
        </button>
      </div>
      
      {!hasSignature && !disabled && (
        <p className="text-sm text-gray-500">
          Signez ci-dessus avec votre souris ou votre doigt
        </p>
      )}
    </div>
  );
} 