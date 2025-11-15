'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export function FileUpload({
  maxFiles = 3,
  maxSizeMB = 5,
  accept = 'image/*',
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image file`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `${file.name} exceeds maximum size of ${maxSizeMB}MB`;
    }

    return null;
  }, [maxSizeMB]);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(newFiles);

      // Validate all files
      const validationErrors: string[] = [];
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        }
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Check total file count
      const totalFiles = files.length + fileArray.length;
      if (totalFiles > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
        return;
      }

      // Add new files
      const updatedFiles = [...files, ...fileArray];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, maxFiles, validateFile, onFilesChange]
  );

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const getFilePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive
            ? 'border-[#C9A66B] bg-[#C9A66B]/10'
            : 'border-gray-300 hover:border-gray-400',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          id="file-upload"
          accept={accept}
          multiple
          onChange={handleInputChange}
          disabled={files.length >= maxFiles}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            'cursor-pointer flex flex-col items-center justify-center space-y-2',
            files.length >= maxFiles && 'cursor-not-allowed'
          )}
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="text-[#C9A66B] font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-gray-500">
            Images only (max {maxSizeMB}MB each, up to {maxFiles} files)
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={getFilePreview(file)}
                  alt={file.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500 truncate">{file.name}</div>
              <div className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {files.length > 0 && (
        <div className="text-sm text-gray-600">
          {files.length} of {maxFiles} files selected
        </div>
      )}
    </div>
  );
}

