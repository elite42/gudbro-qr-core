import React, { useState, useEffect } from 'react';
import { FiGrid, FiHeart, FiTrash2, FiEdit } from 'react-icons/fi';
import { getTemplates, deleteTemplate, getFeaturedTemplates } from '../../utils/api';
import toast from 'react-hot-toast';

export default function TemplateLibrary({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'featured'

  useEffect(() => {
    loadTemplates();
    loadFeaturedTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedTemplates = async () => {
    try {
      const data = await getFeaturedTemplates();
      setFeaturedTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load featured templates:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleSelect = (template) => {
    onSelectTemplate(template.design);
    toast.success(`Applied "${template.name}" template`);
  };

  const TemplateCard = ({ template, showDelete = false }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer group">
      {/* Preview */}
      <div
        onClick={() => handleSelect(template)}
        className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
      >
        {/* Simulated QR preview using design colors */}
        <div
          className="w-full h-full p-4"
          style={{ backgroundColor: template.design.background }}
        >
          <div
            className={`w-full h-full ${
              template.design.pattern === 'dots' ? 'opacity-80' :
              template.design.pattern === 'rounded' ? 'opacity-90' : ''
            }`}
            style={{ backgroundColor: template.design.foreground }}
          >
            {/* Simplified QR pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
              {/* Corner eyes */}
              <rect x="10" y="10" width="25" height="25" fill="currentColor" />
              <rect x="65" y="10" width="25" height="25" fill="currentColor" />
              <rect x="10" y="65" width="25" height="25" fill="currentColor" />
              {/* Some dots */}
              {[...Array(20)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 60 + 40}
                  cy={Math.random() * 60 + 40}
                  r="2"
                  fill="currentColor"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-primary-600 px-4 py-2 rounded-lg">
            Use Template
          </span>
        </div>
      </div>

      {/* Template info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{template.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: template.design.foreground }}
              title={`Foreground: ${template.design.foreground}`}
            />
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: template.design.background }}
              title={`Background: ${template.design.background}`}
            />
            <span className="text-xs text-gray-500 capitalize">
              {template.design.pattern}
            </span>
          </div>
        </div>

        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(template.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Delete template"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Template Library</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'my'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiGrid className="inline mr-2" />
          My Templates ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'featured'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiHeart className="inline mr-2" />
          Featured ({featuredTemplates.length})
        </button>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 mt-4">Loading templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'my' ? (
            templates.length > 0 ? (
              templates.map((template) => (
                <TemplateCard key={template.id} template={template} showDelete={true} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiGrid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No templates yet</p>
                <p className="text-sm text-gray-500">
                  Create and save your first template from the editor
                </p>
              </div>
            )
          ) : (
            featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} showDelete={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
