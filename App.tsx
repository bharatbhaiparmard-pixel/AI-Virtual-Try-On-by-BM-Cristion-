
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Footer } from './components/Footer';
import { fileToBase64 } from './utils/fileUtils';
import { performVirtualTryOn } from './services/geminiService';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File, type: 'model' | 'garment') => {
    try {
      const base64Image = await fileToBase64(file);
      if (type === 'model') {
        setModelImage(base64Image);
      } else {
        setGarmentImage(base64Image);
      }
      setError(null);
      setResultImage(null);
    } catch (err) {
      setError('Failed to load image. Please try another file.');
      console.error(err);
    }
  }, []);

  const handleTryOn = useCallback(async () => {
    if (!modelImage || !garmentImage) {
      setError('Please upload both a model and a garment image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const prompt = 'From the two images provided, take the garment from one image and place it realistically on the person in the other image. Maintain the original background of the person. The output should only be the final image of the person wearing the new garment.';
      const generatedImage = await performVirtualTryOn(modelImage, garmentImage, prompt);
      setResultImage(generatedImage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate try-on image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [modelImage, garmentImage]);

  const handleImageEdit = useCallback(async (editText: string) => {
    if (!modelImage || !garmentImage) {
      setError('Cannot edit without the original images. Please re-upload if necessary.');
      return;
    }
    if (!editText.trim()) {
      setError('Please describe the changes you want to make.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `From the two images provided, take the garment from one image and place it realistically on the person in the other image. Then, apply the following changes: "${editText}". Maintain the original background of the person unless instructed otherwise. Maintain the person's identity. The output should only be the final edited image.`;
      const generatedImage = await performVirtualTryOn(modelImage, garmentImage, prompt);
      setResultImage(generatedImage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [modelImage, garmentImage]);

  const canTryOn = modelImage !== null && garmentImage !== null && !isLoading;

  return (
    <div className="min-h-screen bg-base-100 text-text-primary flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <section id="upload-section" className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-text-primary">Upload Your Images</h2>
            <p className="text-center text-text-secondary mb-8">Select a photo of a person and a photo of a garment to begin.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUploader
                title="Your Model"
                description="Upload a clear, front-facing photo of a person."
                onImageUpload={(file) => handleImageUpload(file, 'model')}
                image={modelImage}
                onRemoveImage={() => setModelImage(null)}
              />
              <ImageUploader
                title="Your Garment"
                description="Upload a photo of the clothing item on a plain background."
                onImageUpload={(file) => handleImageUpload(file, 'garment')}
                image={garmentImage}
                onRemoveImage={() => setGarmentImage(null)}
              />
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleTryOn}
                disabled={!canTryOn}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>Virtually Try It On</span>
              </button>
            </div>
          </section>

          {error && (
             <div className="text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          <section id="result-section">
            <ResultDisplay isLoading={isLoading} resultImage={resultImage} onImageEdit={handleImageEdit} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
