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
  Bars3Icon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

export interface BlockType {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'layout' | 'input' | 'display' | 'media';
  defaultProps: any;
}

const blockTypes: BlockType[] = [
  // Layout
  {
    type: 'headline',
    name: 'Titre',
    description: 'Titre principal ou sous-titre',
    icon: DocumentTextIcon,
    category: 'layout',
    defaultProps: {
      text: 'Nouveau titre',
      subtitle: '',
      level: 2
    }
  },
  {
    type: 'grid',
    name: 'Grille',
    description: 'Conteneur en grille pour organiser les éléments',
    icon: Squares2X2Icon,
    category: 'layout',
    defaultProps: {
      columns: 2,
      gap: 4
    }
  },
  {
    type: 'divider',
    name: 'Séparateur',
    description: 'Ligne de séparation',
    icon: MinusIcon,
    category: 'layout',
    defaultProps: {}
  },

  // Input
  {
    type: 'input',
    name: 'Champ texte',
    description: 'Champ de saisie simple',
    icon: PencilIcon,
    category: 'input',
    defaultProps: {
      label: 'Nouveau champ',
      placeholder: 'Saisissez...',
      inputType: 'text',
      required: false
    }
  },
  {
    type: 'textarea',
    name: 'Zone de texte',
    description: 'Zone de texte multilignes',
    icon: DocumentTextIcon,
    category: 'input',
    defaultProps: {
      label: 'Zone de texte',
      placeholder: 'Saisissez votre texte...',
      rows: 3,
      required: false
    }
  },
  {
    type: 'select',
    name: 'Liste déroulante',
    description: 'Menu déroulant avec options',
    icon: Bars3Icon,
    category: 'input',
    defaultProps: {
      label: 'Sélection',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false
    }
  },
  {
    type: 'checkbox',
    name: 'Case à cocher',
    description: 'Case à cocher simple',
    icon: CheckCircleIcon,
    category: 'input',
    defaultProps: {
      label: 'Case à cocher',
      required: false
    }
  },
  {
    type: 'radio',
    name: 'Boutons radio',
    description: 'Groupe de boutons radio',
    icon: CheckCircleIcon,
    category: 'input',
    defaultProps: {
      label: 'Choix unique',
      name: 'radio-group',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false
    }
  },
  {
    type: 'status',
    name: 'Statut',
    description: 'Boutons de statut (V/NA/X)',
    icon: CheckCircleIcon,
    category: 'input',
    defaultProps: {
      label: 'Statut',
      value: 'V'
    }
  },

  // Display
  {
    type: 'table',
    name: 'Tableau',
    description: 'Tableau avec en-têtes et lignes',
    icon: TableCellsIcon,
    category: 'display',
    defaultProps: {
      headers: ['Colonne 1', 'Colonne 2', 'Colonne 3'],
      rows: [
        ['Ligne 1, Col 1', 'Ligne 1, Col 2', 'Ligne 1, Col 3'],
        ['Ligne 2, Col 1', 'Ligne 2, Col 2', 'Ligne 2, Col 3']
      ]
    }
  },

  // Media
  {
    type: 'photo',
    name: 'Photo',
    description: 'Zone d\'upload d\'image',
    icon: PhotoIcon,
    category: 'media',
    defaultProps: {
      label: 'Photo',
      helpText: 'Cliquez pour ajouter une photo'
    }
  },
  {
    type: 'signature',
    name: 'Signature',
    description: 'Zone de signature',
    icon: PencilIcon,
    category: 'media',
    defaultProps: {
      label: 'Signature'
    }
  }
];

interface BlockPaletteProps {
  onAddBlock: (blockType: BlockType) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function BlockPalette({ 
  onAddBlock, 
  isCollapsed = false, 
  onToggleCollapse 
}: BlockPaletteProps) {
  
  const categories = {
    layout: 'Mise en page',
    input: 'Champs de saisie',
    display: 'Affichage',
    media: 'Médias'
  };

  const groupedBlocks = blockTypes.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, BlockType[]>);

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-gray-600"
          title="Afficher la palette"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Blocs disponibles
          </h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Masquer la palette"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Glissez-déposez les blocs pour créer votre formulaire
        </p>
      </div>

      {/* Blocks by category */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedBlocks).map(([category, blocks]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {categories[category as keyof typeof categories]}
            </h3>
            <div className="space-y-2">
              {blocks.map((blockType) => (
                <div
                  key={blockType.type}
                  className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
                  onClick={() => onAddBlock(blockType)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <blockType.icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {blockType.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {blockType.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="text-xs text-gray-500">
          <p>💡 Conseil: Glissez-déposez les blocs ou cliquez pour les ajouter</p>
        </div>
      </div>
    </div>
  );
}

export default BlockPalette;
