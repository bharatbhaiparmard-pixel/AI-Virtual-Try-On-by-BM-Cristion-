
import React from 'react';
import { ShirtIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm border-b border-base-300 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg">
            <ShirtIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            AI Virtual Try-On
          </h1>
        </div>
      </div>
    </header>
  );
};
