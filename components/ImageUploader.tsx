
import React, { useRef, useCallback } from 'react';
import { UploadIcon, TrashIcon, PersonIcon, GarmentIcon } from './icons';

interface ImageUploaderProps {
  title: string;
  description: string;
  onImageUpload: (file: File) => void;
  image: string | null;
  onRemoveImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onImageUpload, image, onRemoveImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="bg-base-200 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg border border-base-300">
      <div className="flex items-center gap-3 mb-2">
        {title.toLowerCase().includes('model') ? <PersonIcon className="w-6 h-6 text-brand-secondary" /> : <GarmentIcon className="w-6 h-6 text-brand-secondary" />}
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      </div>
      <p className="text-sm text-text-secondary text-center mb-4">{description}</p>
      
      {image ? (
        <div className="w-full aspect-w-1 aspect-h-1 relative">
          <img src={image} alt={title} className="rounded-lg object-cover w-full h-full" />
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors duration-200"
            aria-label="Remove image"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full aspect-w-1 aspect-h-1 rounded-lg border-2 border-dashed border-base-300 flex flex-col justify-center items-center text-center p-4 cursor-pointer hover:border-brand-primary hover:bg-base-300/50 transition-colors duration-200"
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="sr-only"
          />
          <div className="text-text-secondary">
            <UploadIcon className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        </label>
      )}
    </div>
  );
};
