
import React from 'react';

type TFunction = (key: string) => string;

interface SauceCalculatorProps {
  totalTaels: number;
  t: TFunction;
}

const SauceCalculator: React.FC<SauceCalculatorProps> = ({ totalTaels, t }) => {
  let multiplier = 1;
  if (totalTaels > 20) multiplier = 2;
  else if (totalTaels > 12) multiplier = 1.5;

  const formatAmount = (amount: number) => {
    const result = amount * multiplier;
    if (result % 1 !== 0) return `${Math.floor(result)}½`;
    return result;
  }

  if (totalTaels <= 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold uppercase tracking-tight text-white">{t('sauceTitle')}</h3>
      <ul className="space-y-2 text-base text-gray-300">
        <li className="flex items-baseline">
          <span className="font-bold text-xl mr-2 text-white">{formatAmount(2)}{t('tbsp')}</span>
          <span>{t('soySauce')}</span>
        </li>
        <li className="flex items-baseline">
          <span className="font-bold text-xl mr-2 text-white">{formatAmount(1)}{t('tsp')}</span>
          <span>{t('sugar')}</span>
        </li>
        <li className="flex items-baseline">
          <span className="font-bold text-xl mr-2 text-white">{formatAmount(2)}{t('tbsp')}</span>
          <span>{t('hotWater')}</span>
        </li>
        <li className="flex items-baseline">
          <span className="font-bold text-xl mr-2 text-white">{t('adequate')}</span>
          <span>{t('oil')}</span>
        </li>
      </ul>
    </div>
  );
};

export { SauceCalculator };
