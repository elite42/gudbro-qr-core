import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import QREditor from '../components/QREditor';
import TemplateLibrary from '../components/TemplateLibrary';
import { FiEdit, FiGrid } from 'react-icons/fi';
import { createTemplate } from '../utils/api';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const [activeView, setActiveView] = useState('editor'); // 'editor' or 'library'
  const [currentDesign, setCurrentDesign] = useState(null);

  const handleSaveTemplate = async ({ name, design }) => {
    try {
      await createTemplate(name, design, false);
      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
    }
  };

  const handleSelectTemplate = (design) => {
    setCurrentDesign(design);
    setActiveView('editor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">QR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QR Platform</h1>
                <p className="text-xs text-gray-500">Customization Studio</p>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('editor')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'editor'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiEdit className="inline mr-2" />
                Editor
              </button>

              <button
                onClick={() => setActiveView('library')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'library'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiGrid className="inline mr-2" />
                Templates
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'editor' ? (
          <QREditor
            initialDesign={currentDesign}
            onSave={handleSaveTemplate}
          />
        ) : (
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            QR Platform - Module 3: Customization System v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
