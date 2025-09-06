
import React, { useState, useEffect } from 'react';
import { ImageIcon, SparklesIcon, SunIcon, ContrastIcon, SaturationIcon, ResetIcon, AnalyzeIcon, GarmentIcon, PersonIcon, DownloadIcon } from './icons';

interface ResultDisplayProps {
  isLoading: boolean;
  resultImage: string | null;
  onImageEdit: (prompt: string) => void;
}

const loadingStages = [
  { icon: AnalyzeIcon, label: "Analyzing Images..." },
  { icon: GarmentIcon, label: "Isolating Garment..." },
  { icon: PersonIcon, label: "Mapping to Model..." },
  { icon: SparklesIcon, label: "Rendering Final Look..." },
];


// A sub-component for the filter slider UI
interface FilterSliderProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
}

const FilterSlider: React.FC<FilterSliderProps> = ({ icon, label, value, onChange, min, max }) => (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <div aria-hidden="true">{icon}</div>
        <label htmlFor={label.toLowerCase()} className="sr-only">{label}</label>
        <input
            id={label.toLowerCase()}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-sm accent-brand-primary"
            aria-label={`${label} slider`}
        />
        <span className="text-sm text-text-secondary w-10 text-right">{value}%</span>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, resultImage, onImageEdit }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [editText, setEditText] = useState('');
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
  });

  useEffect(() => {
    if (isLoading) {
      setCurrentStage(0);
      const intervalId = setInterval(() => {
        setCurrentStage(prev => (prev + 1) % loadingStages.length);
      }, 2500);
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  const handleResetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturate: 100,
    });
  };

  useEffect(() => {
    // Reset filters when a new image is loaded or cleared
    handleResetFilters();
  }, [resultImage]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: Number(value) }));
  };
  
  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`,
  };
  
  const handleDownload = () => {
    if (!resultImage) return;

    const image = new Image();
    image.crossOrigin = 'anonymous'; 
    image.src = resultImage;

    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.filter = filterStyle.filter;
            ctx.drawImage(image, 0, 0);

            const link = document.createElement('a');
            link.download = 'virtual-try-on.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };
    image.onerror = (e) => {
        console.error("Failed to load image for download.", e);
    };
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onImageEdit(editText);
  };

  return (
    <div className="w-full bg-base-200 rounded-xl shadow-lg border border-base-300 flex flex-col justify-start items-center p-4 md:p-6 transition-all duration-300">
      <div className="w-full min-h-[400px] md:min-h-[500px] flex justify-center items-center">
        {isLoading ? (
            <div className="text-center w-full max-w-lg">
                <h3 className="text-xl font-semibold text-text-primary mb-8">Generating Your Look</h3>
                <div className="flex items-center justify-between relative mb-4 px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-base-300 -translate-y-1/2"></div>
                    <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-brand-primary -translate-y-1/2 transition-all duration-500" 
                        style={{ width: `calc(${currentStage / (loadingStages.length - 1) * 100}% - 1rem)` }}
                    ></div>
                    {loadingStages.map((stage, index) => {
                        const isCompleted = index < currentStage;
                        const isActive = index === currentStage;
                        return (
                            <div key={index} className="z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isCompleted ? 'bg-brand-primary text-white' : ''}
                                    ${isActive ? 'bg-brand-secondary text-white scale-110 shadow-lg shadow-brand-secondary/50' : ''}
                                    ${!isCompleted && !isActive ? 'bg-base-300 text-text-secondary' : ''}
                                `}>
                                    <stage.icon className={`w-7 h-7 ${isActive ? 'animate-pulse' : ''}`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-text-secondary transition-opacity duration-500 h-6">
                    {loadingStages[currentStage].label}
                </p>
            </div>
        ) : resultImage ? (
            <img 
                src={resultImage} 
                alt="Virtual try-on result" 
                className="max-w-full max-h-[500px] rounded-lg object-contain transition-all duration-200"
                style={filterStyle}
            />
        ) : (
            <div className="text-center text-text-secondary">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-text-primary">Your Result Will Appear Here</h3>
                <p>Upload images and click the "Try It On" button to see the magic.</p>
            </div>
        )}
      </div>

      {resultImage && !isLoading && (
        <div className="w-full max-w-2xl mt-6 divide-y divide-base-300">
          <div className="py-6 px-2">
            <form onSubmit={handleEditSubmit} className="w-full max-w-lg mx-auto space-y-3">
              <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-brand-secondary" />
                  <h4 className="text-lg font-semibold text-text-primary">Refine with AI</h4>
              </div>
              <p className="text-sm text-text-secondary">
                  Describe changes to the style, color, or background. <br/>
                  e.g., "Change the shirt to blue" or "Add a beach background".
              </p>
              <div className="relative">
                <label htmlFor="edit-prompt" className="sr-only">Describe your edits</label>
                <textarea
                  id="edit-prompt"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Make it a leather jacket, change background..."
                  rows={2}
                  className="w-full bg-base-300 border border-transparent rounded-lg p-3 pr-28 text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                  aria-label="Describe changes to the image"
                />
                <button 
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-md shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-sm"
                  disabled={!editText.trim()}
                  aria-label="Apply changes"
                >
                  <SparklesIcon className="w-5 h-5"/>
                  <span>Apply</span>
                </button>
              </div>
            </form>
          </div>
        
          <div className="py-6 px-2">
            <div className="w-full max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-text-primary">Adjust Filters</h4>
                  <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors"
                        aria-label="Download image"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download</span>
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors"
                        aria-label="Reset filters"
                    >
                        <ResetIcon className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                  </div>
              </div>
              <div className="space-y-4">
                <FilterSlider
                  icon={<SunIcon className="w-5 h-5 text-text-secondary" />}
                  label="Brightness"
                  value={filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', e.target.value)}
                  min={50}
                  max={150}
                />
                <FilterSlider
                  icon={<ContrastIcon className="w-5 h-5 text-text-secondary" />}
                  label="Contrast"
                  value={filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', e.target.value)}
                  min={50}
                  max={150}
                />
                <FilterSlider
                  icon={<SaturationIcon className="w-5 h-5 text-text-secondary" />}
                  label="Saturation"
                  value={filters.saturate}
                  onChange={(e) => handleFilterChange('saturate', e.target.value)}
                  min={0}
                  max={200}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
