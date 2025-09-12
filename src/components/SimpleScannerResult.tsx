/**
 * Simplified Enhanced Scanner Result Popup
 * Works without complex dependencies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { EnvironmentalImpactCards, DetailedEnvironmentalImpact } from './EnvironmentalImpactCards';
import { AlternativeComparison, generateAlternatives } from './AlternativeComparison';
import { 
  Package, 
  Cloud, 
  FlaskConical, 
  HeartPulse, 
  Leaf, 
  Info, 
  Recycle,
  Award,
  TrendingUp,
  X,
  Share2,
  Eye
} from 'lucide-react';

interface ProductData {
  productName: string;
  brand?: string;
  category?: string;
  ecoScore: number;
  packagingScore?: number;
  carbonScore?: number;
  ingredientScore?: number;
  healthScore?: number;
  co2Impact?: number;
  recyclable?: boolean;
  certifications?: string[];
  certificationScore?: number;
  ecoDescription?: string;
  alternatives?: any[];
  imageUrl?: string;
  weight?: string;
  materials?: string;
  packaging?: string;
  origin_country?: string;
  ingredients?: string[];
}

interface SimpleScannerResultProps {
  product: ProductData;
  isOpen: boolean;
  onClose: () => void;
  onSearchAlternative?: (productName: string) => void;
  onSaveResult?: (product: ProductData) => void;
}

export const SimpleScannerResult: React.FC<SimpleScannerResultProps> = ({
  product,
  isOpen,
  onClose,
  onSearchAlternative,
  onSaveResult
}) => {
  const [activeView, setActiveView] = useState('overview');

  if (!product || !isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent choice!';
    if (score >= 60) return 'Good option';
    if (score >= 40) return 'Room for improvement';
    return 'Consider alternatives';
  };

  const ScoreCard = ({ icon, label, value, description }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    description?: string;
  }) => (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0">
      <CardContent className="p-4 text-center">
        <div className="mb-2">{icon}</div>
        <div className={`text-2xl font-bold mb-1 ${getScoreColor(value).split(' ')[0]}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
        <Progress value={value} className="h-2" />
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </CardContent>
    </Card>
  );

  const alternatives = generateAlternatives({
    product_name: product.productName,
    category: product.category,
    eco_score: product.ecoScore
  });

  // Overlay backdrop
  const backdrop = (
    <div 
      className="fixed inset-0 bg-black/80 z-40"
      onClick={onClose}
    />
  );

  // Main modal content
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {product.productName}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSaveResult?.(product)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Product Summary */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="text-gray-300">by {product.brand}</span>
              )}
              {product.category && (
                <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                  {product.category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getScoreColor(product.ecoScore)}`}>
                {product.ecoScore}/100
              </div>
              <div className="text-xs text-gray-400">
                {getScoreDescription(product.ecoScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex gap-2">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'impact', label: 'Impact' },
              { key: 'alternatives', label: 'Alternatives' },
              { key: 'details', label: 'Details' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeView === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(tab.key)}
                className={`${
                  activeView === tab.key 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Environmental Impact Cards */}
              <EnvironmentalImpactCards
                productData={{
                  product_name: product.productName,
                  category: product.category,
                  weight: product.weight,
                  materials: product.materials,
                  packaging: product.packaging,
                  origin_country: product.origin_country,
                  eco_score: product.ecoScore
                }}
              />

              {/* Product Image */}
              {product.imageUrl && product.imageUrl !== '/placeholder.svg' && (
                <div className="flex justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.productName}
                    className="w-48 h-48 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Score Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Score Breakdown
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreCard
                    icon={<Package className="text-blue-400 mx-auto" size={24} />}
                    label="Packaging"
                    value={product.packagingScore || product.ecoScore}
                  />
                  <ScoreCard
                    icon={<Cloud className="text-gray-400 mx-auto" size={24} />}
                    label="Carbon"
                    value={product.carbonScore || product.ecoScore}
                  />
                  <ScoreCard
                    icon={<FlaskConical className="text-purple-400 mx-auto" size={24} />}
                    label="Ingredients"
                    value={product.ingredientScore || product.ecoScore}
                  />
                  <ScoreCard
                    icon={<HeartPulse className="text-red-400 mx-auto" size={24} />}
                    label="Health"
                    value={product.healthScore || product.ecoScore}
                  />
                </div>
              </div>
            </div>
          )}

          {activeView === 'impact' && (
            <div className="space-y-6">
              <DetailedEnvironmentalImpact
                productData={{
                  product_name: product.productName,
                  category: product.category,
                  weight: product.weight,
                  materials: product.materials,
                  packaging: product.packaging,
                  origin_country: product.origin_country,
                  eco_score: product.ecoScore
                }}
              />
            </div>
          )}

          {activeView === 'alternatives' && (
            <div className="space-y-6">
              <AlternativeComparison
                currentProduct={{
                  product_name: product.productName,
                  category: product.category,
                  eco_score: product.ecoScore,
                  weight: product.weight,
                  materials: product.materials,
                  packaging: product.packaging,
                  origin_country: product.origin_country
                }}
                alternatives={alternatives}
                onSelectAlternative={(alt) => {
                  onSearchAlternative?.(alt.name);
                  onClose();
                }}
              />
            </div>
          )}

          {activeView === 'details' && (
            <div className="space-y-6">
              {/* Product Details */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Brand:</span>
                      <span className="ml-2 text-white">{product.brand || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="ml-2 text-white">{product.category || 'Unknown'}</span>
                    </div>
                    {product.weight && (
                      <div>
                        <span className="text-gray-400">Weight:</span>
                        <span className="ml-2 text-white">{product.weight}</span>
                      </div>
                    )}
                    {product.origin_country && (
                      <div>
                        <span className="text-gray-400">Origin:</span>
                        <span className="ml-2 text-white">{product.origin_country}</span>
                      </div>
                    )}
                  </div>
                  
                  {product.materials && (
                    <div>
                      <span className="text-gray-400">Materials:</span>
                      <span className="ml-2 text-white">{product.materials}</span>
                    </div>
                  )}
                  
                  {product.packaging && (
                    <div>
                      <span className="text-gray-400">Packaging:</span>
                      <span className="ml-2 text-white">{product.packaging}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onSaveResult?.(product)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Save to History
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {backdrop}
      {modalContent}
    </>
  );
};

export default SimpleScannerResult;
