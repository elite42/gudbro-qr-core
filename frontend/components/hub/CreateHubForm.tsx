'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import TemplateSelector from './TemplateSelector';
import { hubApi, CreateHubData, HubTheme } from '@/lib/api/hub';
import { Template, getTemplate } from '@/lib/templates';

type Step = 'info' | 'template' | 'customize' | 'preview';

export default function CreateHubForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customTheme, setCustomTheme] = useState<Partial<HubTheme>>({});
  const [logoUrl, setLogoUrl] = useState('');

  // Steps configuration
  const steps: { id: Step; label: string; icon: keyof typeof LucideIcons }[] = [
    { id: 'info', label: 'Basic Info', icon: 'FileText' },
    { id: 'template', label: 'Choose Template', icon: 'Palette' },
    { id: 'customize', label: 'Customize', icon: 'Paintbrush' },
    { id: 'preview', label: 'Preview', icon: 'Eye' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Get final theme (template + customizations)
  const getFinalTheme = (): HubTheme => {
    if (!selectedTemplate) {
      return {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Inter',
        borderRadius: '8px',
        buttonStyle: 'solid',
      };
    }
    return { ...selectedTemplate.theme, ...customTheme };
  };

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCustomTheme({}); // Reset customizations when changing template
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title || !selectedTemplate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateHubData = {
        title,
        subtitle,
        description,
        template: selectedTemplate.id,
        theme: customTheme,
        logo_url: logoUrl || undefined,
        meta_title: title,
        meta_description: description || subtitle,
      };

      const result = await hubApi.createHub(data);

      // Success! Redirect to edit page to add links
      router.push(`/hub/${result.hub.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to create hub');
      setLoading(false);
    }
  };

  // Step navigation
  const canGoNext = () => {
    if (currentStep === 'info') return title.trim().length > 0;
    if (currentStep === 'template') return selectedTemplate !== null;
    return true;
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = LucideIcons[step.icon] as React.ComponentType<any>;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                      ${isActive ? 'bg-black text-white scale-110' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <LucideIcons.Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[500px]">
        {/* STEP 1: Basic Info */}
        {currentStep === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-gray-600">
                Let's start with the essentials for your Hub page
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hub Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Restaurant"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be the main heading on your Hub page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Best pizza in town"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your business..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for SEO meta description
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to your logo image
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Template Selection */}
        {currentStep === 'template' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
              <p className="text-gray-600">
                Select a professionally designed template that fits your industry
              </p>
            </div>

            <TemplateSelector
              selectedTemplate={selectedTemplate?.id || null}
              onSelect={handleTemplateSelect}
            />
          </div>
        )}

        {/* STEP 3: Customize Theme */}
        {currentStep === 'customize' && selectedTemplate && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Customize Your Theme</h2>
              <p className="text-gray-600">
                Personalize the colors and style of your Hub page
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color pickers */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={customTheme.primaryColor || selectedTemplate.theme.primaryColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, primaryColor: e.target.value })
                    }
                    className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customTheme.primaryColor || selectedTemplate.theme.primaryColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, primaryColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={customTheme.backgroundColor || selectedTemplate.theme.backgroundColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, backgroundColor: e.target.value })
                    }
                    className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customTheme.backgroundColor || selectedTemplate.theme.backgroundColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, backgroundColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={customTheme.textColor || selectedTemplate.theme.textColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, textColor: e.target.value })
                    }
                    className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customTheme.textColor || selectedTemplate.theme.textColor}
                    onChange={(e) =>
                      setCustomTheme({ ...customTheme, textColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Button Style
                </label>
                <select
                  value={customTheme.buttonStyle || selectedTemplate.theme.buttonStyle}
                  onChange={(e) =>
                    setCustomTheme({
                      ...customTheme,
                      buttonStyle: e.target.value as HubTheme['buttonStyle'],
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-6 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-600 mb-4">Preview:</p>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: getFinalTheme().backgroundColor,
                  color: getFinalTheme().textColor,
                }}
              >
                <h3 className="text-2xl font-bold mb-2">{title || 'Your Hub Title'}</h3>
                {subtitle && <p className="text-lg mb-4">{subtitle}</p>}
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: getFinalTheme().buttonStyle === 'solid' ? getFinalTheme().primaryColor : 'transparent',
                    color: getFinalTheme().buttonStyle === 'solid' ? getFinalTheme().secondaryColor : getFinalTheme().primaryColor,
                    border: getFinalTheme().buttonStyle !== 'solid' ? `2px solid ${getFinalTheme().primaryColor}` : 'none',
                    borderRadius: getFinalTheme().borderRadius,
                  }}
                >
                  Example Link Button
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Your Hub</h2>
              <p className="text-gray-600">
                Everything looks good? Click "Create Hub" to finish!
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Hub Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Title:</dt>
                    <dd className="font-medium">{title}</dd>
                  </div>
                  {subtitle && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Subtitle:</dt>
                      <dd className="font-medium">{subtitle}</dd>
                    </div>
                  )}
                  {description && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Description:</dt>
                      <dd className="font-medium max-w-xs text-right">{description}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Template:</dt>
                    <dd className="font-medium">{selectedTemplate?.name}</dd>
                  </div>
                </dl>
              </div>

              {/* Visual preview */}
              <div
                className="p-8 rounded-xl border-2 border-gray-200"
                style={{
                  backgroundColor: getFinalTheme().backgroundColor,
                  color: getFinalTheme().textColor,
                  fontFamily: getFinalTheme().fontFamily,
                }}
              >
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-20 h-20 object-contain mb-4 mx-auto"
                  />
                )}
                <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-lg text-center opacity-90 mb-6">{subtitle}</p>
                )}
                <div className="space-y-3 max-w-md mx-auto">
                  {[1, 2, 3].map((i) => (
                    <button
                      key={i}
                      className="w-full px-6 py-3 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: getFinalTheme().buttonStyle === 'solid' ? getFinalTheme().primaryColor : 'transparent',
                        color: getFinalTheme().buttonStyle === 'solid' ? getFinalTheme().secondaryColor : getFinalTheme().primaryColor,
                        border: getFinalTheme().buttonStyle !== 'solid' ? `2px solid ${getFinalTheme().primaryColor}` : 'none',
                        borderRadius: getFinalTheme().borderRadius,
                      }}
                    >
                      Link {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        <div className="flex gap-3">
          {currentStepIndex < steps.length - 1 && (
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          )}

          {currentStepIndex === steps.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LucideIcons.Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LucideIcons.Check className="w-5 h-5" />
                  Create Hub
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
