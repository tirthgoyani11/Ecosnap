/**
 * Alternative Product Comparison Component
 * Shows environmental savings when switching to recommended alternatives
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { calculateEnvironmentalMetrics, EnvironmentalMetrics } from './EnvironmentalImpactCards';

interface AlternativeProduct {
  name: string;
  category: string;
  eco_score: number;
  price_difference?: string;
  availability?: string;
  key_benefits: string[];
  environmental_benefits: string[];
}

interface AlternativeComparisonProps {
  currentProduct: {
    product_name: string;
    category?: string;
    eco_score?: number;
    weight?: string;
    materials?: string;
    packaging?: string;
    origin_country?: string;
  };
  alternatives: AlternativeProduct[];
  onSelectAlternative?: (alternative: AlternativeProduct) => void;
  className?: string;
}

export const AlternativeComparison: React.FC<AlternativeComparisonProps> = ({
  currentProduct,
  alternatives,
  onSelectAlternative,
  className = ''
}) => {
  const currentMetrics = calculateEnvironmentalMetrics(currentProduct);

  const calculateSavings = (alternative: AlternativeProduct): {
    co2_savings: number;
    water_savings: number;
    score_improvement: number;
    metrics: EnvironmentalMetrics;
  } => {
    const altProductData = {
      product_name: alternative.name,
      category: alternative.category,
      eco_score: alternative.eco_score,
      weight: currentProduct.weight,
      materials: currentProduct.materials,
      packaging: currentProduct.packaging,
      origin_country: currentProduct.origin_country
    };
    
    const altMetrics = calculateEnvironmentalMetrics(altProductData);
    
    return {
      co2_savings: Math.max(0, currentMetrics.co2_impact_kg - altMetrics.co2_impact_kg),
      water_savings: Math.max(0, altMetrics.water_saved_liters - currentMetrics.water_saved_liters),
      score_improvement: alternative.eco_score - (currentProduct.eco_score || 0),
      metrics: altMetrics
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-red-400 bg-red-900/30';
  };

  const getSavingsColor = (savings: number) => {
    if (savings > 0) return 'text-green-400';
    return 'text-gray-400';
  };

  if (alternatives.length === 0) {
    return (
      <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-2">🌿</div>
          <p className="text-gray-300">No better alternatives found at this time.</p>
          <p className="text-gray-500 text-sm mt-1">Your current choice is already environmentally friendly!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <span className="text-green-400">🔄</span>
          Better Alternatives
        </h3>
        <p className="text-gray-400 text-sm">
          Switch to these eco-friendly options and see your impact savings
        </p>
      </div>

      <div className="space-y-4">
        {alternatives.map((alternative, index) => {
          const savings = calculateSavings(alternative);
          
          return (
            <Card key={index} className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{alternative.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`px-3 py-1 ${getScoreColor(alternative.eco_score)}`}>
                      {alternative.eco_score}/100
                    </Badge>
                    {savings.score_improvement > 0 && (
                      <Badge className="bg-green-900/30 text-green-400 px-2 py-1">
                        +{savings.score_improvement} points
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* CO2 Savings */}
                  <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className={`text-2xl font-bold ${getSavingsColor(savings.co2_savings)}`}>
                      -{savings.co2_savings.toFixed(1)}kg
                    </div>
                    <div className="text-xs text-gray-400">CO₂ Reduction</div>
                  </div>
                  
                  {/* Water Savings */}
                  <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className={`text-2xl font-bold ${getSavingsColor(savings.water_savings)}`}>
                      +{Math.round(savings.water_savings)}L
                    </div>
                    <div className="text-xs text-gray-400">Water Saved</div>
                  </div>
                  
                  {/* Points Gained */}
                  <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400">
                      +{savings.metrics.eco_points_earned - currentMetrics.eco_points_earned}
                    </div>
                    <div className="text-xs text-gray-400">Extra Points</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-300 mb-2">Key Benefits</h4>
                    <ul className="space-y-1">
                      {alternative.key_benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Environmental Benefits</h4>
                    <ul className="space-y-1">
                      {alternative.environmental_benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">🌱</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing and Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    {alternative.price_difference && (
                      <span className={`px-2 py-1 rounded ${
                        alternative.price_difference.includes('+') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                      }`}>
                        {alternative.price_difference}
                      </span>
                    )}
                    {alternative.availability && (
                      <span className="text-gray-400">
                        Available: {alternative.availability}
                      </span>
                    )}
                  </div>
                  
                  {onSelectAlternative && (
                    <Button 
                      onClick={() => onSelectAlternative(alternative)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Choose This
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Impact Summary */}
      <Card className="mt-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
        <CardContent className="p-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-green-400">📊</span>
            Your Potential Impact
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                -{alternatives.reduce((sum, alt) => sum + calculateSavings(alt).co2_savings, 0).toFixed(1)}kg
              </div>
              <div className="text-xs text-gray-400">Total CO₂ reduction potential</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-400">
                +{Math.round(alternatives.reduce((sum, alt) => sum + calculateSavings(alt).water_savings, 0))}L
              </div>
              <div className="text-xs text-gray-400">Total water conservation potential</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-400">
                +{alternatives.reduce((sum, alt) => sum + calculateSavings(alt).score_improvement, 0)}
              </div>
              <div className="text-xs text-gray-400">Total score improvement potential</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Generate realistic alternatives for a product
 */
export function generateAlternatives(productData: {
  product_name: string;
  category?: string;
  eco_score?: number;
}): AlternativeProduct[] {
  const category = productData.category?.toLowerCase() || '';
  const productName = productData.product_name.toLowerCase();
  const currentScore = productData.eco_score || 50;
  
  const alternatives: AlternativeProduct[] = [];

  // Food alternatives
  if (category.includes('food') || category.includes('snack')) {
    if (productName.includes('chip') || productName.includes('processed')) {
      alternatives.push({
        name: 'Organic Baked Vegetable Chips',
        category: 'organic snack',
        eco_score: Math.min(95, currentScore + 25),
        price_difference: '+$0.50',
        availability: 'Most grocery stores',
        key_benefits: ['100% organic ingredients', 'Baked not fried', 'No artificial preservatives'],
        environmental_benefits: ['Sustainable farming practices', 'Biodegradable packaging', 'Local sourcing']
      });
    }
    
    if (!productName.includes('organic')) {
      alternatives.push({
        name: `Organic ${productData.product_name}`,
        category: 'organic food',
        eco_score: Math.min(95, currentScore + 20),
        price_difference: '+$0.75',
        availability: 'Organic markets',
        key_benefits: ['Certified organic', 'No pesticides', 'Better nutrition'],
        environmental_benefits: ['Soil health improvement', 'Reduced chemical runoff', 'Support for biodiversity']
      });
    }
  }

  // Beverage alternatives
  if (category.includes('beverage') || productName.includes('bottle')) {
    if (productName.includes('plastic')) {
      alternatives.push({
        name: 'Reusable Glass Water Bottle',
        category: 'sustainable container',
        eco_score: 90,
        price_difference: '+$15.00 (one-time)',
        availability: 'Online and retail stores',
        key_benefits: ['Lifetime use', 'No plastic taste', 'Easy to clean'],
        environmental_benefits: ['Eliminates single-use plastic', '99% recyclable', 'No microplastics']
      });
      
      alternatives.push({
        name: 'Aluminum Water Bottle',
        category: 'sustainable container',
        eco_score: 85,
        price_difference: '+$12.00 (one-time)',
        availability: 'Most stores',
        key_benefits: ['Lightweight', 'Durable', 'Keeps drinks cold'],
        environmental_benefits: ['100% recyclable', 'Lower carbon footprint', 'No BPA']
      });
    }
  }

  // Personal care alternatives
  if (category.includes('personal care') || category.includes('cosmetic')) {
    alternatives.push({
      name: 'Zero-Waste Solid Alternative',
      category: 'zero-waste personal care',
      eco_score: Math.min(95, currentScore + 30),
      price_difference: '+$2.00',
      availability: 'Eco-friendly stores',
      key_benefits: ['Concentrated formula', 'Travel-friendly', 'Long-lasting'],
      environmental_benefits: ['Plastic-free packaging', 'Reduced water usage', 'Biodegradable ingredients']
    });
  }

  // Electronics alternatives
  if (category.includes('electronics')) {
    alternatives.push({
      name: 'Refurbished/Renewed Version',
      category: 'refurbished electronics',
      eco_score: Math.min(90, currentScore + 35),
      price_difference: '-$50 to -$200',
      availability: 'Certified resellers',
      key_benefits: ['Same functionality', 'Warranty included', 'Significant savings'],
      environmental_benefits: ['Prevents e-waste', '80% less manufacturing impact', 'Extended product lifecycle']
    });
  }

  // Generic eco-friendly alternative
  if (alternatives.length === 0) {
    alternatives.push({
      name: `Eco-Friendly ${productData.product_name} Alternative`,
      category: 'sustainable option',
      eco_score: Math.min(90, currentScore + 20),
      price_difference: '+$1.00 - $3.00',
      availability: 'Eco-friendly retailers',
      key_benefits: ['Sustainable materials', 'Ethical production', 'Quality assurance'],
      environmental_benefits: ['Lower carbon footprint', 'Recyclable materials', 'Responsible sourcing']
    });
  }

  return alternatives.filter(alt => alt.eco_score > currentScore);
}

export default AlternativeComparison;
