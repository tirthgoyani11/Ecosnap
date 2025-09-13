/**
 * Enhanced Scanner Result Component
 * Improved UI, detailed information, multiple alternatives, and product images
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
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
  Eye,
  Star,
  MapPin,
  Calendar,
  Weight,
  Factory,
  Truck,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Heart,
  Bookmark
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
  price?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  barcode?: string;
}

interface Alternative {
  name: string;
  brand: string;
  category: string;
  ecoScore: number;
  price: string;
  priceCompare: string;
  imageUrl: string;
  co2Impact: number;
  keyBenefits: string[];
  availability: string;
  rating: number;
  savingsPerYear: string;
}

interface EnhancedScannerResultProps {
  product: ProductData;
  isOpen: boolean;
  onClose: () => void;
  onSearchAlternative?: (productName: string) => void;
  onSaveResult?: (product: ProductData) => void;
}

export const EnhancedScannerResult: React.FC<EnhancedScannerResultProps> = ({
  product,
  isOpen,
  onClose,
  onSearchAlternative,
  onSaveResult
}) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!product || !isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent environmental choice! 🌟';
    if (score >= 60) return 'Good eco-friendly option 👍';
    if (score >= 40) return 'Room for improvement 📈';
    return 'Consider switching to alternatives 🔄';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Star className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  };

  // Generate enhanced alternatives with better data
  const generateEnhancedAlternatives = (): Alternative[] => {
    const categoryAlternatives = {
      'Smartphone': [
        {
          name: 'Fairphone 5',
          brand: 'Fairphone',
          category: 'Smartphone',
          ecoScore: 92,
          price: '$699',
          priceCompare: '+$100',
          imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
          co2Impact: 0.45,
          keyBenefits: ['Modular design', 'Recycled materials', 'Fair trade minerals'],
          availability: 'Available online',
          rating: 4.8,
          savingsPerYear: '$50 in repairs'
        },
        {
          name: 'iPhone 15 (Refurbished)',
          brand: 'Apple',
          category: 'Smartphone',
          ecoScore: 85,
          price: '$549',
          priceCompare: '-$250',
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
          co2Impact: 0.35,
          keyBenefits: ['Certified refurbished', '70% carbon reduction', 'Same performance'],
          availability: 'In stock',
          rating: 4.7,
          savingsPerYear: '$200 vs new'
        },
        {
          name: 'Google Pixel 8a',
          brand: 'Google',
          category: 'Smartphone',
          ecoScore: 78,
          price: '$499',
          priceCompare: '-$300',
          imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
          co2Impact: 0.55,
          keyBenefits: ['Recycled aluminum', 'Software longevity', 'Energy efficient'],
          availability: 'Available',
          rating: 4.5,
          savingsPerYear: '$100 energy'
        }
      ],
      'default': [
        {
          name: 'Eco-Friendly Alternative 1',
          brand: 'GreenBrand',
          category: product.category || 'General',
          ecoScore: Math.min(95, (product.ecoScore || 40) + 20),
          price: '$XX',
          priceCompare: 'Similar price',
          imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
          co2Impact: (product.co2Impact || 1.0) * 0.6,
          keyBenefits: ['Sustainable materials', 'Lower carbon footprint', 'Recyclable packaging'],
          availability: 'Available',
          rating: 4.6,
          savingsPerYear: '$75 environmental impact'
        },
        {
          name: 'Sustainable Alternative 2',
          brand: 'EcoChoice',
          category: product.category || 'General',
          ecoScore: Math.min(90, (product.ecoScore || 40) + 15),
          price: '$XX',
          priceCompare: '-10%',
          imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400&h=400&fit=crop',
          co2Impact: (product.co2Impact || 1.0) * 0.7,
          keyBenefits: ['Organic materials', 'Zero waste production', 'Local sourcing'],
          availability: 'Available',
          rating: 4.4,
          savingsPerYear: '$50 environmental'
        }
      ]
    };

    return categoryAlternatives[product.category as keyof typeof categoryAlternatives] || 
           categoryAlternatives.default;
  };

  const alternatives = generateEnhancedAlternatives();

  const ScoreCard = ({ icon, label, value, description, trend }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          {trend && (
            <TrendingUp className={`w-4 h-4 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500 rotate-180' : 
              'text-gray-400'
            }`} />
          )}
        </div>
        <div className={`text-2xl font-bold mb-2 ${getScoreColor(value).split(' ')[0]}`}>
          {value}
        </div>
        <Progress value={value} className="h-2 mb-2" />
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </CardContent>
    </Card>
  );

  // Main modal content
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{product.productName}</h2>
                    <div className="flex items-center gap-2 text-green-100">
                      {product.brand && (
                        <span>by {product.brand}</span>
                      )}
                      {product.category && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Eco Score Badge */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center gap-2 mb-1">
                    {getScoreIcon(product.ecoScore)}
                    <span className="text-sm font-medium">Eco Score</span>
                  </div>
                  <div className="text-3xl font-bold">{product.ecoScore}</div>
                  <div className="text-xs text-green-100">/100</div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {setIsLiked(!isLiked)}}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {setIsSaved(!isSaved); onSaveResult?.(product)}}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Recycle className="w-4 h-4" />
                <span>{product.recyclable ? 'Recyclable' : 'Non-recyclable'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                <span>{product.co2Impact || '0.99'} kg CO₂</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{product.origin_country || 'Global'}</span>
              </div>
              {product.weight && (
                <div className="flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  <span>{product.weight}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1 py-2">
              {[
                { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                { key: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> },
                { key: 'alternatives', label: `Alternatives (${alternatives.length})`, icon: <TrendingUp className="w-4 h-4" /> },
                { key: 'impact', label: 'Environmental Impact', icon: <Leaf className="w-4 h-4" /> }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeView === tab.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView(tab.key)}
                  className={`flex items-center gap-2 ${
                    activeView === tab.key 
                      ? 'bg-green-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeView === 'overview' && (
              <div className="space-y-8">
                {/* Hero Section with Product Image */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <img 
                          src={product.imageUrl || `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80`}
                          alt={product.productName}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80`;
                          }}
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {getScoreDescription(product.ecoScore)}
                          </p>
                          {product.price && (
                            <div className="text-lg font-bold text-green-600">
                              {product.price}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    {/* Score Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" />
                        Environmental Scores
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ScoreCard
                          icon={<Package className="text-blue-500" size={20} />}
                          label="Packaging"
                          value={product.packagingScore || Math.max(40, product.ecoScore - 10)}
                          trend="up"
                        />
                        <ScoreCard
                          icon={<Cloud className="text-gray-500" size={20} />}
                          label="Carbon"
                          value={product.carbonScore || Math.max(30, product.ecoScore - 15)}
                          trend="neutral"
                        />
                        <ScoreCard
                          icon={<FlaskConical className="text-purple-500" size={20} />}
                          label="Materials"
                          value={product.ingredientScore || Math.max(45, product.ecoScore - 5)}
                          trend="up"
                        />
                        <ScoreCard
                          icon={<HeartPulse className="text-red-500" size={20} />}
                          label="Health"
                          value={product.healthScore || Math.max(50, product.ecoScore)}
                          trend="up"
                        />
                      </div>
                    </div>

                    {/* Key Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="text-yellow-500" />
                          Key Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Eco-friendly materials</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Sustainable packaging</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Carbon neutral shipping</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Recycle className="w-4 h-4 text-blue-500" />
                              <span>{product.recyclable ? 'Fully recyclable' : 'Limited recyclability'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="w-4 h-4 text-gray-500" />
                              <span>Local sourcing when possible</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Factory className="w-4 h-4 text-orange-500" />
                              <span>Ethical manufacturing</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'alternatives' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Better Environmental Alternatives
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Discover products with higher eco-scores and lower environmental impact
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alternatives.map((alt, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img 
                            src={alt.imageUrl}
                            alt={alt.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className={`${getScoreColor(alt.ecoScore)} font-bold`}>
                              {alt.ecoScore}/100
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < Math.floor(alt.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{alt.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">by {alt.brand}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-green-600">{alt.price}</span>
                            <span className={`text-sm ${alt.priceCompare.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                              {alt.priceCompare}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            {alt.keyBenefits.slice(0, 2).map((benefit, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <div className="bg-green-50 p-2 rounded text-center">
                              <Cloud className="w-4 h-4 mx-auto mb-1 text-green-600" />
                              <div className="font-medium">{alt.co2Impact}kg CO₂</div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <div className="font-medium">{alt.savingsPerYear}</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => navigate(`/product/${encodeURIComponent(alt.name)}`)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="text-blue-500" />
                        Product Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium">{product.brand || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{product.category || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{product.weight || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Materials:</span>
                        <span className="font-medium">{product.materials || 'Mixed materials'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Origin:</span>
                        <span className="font-medium">{product.origin_country || 'Global'}</span>
                      </div>
                      {product.barcode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Barcode:</span>
                          <span className="font-medium font-mono text-sm">{product.barcode}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="text-green-500" />
                        Environmental Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO₂ Footprint:</span>
                        <span className="font-medium">{product.co2Impact || '0.99'} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recyclable:</span>
                        <span className={`font-medium ${product.recyclable ? 'text-green-600' : 'text-red-600'}`}>
                          {product.recyclable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packaging:</span>
                        <span className="font-medium">{product.packaging || 'Standard packaging'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certifications:</span>
                        <span className="font-medium">
                          {product.certifications?.length ? product.certifications.join(', ') : 'None listed'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {product.ingredients && product.ingredients.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FlaskConical className="text-purple-500" />
                        Ingredients/Components
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeView === 'impact' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Environmental Impact Analysis
                  </h3>
                  <p className="text-gray-600">
                    Understanding the environmental footprint of this product
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Cloud className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h4 className="text-lg font-semibold mb-2">Carbon Footprint</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {product.co2Impact || '0.99'} kg
                      </div>
                      <p className="text-sm text-gray-600">CO₂ equivalent emissions</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Recycle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h4 className="text-lg font-semibold mb-2">Recyclability</h4>
                      <div className={`text-3xl font-bold mb-2 ${product.recyclable ? 'text-green-600' : 'text-red-600'}`}>
                        {product.recyclable ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {product.recyclable ? 'Fully recyclable' : 'Limited recyclability'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Leaf className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h4 className="text-lg font-semibold mb-2">Sustainability</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {product.ecoScore}%
                      </div>
                      <p className="text-sm text-gray-600">Overall eco-friendliness</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="text-orange-500" />
                      Environmental Impact Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Manufacturing', impact: 45, color: 'bg-red-500' },
                        { label: 'Transportation', impact: 25, color: 'bg-orange-500' },
                        { label: 'Packaging', impact: 20, color: 'bg-yellow-500' },
                        { label: 'End of life', impact: 10, color: 'bg-green-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-20 text-sm font-medium">{item.label}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                            <div 
                              className={`${item.color} h-4 rounded-full`}
                              style={{ width: `${item.impact}%` }}
                            />
                          </div>
                          <div className="w-12 text-sm font-medium text-right">{item.impact}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Scanned on {new Date().toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveView('alternatives')}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Find Better Options
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/product/${encodeURIComponent(product.productName)}`)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Info className="w-4 h-4 mr-1" />
                  Full Details
                </Button>
                <Button 
                  size="sm"
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};