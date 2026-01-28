
import React from 'react';
import { XIcon } from './Icons';

type TFunction = (key: string) => string;

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const recipeSteps = [t('recipeStep1'), t('recipeStep2'), t('recipeStep3'), t('recipeStep4')];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative animate-fade-in border border-gray-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:scale-110 transition-transform">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-center mb-8 text-white uppercase tracking-tighter">{t('recipeTitle')}</h2>
        <ol className="space-y-6 text-left">
          {recipeSteps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-3 text-xl font-black text-red-600">{index + 1}.</span>
              <span className="text-gray-300 font-bold text-base leading-snug">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 p-4 bg-red-950/40 border-l-4 border-red-600 rounded-r-xl">
            <p className="text-sm text-gray-300 font-bold leading-relaxed">{t('chefTip1')} <span className="font-black text-red-500">{t('chefTipBold')}</span> {t('chefTip2')}</p>
        </div>
      </div>
      <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
    </div>
  );
};
