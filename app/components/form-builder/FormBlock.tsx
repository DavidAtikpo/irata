'use client';

import React from 'react';
import { 
  DocumentTextIcon,
  Squares2X2Icon,
  TableCellsIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

export interface FormBlock {
  id: string;
  type: 'headline' | 'grid' | 'table' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'photo' | 'signature' | 'status' | 'divider';
  props: any;
  children?: FormBlock[];
}

interface FormBlockProps {
  block: FormBlock;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: (blockId: string) => void;
  onUpdate?: (blockId: string, updates: Partial<FormBlock>) => void;
  onDelete?: (blockId: string) => void;
  onMove?: (blockId: string, direction: 'up' | 'down') => void;
  isBuilder?: boolean;
}

function FormBlock({ 
  block, 
  isSelected = false, 
  isDragging = false,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  isBuilder = false 
}: FormBlockProps) {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBuilder && onSelect) {
      onSelect(block.id);
    }
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'headline':
        return (
          <div className="mb-6">
            <h2 className={`text-2xl font-bold text-gray-900 ${isBuilder ? 'cursor-pointer' : ''}`}>
              {block.props.text || 'Titre'}
            </h2>
            {block.props.subtitle && (
              <p className="mt-2 text-sm text-gray-500">
                {block.props.subtitle}
              </p>
            )}
          </div>
        );

      case 'grid':
        return (
          <div className={`grid gap-4 mb-6 ${block.props.columns ? `grid-cols-${block.props.columns}` : 'grid-cols-2'}`}>
            {block.children?.map((child, index) => (
              <div key={child.id} className="space-y-2">
                <FormBlock
                  block={child}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onMove={onMove}
                  isBuilder={isBuilder}
                />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {block.props.headers?.map((header: string, index: number) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {block.props.rows?.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'input':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Champ'}
            </label>
            <input
              type={block.props.inputType || 'text'}
              placeholder={block.props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!isBuilder}
            />
            {block.props.helpText && (
              <p className="mt-1 text-sm text-gray-500">
                {block.props.helpText}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Zone de texte'}
            </label>
            <textarea
              rows={block.props.rows || 3}
              placeholder={block.props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!isBuilder}
            />
            {block.props.helpText && (
              <p className="mt-1 text-sm text-gray-500">
                {block.props.helpText}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Sélection'}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!isBuilder}
            >
              <option value="">Sélectionner...</option>
              {block.props.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {block.props.helpText && (
              <p className="mt-1 text-sm text-gray-500">
                {block.props.helpText}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={!isBuilder}
              />
              <span className="ml-2 text-sm text-gray-700">
                {block.props.label || 'Case à cocher'}
              </span>
            </label>
            {block.props.helpText && (
              <p className="mt-1 text-sm text-gray-500">
                {block.props.helpText}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="mb-4">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                {block.props.label || 'Boutons radio'}
              </legend>
              <div className="space-y-2">
                {block.props.options?.map((option: string, index: number) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={block.props.name}
                      value={option}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      disabled={!isBuilder}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {block.props.helpText && (
              <p className="mt-1 text-sm text-gray-500">
                {block.props.helpText}
              </p>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Photo'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-sm text-gray-500">
                {block.props.helpText || 'Cliquez pour ajouter une photo'}
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Signature'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-sm">
                Zone de signature
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {block.props.label || 'Statut'}
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  block.props.value === 'V'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                disabled={!isBuilder}
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                V
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  block.props.value === 'NA'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                disabled={!isBuilder}
              >
                NA
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  block.props.value === 'X'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                disabled={!isBuilder}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                X
              </button>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="my-6">
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 border border-gray-300 rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">
              Bloc non reconnu: {block.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        relative group
        ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isBuilder ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
    >
      {renderBlock()}
      
      {/* Contrôles du builder */}
      {isBuilder && isSelected && (
        <div className="absolute -top-2 -right-2 flex space-x-1 bg-white border border-gray-300 rounded-md shadow-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onMove) onMove(block.id, 'up');
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Déplacer vers le haut"
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onUpdate) onUpdate(block.id, {});
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Modifier"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(block.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default FormBlock;
