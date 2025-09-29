'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiFile } from 'react-icons/fi';

interface DragDropUploadProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  label?: string;
  description?: string;
  files?: File[];
  className?: string;
}

export default function DragDropUpload({
  onFilesChange,
  multiple = false,
  accept = 'image/*',
  maxSize = 8,
  maxFiles = 5,
  label = 'Upload Images',
  description = 'Drag and drop images here, or click to select',
  files = [],
  className = ''
}: DragDropUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      alert(`File ${file.name} is not a valid image file.`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const fileArray = Array.from(newFiles);

    for (const file of fileArray) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (multiple) {
      const totalFiles = [...files, ...validFiles];
      if (totalFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} files will be selected.`);
        onFilesChange(totalFiles.slice(0, maxFiles));
      } else {
        onFilesChange(totalFiles);
      }
    } else {
      onFilesChange(validFiles.slice(0, 1));
    }
  }, [files, multiple, maxFiles, maxSize, accept, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsDragReject(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
    
    // Check if dragged items are valid
    const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
    setIsDragReject(!hasFiles);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsDragReject(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive
            ? isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDragReject ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <FiUpload className={`w-8 h-8 ${
                isDragReject ? 'text-red-500' : 'text-blue-500'
              }`} />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FiImage className="w-8 h-8 text-gray-400" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive
                ? isDragReject
                  ? 'Invalid file type'
                  : 'Drop files here'
                : label
              }
            </h3>
            <p className="text-gray-600 text-sm">
              {isDragActive
                ? isDragReject
                  ? 'Please drop valid image files'
                  : `Release to upload ${multiple ? 'files' : 'file'}`
                : description
              }
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Maximum file size: {maxSize}MB</p>
            {multiple && <p>Maximum files: {maxFiles}</p>}
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
          </div>

          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            Selected Files ({files.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 mr-3">
                  {file.type.startsWith('image/') ? (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiImage className="w-6 h-6 text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FiFile className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}