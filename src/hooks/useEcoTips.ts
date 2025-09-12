import { useState, useEffect } from 'react';

export interface EcoTip {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'waste' | 'transport' | 'consumption' | 'food' | 'water';
  impact_rating: number; // 1-5 stars
  icon: string;
}

const ECO_TIPS: EcoTip[] = [
  {
    id: '1',
    title: 'Switch to LED Bulbs',
    description: 'LED bulbs use 75% less energy and last 25 times longer than incandescent bulbs.',
    category: 'energy',
    impact_rating: 4,
    icon: '💡'
  },
  {
    id: '2',
    title: 'Use a Reusable Water Bottle',
    description: 'One reusable bottle can replace thousands of plastic bottles over its lifetime.',
    category: 'waste',
    impact_rating: 5,
    icon: '🚰'
  },
  {
    id: '3',
    title: 'Walk or Bike Short Distances',
    description: 'For trips under 2 miles, walking or biking reduces emissions and improves health.',
    category: 'transport',
    impact_rating: 4,
    icon: '🚲'
  },
  {
    id: '4',
    title: 'Buy Local and Seasonal',
    description: 'Local produce travels fewer miles and supports your community economy.',
    category: 'food',
    impact_rating: 3,
    icon: '🥕'
  },
  {
    id: '5',
    title: 'Unplug Electronics When Not in Use',
    description: 'Phantom power draw can account for 10% of your electricity bill.',
    category: 'energy',
    impact_rating: 3,
    icon: '🔌'
  },
  {
    id: '6',
    title: 'Take Shorter Showers',
    description: 'Reducing shower time by 2 minutes can save up to 1,750 gallons per year.',
    category: 'water',
    impact_rating: 4,
    icon: '🚿'
  },
  {
    id: '7',
    title: 'Use Cloth Bags for Shopping',
    description: 'A single cloth bag can replace over 1,000 plastic bags in its lifetime.',
    category: 'waste',
    impact_rating: 4,
    icon: '🛍️'
  },
  {
    id: '8',
    title: 'Compost Kitchen Scraps',
    description: 'Composting reduces methane emissions and creates nutrient-rich soil.',
    category: 'waste',
    impact_rating: 4,
    icon: '🌱'
  },
  {
    id: '9',
    title: 'Air Dry Your Clothes',
    description: 'Line drying saves energy and helps clothes last longer.',
    category: 'energy',
    impact_rating: 3,
    icon: '👕'
  },
  {
    id: '10',
    title: 'Choose Digital Receipts',
    description: 'Digital receipts reduce paper waste and are easier to organize.',
    category: 'waste',
    impact_rating: 2,
    icon: '📱'
  },
  {
    id: '11',
    title: 'Eat More Plant-Based Meals',
    description: 'Plant-based meals typically have 50% lower carbon footprint than meat meals.',
    category: 'food',
    impact_rating: 5,
    icon: '🌿'
  },
  {
    id: '12',
    title: 'Fix Leaky Faucets',
    description: 'A single drip per second wastes over 3,000 gallons of water per year.',
    category: 'water',
    impact_rating: 4,
    icon: '🔧'
  },
  {
    id: '13',
    title: 'Use Public Transportation',
    description: 'Public transit produces 45% fewer CO2 emissions per passenger than cars.',
    category: 'transport',
    impact_rating: 5,
    icon: '🚌'
  },
  {
    id: '14',
    title: 'Buy Secondhand First',
    description: 'Buying used items reduces demand for new production and saves money.',
    category: 'consumption',
    impact_rating: 4,
    icon: '♻️'
  },
  {
    id: '15',
    title: 'Use Cold Water for Washing',
    description: 'Cold water washing can reduce energy use by up to 90%.',
    category: 'energy',
    impact_rating: 3,
    icon: '❄️'
  }
];

export const useEcoTips = () => {
  const [dailyTip, setDailyTip] = useState<EcoTip | null>(null);
  const [allTips] = useState<EcoTip[]>(ECO_TIPS);

  // Get daily tip based on current date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % ECO_TIPS.length;
    setDailyTip(ECO_TIPS[tipIndex]);
  }, []);

  const getTipsByCategory = (category: EcoTip['category']) => {
    return allTips.filter(tip => tip.category === category);
  };

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * ECO_TIPS.length);
    return ECO_TIPS[randomIndex];
  };

  const getHighImpactTips = () => {
    return allTips.filter(tip => tip.impact_rating >= 4);
  };

  return {
    dailyTip,
    allTips,
    getTipsByCategory,
    getRandomTip,
    getHighImpactTips,
  };
};
