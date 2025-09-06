
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-text-secondary">
        <p>&copy; {new Date().getFullYear()} AI Virtual Try-On. Powered by Google Gemini.</p>
      </div>
    </footer>
  );
};
