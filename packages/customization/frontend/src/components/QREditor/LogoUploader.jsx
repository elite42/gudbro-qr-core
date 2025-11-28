import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadLogo } from '../../utils/api';

export default function LogoUploader({ logo, onLogoChange, onLogoRemove }) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to backend
      const result = await uploadLogo(file);
      onLogoChange(result.logo);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, [onLogoChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Logo (Optional)
      </label>

      {!logo ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isUploading} />
          
          <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          
          {isUploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm text-primary-600 font-medium">Drop logo here</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">
                <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <FiImage className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Logo uploaded</p>
              <p className="text-xs text-gray-500 mt-1">
                Logo will be centered in the QR code
              </p>
            </div>

            <button
              type="button"
              onClick={onLogoRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove logo"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Logo positioning slider (future enhancement) */}
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Logo Size</label>
            <input
              type="range"
              min="10"
              max="30"
              defaultValue="20"
              className="w-full"
              title="Logo size (% of QR code)"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        💡 Tip: Use a logo with transparent background for best results
      </p>
    </div>
  );
}
