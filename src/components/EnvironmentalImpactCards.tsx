/**
 * Enhanced Environmental Impact Metrics Component
 * Displays accurate CO2 impact, water savings, trees equivalent with realistic calculations
 */

import React from 'react';
import { Card, CardContent } from './ui/card';

export interface EnvironmentalMetrics {
  co2_impact_kg: number;
  trees_equivalent: number;
  water_saved_liters: number;
  miles_not_driven: number;
  eco_points_earned: number;
  packaging_recyclability: number;
}

interface EnvironmentalImpactCardsProps {
  productData: {
    product_name: string;
    category?: string;
    weight?: string;
    materials?: string;
    packaging?: string;
    origin_country?: string;
    eco_score?: number;
  };
  className?: string;
  showPoints?: boolean;
}

export const EnvironmentalImpactCards: React.FC<EnvironmentalImpactCardsProps> = ({
  productData,
  className = '',
  showPoints = true
}) => {
  const metrics = calculateEnvironmentalMetrics(productData);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Eco Score Card */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-lg">📊</span>
              </div>
              <span className="text-blue-200 text-sm font-medium">Eco Score</span>
            </div>
          </div>
          
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(productData.eco_score || 0)}`}>
            {productData.eco_score || 0}/100
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(productData.eco_score || 0)}`}
              style={{ width: `${productData.eco_score || 0}%` }}
            ></div>
          </div>
          
          <p className="text-gray-400 text-xs">
            {(productData.eco_score || 0) >= 70 ? 'Excellent choice' : 
             (productData.eco_score || 0) >= 50 ? 'Good option' : 'Consider alternatives'}
          </p>
        </CardContent>
      </Card>

      {/* CO2 Impact Card */}
      <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-lg">🌱</span>
              </div>
              <span className="text-green-200 text-sm font-medium">CO₂ Impact</span>
            </div>
          </div>
          
          <div className="text-3xl font-bold text-green-400 mb-1">
            {metrics.co2_impact_kg.toFixed(1)}kg
          </div>
          
          <div className="text-xs text-gray-400 mb-2">Carbon footprint</div>
          
          <div className="text-xs text-green-300">
            {metrics.trees_equivalent} trees equivalent
          </div>
        </CardContent>
      </Card>

      {/* Points Earned Card */}
      {showPoints && (
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-lg">⚡</span>
                </div>
                <span className="text-purple-200 text-sm font-medium">Points Earned</span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-purple-400 mb-1">
              +{metrics.eco_points_earned}
            </div>
            
            <div className="text-xs text-gray-400">Eco points</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Detailed Environmental Impact Display
 */
export const DetailedEnvironmentalImpact: React.FC<{
  productData: any;
  className?: string;
}> = ({ productData, className = '' }) => {
  const metrics = calculateEnvironmentalMetrics(productData);

  const impactCards = [
    {
      title: 'Trees equivalent',
      value: metrics.trees_equivalent,
      unit: '',
      description: 'Annual CO₂ absorption',
      icon: '🌳',
      color: 'green'
    },
    {
      title: 'Miles not driven',
      value: metrics.miles_not_driven,
      unit: '',
      description: 'Car equivalent',
      icon: '🚗',
      color: 'blue'
    },
    {
      title: 'Water saved',
      value: metrics.water_saved_liters,
      unit: 'L',
      description: 'Production equivalent',
      icon: '💧',
      color: 'purple'
    }
  ];

  const getCardBg = (color: string) => {
    switch (color) {
      case 'green': return 'bg-gradient-to-br from-green-900/30 to-green-800/20';
      case 'blue': return 'bg-gradient-to-br from-blue-900/30 to-blue-800/20';
      case 'purple': return 'bg-gradient-to-br from-purple-900/30 to-purple-800/20';
      default: return 'bg-gray-800/30';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-green-400">🌍</span>
        Environmental Impact
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {impactCards.map((card, index) => (
          <Card key={index} className={`${getCardBg(card.color)} border-gray-700/50`}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{card.icon}</div>
              
              <div className={`text-4xl font-bold mb-1 ${getTextColor(card.color)}`}>
                {typeof card.value === 'number' ? Math.round(card.value) : card.value}
                {card.unit && <span className="text-lg">{card.unit}</span>}
              </div>
              
              <div className="text-sm font-medium text-white mb-1">
                {card.title}
              </div>
              
              <div className="text-xs text-gray-400">
                {card.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Calculate realistic environmental metrics based on product data
 */
export function calculateEnvironmentalMetrics(productData: {
  product_name: string;
  category?: string;
  weight?: string;
  materials?: string;
  packaging?: string;
  origin_country?: string;
  eco_score?: number;
}): EnvironmentalMetrics {
  // Base calculations using realistic industry data
  const category = productData.category?.toLowerCase() || '';
  const productName = productData.product_name.toLowerCase();
  const materials = productData.materials?.toLowerCase() || '';
  const ecoScore = productData.eco_score || 50;
  
  // Extract weight in kg (default to 0.5kg if not specified)
  let weightKg = 0.5;
  if (productData.weight) {
    const weightMatch = productData.weight.match(/(\d+\.?\d*)\s*(kg|g|ml|l)/i);
    if (weightMatch) {
      const value = parseFloat(weightMatch[1]);
      const unit = weightMatch[2].toLowerCase();
      if (unit === 'kg') weightKg = value;
      else if (unit === 'g') weightKg = value / 1000;
      else if (unit === 'l' || unit === 'ml') {
        weightKg = unit === 'l' ? value : value / 1000; // Assume 1L ≈ 1kg for liquids
      }
    }
  }

  // Base CO2 emissions per kg by category (kg CO2 per kg product)
  const baseCO2PerKg = getCategoryCO2Rate(category, productName, materials);
  
  // Calculate base CO2 impact
  let co2Impact = baseCO2PerKg * weightKg;
  
  // Adjust based on origin (transportation impact)
  const transportationMultiplier = getTransportationMultiplier(productData.origin_country);
  co2Impact *= transportationMultiplier;
  
  // Adjust based on materials and packaging
  const materialsMultiplier = getMaterialsMultiplier(materials, productData.packaging);
  co2Impact *= materialsMultiplier;
  
  // Trees equivalent (1 tree absorbs ~22kg CO2 annually)
  const treesEquivalent = Math.max(0, co2Impact / 22);
  
  // Water saved calculation (liters per kg by category)
  const baseWaterPerKg = getCategoryWaterRate(category, productName);
  const waterSaved = Math.max(0, baseWaterPerKg * weightKg * (ecoScore / 100));
  
  // Miles not driven (average car emits 0.404 kg CO2 per mile)
  const milesNotDriven = Math.max(0, co2Impact / 0.404);
  
  // Eco points calculation (higher scores earn more points)
  const basePoints = Math.round(ecoScore * 0.5); // Base points from score
  const bonusPoints = Math.round(Math.max(0, (70 - ecoScore) * 0.1)); // Bonus for low impact
  const ecoPointsEarned = Math.max(1, basePoints + bonusPoints);
  
  return {
    co2_impact_kg: Math.max(0.1, co2Impact),
    trees_equivalent: Math.max(0, treesEquivalent),
    water_saved_liters: Math.max(0, waterSaved),
    miles_not_driven: Math.max(0, milesNotDriven),
    eco_points_earned: ecoPointsEarned,
    packaging_recyclability: calculatePackagingScore(productData.packaging, materials)
  };
}

/**
 * Get CO2 emissions rate per kg by product category
 */
function getCategoryCO2Rate(category: string, productName: string, materials: string): number {
  // Industry average CO2 emissions (kg CO2 per kg product)
  
  // Food categories
  if (category.includes('meat') || productName.includes('beef')) return 15.0;
  if (category.includes('dairy') || productName.includes('milk') || productName.includes('cheese')) return 3.2;
  if (category.includes('fish') || category.includes('seafood')) return 2.9;
  if (category.includes('fruit') || category.includes('vegetable')) return 0.9;
  if (category.includes('grain') || category.includes('cereal')) return 1.4;
  if (category.includes('food') || category.includes('snack')) return 2.1;
  
  // Electronics
  if (category.includes('electronics') || category.includes('phone') || category.includes('computer')) return 85.0;
  
  // Textiles
  if (category.includes('clothing') || category.includes('textile')) {
    if (materials.includes('cotton')) return 8.1;
    if (materials.includes('polyester')) return 5.9;
    return 7.0;
  }
  
  // Personal care
  if (category.includes('personal care') || category.includes('cosmetic')) return 2.3;
  
  // Cleaning products
  if (category.includes('cleaning') || category.includes('detergent')) return 2.8;
  
  // Packaging/containers
  if (category.includes('container') || category.includes('bottle')) {
    if (materials.includes('plastic')) return 1.9;
    if (materials.includes('glass')) return 0.7;
    if (materials.includes('aluminum')) return 1.8;
    return 1.5;
  }
  
  // Default for unknown categories
  return 2.5;
}

/**
 * Get transportation multiplier based on origin
 */
function getTransportationMultiplier(originCountry?: string): number {
  if (!originCountry) return 1.0;
  
  const origin = originCountry.toLowerCase();
  
  // Local/regional
  if (origin.includes('usa') || origin.includes('local') || origin.includes('regional')) return 1.0;
  
  // Nearby countries
  if (origin.includes('canada') || origin.includes('mexico')) return 1.1;
  
  // European
  if (origin.includes('europe') || origin.includes('germany') || origin.includes('france')) return 1.3;
  
  // Asian (long distance shipping)
  if (origin.includes('china') || origin.includes('india') || origin.includes('vietnam')) return 1.6;
  
  // Very distant
  if (origin.includes('australia') || origin.includes('new zealand')) return 1.8;
  
  return 1.2; // Default for unknown origins
}

/**
 * Get materials impact multiplier
 */
function getMaterialsMultiplier(materials: string, packaging?: string): number {
  let multiplier = 1.0;
  
  // Positive materials
  if (materials.includes('recycled')) multiplier *= 0.7;
  if (materials.includes('organic')) multiplier *= 0.8;
  if (materials.includes('bamboo') || materials.includes('hemp')) multiplier *= 0.6;
  if (materials.includes('biodegradable')) multiplier *= 0.8;
  
  // Negative materials
  if (materials.includes('plastic') && !materials.includes('recycled')) multiplier *= 1.3;
  if (materials.includes('petroleum')) multiplier *= 1.5;
  if (materials.includes('synthetic')) multiplier *= 1.2;
  
  // Packaging impact
  if (packaging) {
    const pack = packaging.toLowerCase();
    if (pack.includes('minimal') || pack.includes('none')) multiplier *= 0.9;
    if (pack.includes('excessive') || pack.includes('multiple layers')) multiplier *= 1.4;
    if (pack.includes('plastic') && !pack.includes('recycled')) multiplier *= 1.2;
    if (pack.includes('styrofoam')) multiplier *= 1.5;
  }
  
  return multiplier;
}

/**
 * Get water usage rate per kg by category
 */
function getCategoryWaterRate(category: string, productName: string): number {
  // Water usage in liters per kg of product
  
  if (category.includes('meat') || productName.includes('beef')) return 15400;
  if (category.includes('dairy')) return 1000;
  if (category.includes('fruit')) return 400;
  if (category.includes('vegetable')) return 250;
  if (category.includes('grain')) return 1400;
  if (category.includes('cotton') || category.includes('textile')) return 2700;
  if (category.includes('electronics')) return 1000;
  if (category.includes('personal care')) return 150;
  
  return 300; // Default
}

/**
 * Calculate packaging recyclability score
 */
function calculatePackagingScore(packaging?: string, materials?: string): number {
  if (!packaging) return 50;
  
  let score = 50;
  const pack = packaging.toLowerCase();
  
  if (pack.includes('glass')) score += 30;
  if (pack.includes('aluminum')) score += 25;
  if (pack.includes('cardboard') || pack.includes('paper')) score += 20;
  if (pack.includes('plastic') && pack.includes('recyclable')) score += 15;
  if (pack.includes('biodegradable') || pack.includes('compostable')) score += 35;
  if (pack.includes('minimal') || pack.includes('none')) score += 20;
  
  if (pack.includes('plastic') && !pack.includes('recyclable')) score -= 15;
  if (pack.includes('styrofoam')) score -= 30;
  if (pack.includes('mixed materials')) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
