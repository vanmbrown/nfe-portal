'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Image from 'next/image';

interface UploadPanelProps {
  week: number;
  onUpload: (files: File[]) => Promise<void>;
  existingUploads: Array<{
    id: string;
    signed_url?: string;
    file_path?: string;
    image_url?: string;
    created_at?: string | null;
  }>;
  isLoading?: boolean;
  error?: string | null;
}

export default function UploadPanel({
  week,
  onUpload,
  existingUploads,
  isLoading = false,
  error: externalError,
}: UploadPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URLs for selected files
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const urls = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);

      // Cleanup preview URLs
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    } else {
      setPreviewUrls([]);
    }
  }, [selectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/') || file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setError('Please select only image files under 5MB');
      return;
    }

    if (files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      await onUpload(selectedFiles);
      setSuccess(true);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload files';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* File Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Images for Week {week}
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#C9A66B] file:text-white hover:file:bg-[#E7C686] file:cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum 10 images, 5MB each. Supported formats: JPG, PNG, WebP
              </p>
            </div>

            {/* Error Messages */}
            {(error || externalError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error || externalError}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                Files uploaded successfully!
              </div>
            )}

            {/* Selected Files Preview */}
            {previewUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected Files ({selectedFiles.length}):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          aria-label="Remove file"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {selectedFiles[index]?.name || `File ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={uploading || isLoading}
                className="w-full bg-[#C9A66B] hover:bg-[#E7C686] text-white"
              >
                {uploading || isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Uploads Thumbnails */}
      {existingUploads.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Week {week} Uploads ({existingUploads.length})
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {existingUploads.map((upload) => {
                const imageUrl = upload.signed_url || upload.image_url || upload.file_path || '';
                if (!imageUrl) return null;

                return (
                  <div key={upload.id} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={imageUrl}
                        alt={`Upload ${upload.id}`}
                        fill
                        className="object-cover"
                        unoptimized // Signed URLs may not work with Next.js optimization
                      />
                    </div>
                    {upload.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
