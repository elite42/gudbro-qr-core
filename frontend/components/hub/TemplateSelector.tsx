'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, Template } from '@/lib/templates';

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group templates by category
  const templatesByCategory = TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Filter templates
  const filteredTemplates = selectedCategory
    ? templatesByCategory[selectedCategory] || []
    : TEMPLATES;

  // Get icon component from lucide-react
  const getIcon = (iconName: string) => {
    const IconComponent =
      LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Circle;
    return IconComponent as React.ComponentType<any>;
  };

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Templates
        </button>
        {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => {
          const count = templatesByCategory[key]?.length || 0;
          if (count === 0) return null;

          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = getIcon(template.icon);
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`
                relative group text-left p-4 rounded-xl border-2 transition-all
                hover:shadow-lg
                ${
                  isSelected
                    ? 'border-black shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <LucideIcons.Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Preview card */}
              <div
                className="mb-3 p-4 rounded-lg flex items-center justify-center h-24 transition-transform group-hover:scale-105"
                style={{ backgroundColor: template.theme.backgroundColor }}
              >
                <Icon
                  className="w-12 h-12"
                  style={{ color: template.theme.primaryColor }}
                />
              </div>

              {/* Template info */}
              <div>
                <h3 className="font-semibold text-base mb-1">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Color swatches */}
              <div className="flex gap-1.5 mt-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.theme.primaryColor }}
                  title="Primary Color"
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: template.theme.backgroundColor }}
                  title="Background Color"
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.theme.textColor }}
                  title="Text Color"
                />
              </div>
            </button>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <LucideIcons.Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No templates found in this category.</p>
        </div>
      )}
    </div>
  );
}
