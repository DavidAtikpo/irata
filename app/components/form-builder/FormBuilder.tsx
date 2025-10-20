'use client';

import React, { useState, useCallback } from 'react';
import FormBlock, { FormBlock as FormBlockType } from './FormBlock';
import BlockPalette, { BlockType } from './BlockPalette';
import { 
  PlusIcon,
  EyeIcon,
  BookmarkIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface FormBuilderProps {
  initialFormData?: any;
  onSave?: (formData: any) => void;
  onPreview?: (formData: any) => void;
  isReadOnly?: boolean;
}

function FormBuilder({ 
  initialFormData, 
  onSave, 
  onPreview,
  isReadOnly = false 
}: FormBuilderProps) {
  const [formData, setFormData] = useState({
    title: initialFormData?.title || 'Nouveau formulaire',
    description: initialFormData?.description || '',
    blocks: initialFormData?.blocks || []
  });
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBlock = useCallback((blockType: BlockType, targetIndex?: number) => {
    const newBlock: FormBlockType = {
      id: generateId(),
      type: blockType.type as FormBlockType['type'],
      props: { ...blockType.defaultProps }
    };

    setFormData(prev => {
      const newBlocks = [...prev.blocks];
      const insertIndex = targetIndex !== undefined ? targetIndex : newBlocks.length;
      newBlocks.splice(insertIndex, 0, newBlock);
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<FormBlockType>) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map((block: FormBlockType) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((block: FormBlockType) => block.id !== blockId)
    }));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const blocks = [...prev.blocks];
      const currentIndex = blocks.findIndex(block => block.id === blockId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= blocks.length) return prev;
      
      [blocks[currentIndex], blocks[newIndex]] = [blocks[newIndex], blocks[currentIndex]];
      
      return { ...prev, blocks };
    });
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const duplicateForm = () => {
    const duplicatedData = {
      ...formData,
      title: `${formData.title} (Copie)`,
      blocks: formData.blocks.map((block: FormBlockType) => ({
        ...block,
        id: generateId()
      }))
    };
    setFormData(duplicatedData);
  };

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Block Palette */}
        <BlockPalette
          onAddBlock={addBlock}
          isCollapsed={isPaletteCollapsed}
          onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
                  placeholder="Titre du formulaire"
                  disabled={isReadOnly}
                />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="text-sm text-gray-500 bg-transparent border-none outline-none w-full mt-1"
                  placeholder="Description du formulaire"
                  disabled={isReadOnly}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {isPreviewMode ? 'Éditer' : 'Aperçu'}
                </button>
                
                {!isReadOnly && (
                  <>
                    <button
                      onClick={duplicateForm}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Dupliquer
                    </button>
                    
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Canvas */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {formData.blocks.length === 0 ? (
                <DropZone onAddBlock={addBlock} />
              ) : (
                <div className="space-y-4">
                  {formData.blocks.map((block: FormBlockType, index: number) => (
                    <DropZone
                      key={`dropzone-${block.id}`}
                      onAddBlock={(blockType) => addBlock(blockType, index)}
                      isBetweenBlocks
                    >
                      <FormBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={setSelectedBlockId}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                        onMove={moveBlock}
                        isBuilder={!isPreviewMode && !isReadOnly}
                      />
                    </DropZone>
                  ))}
                  <DropZone
                    onAddBlock={addBlock}
                    isBetweenBlocks
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// Drop Zone Component
interface DropZoneProps {
  onAddBlock: (blockType: BlockType) => void;
  isBetweenBlocks?: boolean;
  children?: React.ReactNode;
}

function DropZone({ onAddBlock, isBetweenBlocks = false, children }: DropZoneProps) {
  return (
    <div className="relative min-h-4 transition-all duration-200">
      {children}
      
      {isBetweenBlocks && !children && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <div className="text-center">
            <PlusIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Cliquez sur un bloc dans la palette pour l'ajouter</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormBuilder;
