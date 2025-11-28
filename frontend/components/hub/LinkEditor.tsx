'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { HubLink, CreateLinkData } from '@/lib/api/hub';

interface LinkEditorProps {
  links: HubLink[];
  onAddLink: (data: CreateLinkData) => Promise<void>;
  onUpdateLink: (linkId: string, data: Partial<CreateLinkData>) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
  onReorderLinks: (linkIds: string[]) => Promise<void>;
}

// Common link types with predefined icons
const LINK_TYPES = [
  { id: 'url', label: 'Website', icon: 'Globe', placeholder: 'https://example.com' },
  { id: 'email', label: 'Email', icon: 'Mail', placeholder: 'contact@example.com' },
  { id: 'phone', label: 'Phone', icon: 'Phone', placeholder: '+1 234 567 8900' },
  { id: 'instagram', label: 'Instagram', icon: 'Instagram', placeholder: 'username' },
  { id: 'facebook', label: 'Facebook', icon: 'Facebook', placeholder: 'username or URL' },
  { id: 'twitter', label: 'Twitter/X', icon: 'Twitter', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin', placeholder: 'username or URL' },
  { id: 'youtube', label: 'YouTube', icon: 'Youtube', placeholder: 'channel URL' },
  { id: 'tiktok', label: 'TikTok', icon: 'Music', placeholder: '@username' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', placeholder: '+1 234 567 8900' },
  { id: 'telegram', label: 'Telegram', icon: 'Send', placeholder: 'username' },
  { id: 'spotify', label: 'Spotify', icon: 'Music2', placeholder: 'artist or playlist URL' },
  { id: 'github', label: 'GitHub', icon: 'Github', placeholder: 'username' },
  { id: 'custom', label: 'Custom Link', icon: 'Link', placeholder: 'https://...' },
];

export default function LinkEditor({
  links,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onReorderLinks,
}: LinkEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Form state
  const [formType, setFormType] = useState('url');
  const [formLabel, setFormLabel] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('Globe');

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent =
      LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Link;
    return IconComponent as React.ComponentType<any>;
  };

  // Reset form
  const resetForm = () => {
    setFormType('url');
    setFormLabel('');
    setFormUrl('');
    setFormIcon('Globe');
    setIsAdding(false);
    setEditingId(null);
  };

  // Prepare URL based on link type
  const prepareUrl = (type: string, input: string): string => {
    if (!input) return '';

    switch (type) {
      case 'email':
        return input.includes('@') ? `mailto:${input}` : input;
      case 'phone':
      case 'whatsapp':
        const cleaned = input.replace(/\D/g, '');
        return type === 'phone' ? `tel:${cleaned}` : `https://wa.me/${cleaned}`;
      case 'instagram':
        return input.startsWith('http') ? input : `https://instagram.com/${input.replace('@', '')}`;
      case 'facebook':
        return input.startsWith('http') ? input : `https://facebook.com/${input}`;
      case 'twitter':
        return input.startsWith('http') ? input : `https://twitter.com/${input.replace('@', '')}`;
      case 'linkedin':
        return input.startsWith('http') ? input : `https://linkedin.com/in/${input}`;
      case 'youtube':
        return input.startsWith('http') ? input : `https://youtube.com/${input}`;
      case 'tiktok':
        return input.startsWith('http') ? input : `https://tiktok.com/@${input.replace('@', '')}`;
      case 'telegram':
        return input.startsWith('http') ? input : `https://t.me/${input.replace('@', '')}`;
      case 'spotify':
        return input.startsWith('http') ? input : `https://open.spotify.com/${input}`;
      case 'github':
        return input.startsWith('http') ? input : `https://github.com/${input}`;
      default:
        return input;
    }
  };

  // Handle add
  const handleAdd = async () => {
    if (!formLabel.trim() || !formUrl.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const finalUrl = prepareUrl(formType, formUrl);
      // Map form types to backend types
      const backendType: HubLink['type'] = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'telegram', 'spotify', 'github'].includes(formType)
        ? 'social'
        : (formType as HubLink['type']);

      await onAddLink({
        type: backendType,
        icon: formIcon,
        label: formLabel,
        url: finalUrl,
      });
      resetForm();
    } catch (err: any) {
      alert('Failed to add link: ' + err.message);
    }
  };

  // Handle edit
  const handleEdit = (link: HubLink) => {
    setEditingId(link.id ?? null);
    setFormType(link.type);
    setFormLabel(link.label);
    setFormUrl(link.url);
    setFormIcon(link.icon);
    setIsAdding(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingId || !formLabel.trim() || !formUrl.trim()) return;

    try {
      const finalUrl = prepareUrl(formType, formUrl);
      // Map form types to backend types
      const backendType: HubLink['type'] = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'telegram', 'spotify', 'github'].includes(formType)
        ? 'social'
        : (formType as HubLink['type']);

      await onUpdateLink(editingId, {
        type: backendType,
        icon: formIcon,
        label: formLabel,
        url: finalUrl,
      });
      resetForm();
    } catch (err: any) {
      alert('Failed to update link: ' + err.message);
    }
  };

  // Handle delete
  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await onDeleteLink(linkId);
    } catch (err: any) {
      alert('Failed to delete link: ' + err.message);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (link: HubLink) => {
    if (!link.id) return;
    try {
      // TODO: is_active is not in CreateLinkData - need backend support
      // await onUpdateLink(link.id, { is_active: !link.is_active });
      console.warn('Toggle active not yet supported');
    } catch (err: any) {
      alert('Failed to toggle link: ' + err.message);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Calculate new order
    const sortedLinks = [...links].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const newLinks = [...sortedLinks];
    const draggedLink = newLinks[draggedIndex];

    // Remove from old position
    newLinks.splice(draggedIndex, 1);
    // Insert at new position
    newLinks.splice(dropIndex, 0, draggedLink);

    // Call API with new order
    try {
      const linkIds = newLinks.map((l) => l.id).filter((id): id is string => id !== undefined);
      await onReorderLinks(linkIds);
    } catch (err: any) {
      alert('Failed to reorder links: ' + err.message);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle type selection
  const handleTypeChange = (typeId: string) => {
    const linkType = LINK_TYPES.find((t) => t.id === typeId);
    if (linkType) {
      setFormType(typeId);
      setFormIcon(linkType.icon);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Links</h3>
          <p className="text-sm text-gray-600">
            Add and manage links for your Hub ({links.length} links)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <LucideIcons.Plus className="w-4 h-4" />
            Add Link
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">
              {editingId ? 'Edit Link' : 'Add New Link'}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-700"
            >
              <LucideIcons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Link Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Link Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {LINK_TYPES.map((type) => {
                const Icon = getIcon(type.icon);
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2 ${
                      formType === type.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Label (Display Text)
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="e.g., Visit Our Website"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* URL/Value */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {formType === 'email' ? 'Email Address' : formType === 'phone' || formType === 'whatsapp' ? 'Phone Number' : 'URL or Username'}
            </label>
            <input
              type="text"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder={
                LINK_TYPES.find((t) => t.id === formType)?.placeholder || ''
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {formUrl && (
              <p className="text-xs text-gray-500 mt-1">
                Will be converted to: {prepareUrl(formType, formUrl)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {editingId ? 'Update Link' : 'Add Link'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <LucideIcons.Link className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 mb-4">No links yet</p>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <LucideIcons.Plus className="w-4 h-4" />
              Add Your First Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((link, index) => {
              const Icon = getIcon(link.icon);
              return (
                <div
                  key={link.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-move ${
                    !link.is_active ? 'opacity-50' : ''
                  } ${
                    draggedIndex === index
                      ? 'opacity-40 border-gray-400'
                      : dragOverIndex === index && draggedIndex !== null
                      ? 'border-black border-2'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Drag Handle */}
                  <LucideIcons.GripVertical className="w-5 h-5 text-gray-700 flex-shrink-0" />

                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>

                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-black">{link.label}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {link.url}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`p-2 rounded-lg transition-colors ${
                        link.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={link.is_active ? 'Visible' : 'Hidden'}
                    >
                      {link.is_active ? (
                        <LucideIcons.Eye className="w-4 h-4" />
                      ) : (
                        <LucideIcons.EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                      title="Edit"
                    >
                      <LucideIcons.Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => link.id && handleDelete(link.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <LucideIcons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Tips */}
      {links.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Drag and drop to reorder links</li>
              <li>Use the eye icon to show/hide links</li>
              <li>Social media links auto-format URLs</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
