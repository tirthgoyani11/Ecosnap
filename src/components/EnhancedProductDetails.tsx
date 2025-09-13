/**
 * Enhanced Product Details Page
 * Comprehensive product information with better visuals and multiple alternatives
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  ArrowLeft,
  Package, 
  Cloud, 
  FlaskConical, 
  HeartPulse, 
  Leaf, 
  Info, 
  Recycle,
  Award,
  TrendingUp,
  Share2,
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
  Bookmark,
  BarChart3,
  Users,
  Globe,
  Zap,
  Shield,
  Clock,
  Eye
} from 'lucide-react';

interface ProductDetailsProps {
  productId?: string;
  enrichedData?: any; // Enhanced product data from our enrichment service
  // Legacy props for backward compatibility
  productName?: string;
  brand?: string;
  category?: string;
  ecoScore?: number;
  onBack?: () => void;
}

interface DetailedProductData {
  productName: string;
  brand: string;
  category: string;
  ecoScore: number;
  packagingScore: number;
  carbonScore: number;
  materialScore: number;
  healthScore: number;
  co2Impact: number;
  recyclable: boolean;
  certifications: string[];
  imageUrl: string;
  weight: string;
  materials: string[];
  packaging: string;
  origin_country: string;
  ingredients: string[];
  price: string;
  manufacturingDate: string;
  expiryDate?: string;
  barcode: string;
  description: string;
  keyFeatures: string[];
  sustainabilityFeatures: string[];
  userRating: number;
  totalReviews: number;
  availability: string;
  carbonNeutral: boolean;
  fairTrade: boolean;
  organic: boolean;
  locallySourced: boolean;
}

interface DetailedAlternative {
  id: string;
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
  totalReviews: number;
  savingsPerYear: string;
  co2Savings: number;
  certifications: string[];
  whyBetter: string[];
}

export const EnhancedProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  enrichedData,
  // Legacy props for backward compatibility
  productName: legacyProductName,
  brand: legacyBrand,
  category: legacyCategory,
  ecoScore: legacyEcoScore,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);

  // Helper function to convert eco score grade to number
  const getEcoScoreFromGrade = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'a': 90, 'b': 80, 'c': 70, 'd': 60, 'e': 50
    };
    return gradeMap[grade.toLowerCase()] || 60;
  };
  const [isLiked, setIsLiked] = useState(false);

  // Use enriched data if available, fallback to legacy props or defaults
  const productName = enrichedData?.productName || legacyProductName || 'Unknown Product';
  const brand = enrichedData?.brand || legacyBrand || 'Unknown Brand';
  const category = enrichedData?.category || legacyCategory || 'General';
  const ecoScore = enrichedData?.ecoScore || legacyEcoScore || 50;

  // Generate detailed product data using enriched data when available
  const generateDetailedProductData = (): DetailedProductData => {
    if (enrichedData) {
      // Use real enriched data
      return {
        productName: enrichedData.productName,
        brand: enrichedData.brand,
        category: enrichedData.category,
        ecoScore: enrichedData.ecoScore,
        packagingScore: enrichedData.packagingScore || Math.max(30, enrichedData.ecoScore - 15),
        carbonScore: enrichedData.carbonScore || Math.max(20, enrichedData.ecoScore - 10),
        materialScore: enrichedData.materialScore || Math.max(25, enrichedData.ecoScore - 20),
        healthScore: enrichedData.healthScore || Math.max(40, enrichedData.ecoScore - 5),
        co2Impact: enrichedData.co2Impact || 1.5,
        recyclable: enrichedData.recyclable || false,
        certifications: enrichedData.certifications || [],
        imageUrl: enrichedData.imageUrl || '/placeholder.svg',
        weight: enrichedData.weight || '250g',
        materials: enrichedData.materials || ['Mixed materials'],
        packaging: enrichedData.packaging || 'Standard packaging',
        origin_country: enrichedData.originCountry || 'Various locations',
        ingredients: enrichedData.ingredients || [],
        price: enrichedData.price || '$50',
        manufacturingDate: new Date().toISOString().split('T')[0],
        barcode: enrichedData.barcode || productId || '000000000000',
        description: enrichedData.description || 'Product information temporarily unavailable.',
        keyFeatures: [
          `Eco Score: ${enrichedData.ecoScore}/100`,
          `${enrichedData.sustainabilityGrade || 'C'} Sustainability Rating`,
          enrichedData.recyclable ? 'Recyclable packaging' : 'Standard packaging',
          `${enrichedData.confidence}% data confidence`
        ],
        sustainabilityFeatures: [
          ...(enrichedData.certifications || []),
          enrichedData.recyclable ? 'Recyclable materials' : '',
          enrichedData.biodegradable ? 'Biodegradable components' : '',
          `CO2 impact: ${enrichedData.co2Impact?.toFixed(1) || '1.5'}kg`
        ].filter(Boolean),
        userRating: enrichedData.marketRating || 3.5,
        totalReviews: enrichedData.totalReviews || 100,
        availability: enrichedData.availability || 'Available online',
        carbonNeutral: enrichedData.carbon_neutral || false,
        fairTrade: enrichedData.fair_trade || false,
        organic: enrichedData.organic || false,
        locallySourced: enrichedData.locally_sourced || false
      };
    } else {
      // Fallback to legacy generation
      const isSmartphone = category === 'Smartphone' || productName.toLowerCase().includes('iphone');
    
      return {
        productName,
        brand: brand || (isSmartphone ? 'Apple' : 'EcoBrand'),
        category: category || 'Technology',
        ecoScore,
        packagingScore: Math.max(30, ecoScore - 15),
        carbonScore: Math.max(25, ecoScore - 20),
        materialScore: Math.max(40, ecoScore - 10),
        healthScore: Math.max(50, ecoScore - 5),
        co2Impact: isSmartphone ? 0.99 : 0.45,
        recyclable: ecoScore > 60,
        certifications: ecoScore > 70 ? ['Energy Star', 'EPEAT Gold', 'Carbon Neutral'] : ['EPEAT Silver'],
        imageUrl: isSmartphone 
          ? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=600&fit=crop&q=80',
        weight: isSmartphone ? '171g' : '250g',
        materials: isSmartphone 
          ? ['Recycled Aluminum', 'Ceramic Shield Glass', 'Rare Earth Elements'] 
          : ['Recycled Plastic', 'Bio-based Materials', 'Natural Fibers'],
        packaging: 'Minimal plastic-free packaging with recycled cardboard',
        origin_country: isSmartphone ? 'China (Assembled)' : 'Germany',
        ingredients: isSmartphone 
          ? ['Aluminum', 'Glass', 'Lithium', 'Rare Earth Metals', 'Silicon'] 
          : ['Organic Materials', 'Natural Extracts', 'Sustainable Compounds'],
        price: isSmartphone ? '$799' : '$299',
        manufacturingDate: '2024-08-15',
        expiryDate: isSmartphone ? undefined : '2027-08-15',
        barcode: '123456789012',
        description: `${productName} represents a commitment to environmental responsibility without compromising on quality or performance. Engineered with sustainable materials and designed for longevity.`,
        keyFeatures: isSmartphone
          ? ['6.1" Super Retina XDR Display', 'A17 Pro Chip', '48MP Camera System', '5G Connectivity', 'MagSafe Compatible']
          : ['Eco-friendly materials', 'Long-lasting durability', 'Minimal packaging', 'Carbon-neutral shipping', 'Recyclable components'],
        sustainabilityFeatures: [
          'Made with 75% recycled materials',
          'Carbon neutral manufacturing',
          'Renewable energy powered facilities',
          'Minimal water usage in production',
          'Biodegradable packaging materials',
          'Local supplier network'
        ],
        userRating: 4.3 + (ecoScore / 100),
        totalReviews: Math.floor(Math.random() * 5000) + 500,
        availability: 'In stock',
        carbonNeutral: ecoScore > 75,
        fairTrade: ecoScore > 80,
        organic: !isSmartphone && ecoScore > 70,
        locallySourced: ecoScore > 65
      };
    }
  };

  // Generate detailed alternatives
  const generateDetailedAlternatives = (): DetailedAlternative[] => {
    // Use enriched alternatives if available
    if (enrichedData?.alternatives && enrichedData.alternatives.length > 0) {
      return enrichedData.alternatives.map((alt, index) => ({
        id: `enriched-${index + 1}`,
        name: alt.product_name || alt.name || 'Alternative Product',
        brand: alt.brands || alt.brand || 'Unknown Brand',
        category: alt.categories || alt.category || category,
        ecoScore: alt.ecoscore_grade ? getEcoScoreFromGrade(alt.ecoscore_grade) : Math.floor(Math.random() * 20) + 75,
        price: alt.price || 'Price varies',
        priceCompare: alt.price ? `vs ${productData.price}` : 'Price comparison unavailable',
        imageUrl: alt.image_url || alt.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80',
        co2Impact: alt.carbon_footprint || 0.4,
        keyBenefits: alt.benefits || [
          'Eco-friendly alternative',
          'Sustainable materials',
          'Lower environmental impact',
          'Certified quality'
        ],
        availability: alt.availability || 'Check availability',
        rating: alt.rating || 4.2,
        totalReviews: alt.reviews_count || Math.floor(Math.random() * 1000) + 100,
        savingsPerYear: alt.savings || 'Environmental savings',
        co2Savings: alt.carbon_savings || 0.3,
        certifications: alt.certifications || ['Eco-Certified'],
        whyBetter: alt.advantages || [
          'Better environmental score',
          'Sustainable sourcing',
          'Lower carbon footprint',
          'Responsible manufacturing'
        ]
      }));
    }

    // Fallback to legacy mock data
    const isSmartphone = category === 'Smartphone' || productName.toLowerCase().includes('iphone');
    
    if (isSmartphone) {
      return [
        {
          id: '1',
          name: 'Fairphone 5',
          brand: 'Fairphone',
          category: 'Smartphone',
          ecoScore: 92,
          price: '$699',
          priceCompare: '+$100 vs iPhone 15',
          imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
          co2Impact: 0.45,
          keyBenefits: ['Modular design for easy repairs', '90% recycled materials', 'Fair trade minerals', '5-year warranty'],
          availability: 'Available online',
          rating: 4.8,
          totalReviews: 1243,
          savingsPerYear: '$150 in repair costs',
          co2Savings: 0.54,
          certifications: ['Fair Trade', 'B-Corp', 'Carbon Neutral', 'EPEAT Gold'],
          whyBetter: [
            '85% higher repairability score',
            '45% lower carbon footprint',
            'Ethically sourced materials',
            'Modular design reduces e-waste'
          ]
        },
        {
          id: '2',
          name: 'iPhone 15 (Refurbished)',
          brand: 'Apple',
          category: 'Smartphone',
          ecoScore: 85,
          price: '$549',
          priceCompare: '-31% vs new iPhone 15',
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop&q=80',
          co2Impact: 0.35,
          keyBenefits: ['Certified refurbished quality', '70% carbon reduction', 'Same performance as new', '1-year warranty'],
          availability: 'In stock',
          rating: 4.7,
          totalReviews: 892,
          savingsPerYear: '$250 vs buying new',
          co2Savings: 0.64,
          certifications: ['Apple Certified', 'EPEAT Silver'],
          whyBetter: [
            '65% lower environmental impact',
            'Significant cost savings',
            'Prevents electronic waste',
            'Same quality guarantee'
          ]
        },
        {
          id: '3',
          name: 'Google Pixel 8a',
          brand: 'Google',
          category: 'Smartphone',
          ecoScore: 78,
          price: '$499',
          priceCompare: '-38% vs iPhone 15',
          imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&q=80',
          co2Impact: 0.55,
          keyBenefits: ['100% recycled aluminum frame', '7 years of updates', 'AI-powered efficiency', 'Made from recycled materials'],
          availability: 'Available',
          rating: 4.5,
          totalReviews: 2341,
          savingsPerYear: '$100 energy efficiency',
          co2Savings: 0.44,
          certifications: ['EPEAT Gold', 'Energy Star'],
          whyBetter: [
            'Longer software support',
            'Better price-to-performance ratio',
            'More recycled materials',
            'Energy efficient design'
          ]
        }
      ];
    }

    // Default alternatives for other products
    return [
      {
        id: '1',
        name: 'Eco-Friendly Alternative Pro',
        brand: 'GreenTech',
        category: category || 'General',
        ecoScore: Math.min(95, ecoScore + 25),
        price: '$XX',
        priceCompare: 'Similar price',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80',
        co2Impact: 0.3,
        keyBenefits: ['100% renewable energy', 'Zero waste production', 'Local manufacturing', 'Biodegradable materials'],
        availability: 'Available',
        rating: 4.6,
        totalReviews: 756,
        savingsPerYear: '$120 environmental impact',
        co2Savings: 0.5,
        certifications: ['Carbon Neutral', 'Fair Trade', 'Organic'],
        whyBetter: [
          'Significantly lower carbon footprint',
          'Sustainable material sourcing',
          'Local production reduces shipping',
          'Circular economy design'
        ]
      },
      {
        id: '2',
        name: 'Sustainable Choice Advanced',
        brand: 'EcoChoice',
        category: category || 'General',
        ecoScore: Math.min(90, ecoScore + 20),
        price: '$XX',
        priceCompare: '-15% cost savings',
        imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400&h=400&fit=crop&q=80',
        co2Impact: 0.4,
        keyBenefits: ['Recycled materials', 'Energy efficient', 'Minimal packaging', 'Long-lasting design'],
        availability: 'Available',
        rating: 4.4,
        totalReviews: 432,
        savingsPerYear: '$85 operational savings',
        co2Savings: 0.35,
        certifications: ['EPEAT Gold', 'Energy Star'],
        whyBetter: [
          'Better value for money',
          'Lower operational costs',
          'Durable construction',
          'Eco-friendly packaging'
        ]
      }
    ];
  };

  const productData = generateDetailedProductData();
  const alternatives = generateDetailedAlternatives();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Star className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  };

  const ScoreCard = ({ icon, label, value, description }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    description?: string;
  }) => (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{productData.productName}</h1>
                <p className="text-sm text-gray-600">by {productData.brand}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : 'text-gray-500'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-blue-500' : 'text-gray-500'}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { key: 'overview', label: 'Overview', icon: <Package className="w-4 h-4" /> },
              { key: 'sustainability', label: 'Sustainability', icon: <Leaf className="w-4 h-4" /> },
              { key: 'alternatives', label: `Alternatives (${alternatives.length})`, icon: <TrendingUp className="w-4 h-4" /> },
              { key: 'details', label: 'Technical Details', icon: <Info className="w-4 h-4" /> },
              { key: 'reviews', label: 'Reviews & Ratings', icon: <Star className="w-4 h-4" /> }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 ${
                  activeTab === tab.key 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Product Image and Basic Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-0">
                  <img 
                    src={productData.imageUrl}
                    alt={productData.productName}
                    className="w-full h-80 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(productData.ecoScore)}`}>
                        {productData.ecoScore}/100
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(productData.userRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {productData.userRating.toFixed(1)} ({productData.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-green-600">{productData.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Availability:</span>
                        <span className="font-medium text-green-600">{productData.availability}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Origin:</span>
                        <span className="font-medium">{productData.origin_country}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="text-blue-500" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {productData.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Environmental Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="text-yellow-500" />
                    Environmental Impact Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreCard
                      icon={<Package className="text-blue-500" size={20} />}
                      label="Packaging"
                      value={productData.packagingScore}
                      description="Sustainable packaging"
                    />
                    <ScoreCard
                      icon={<Cloud className="text-gray-500" size={20} />}
                      label="Carbon"
                      value={productData.carbonScore}
                      description="Low carbon footprint"
                    />
                    <ScoreCard
                      icon={<FlaskConical className="text-purple-500" size={20} />}
                      label="Materials"
                      value={productData.materialScore}
                      description="Eco-friendly materials"
                    />
                    <ScoreCard
                      icon={<HeartPulse className="text-red-500" size={20} />}
                      label="Health"
                      value={productData.healthScore}
                      description="Health impact"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {productData.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {productData.keyFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Sustainability Features</h4>
                      <ul className="space-y-2">
                        {productData.sustainabilityFeatures.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Leaf className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-blue-500" />
                    Environmental Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Cloud className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold text-blue-600">{productData.co2Impact} kg</div>
                      <div className="text-sm text-gray-600">Carbon Footprint</div>
                      <div className="text-xs text-gray-500 mt-1">Per unit produced</div>
                    </div>
                    <div className="text-center">
                      <Recycle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold text-green-600">
                        {productData.recyclable ? '85%' : '35%'}
                      </div>
                      <div className="text-sm text-gray-600">Recyclable Content</div>
                      <div className="text-xs text-gray-500 mt-1">By weight</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                      <div className="text-2xl font-bold text-yellow-600">-45%</div>
                      <div className="text-sm text-gray-600">Energy Reduction</div>
                      <div className="text-xs text-gray-500 mt-1">vs. industry average</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Better Environmental Alternatives
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover products with higher eco-scores, lower environmental impact, and better value for your money
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {alternatives.map((alt) => (
                <Card key={alt.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={alt.imageUrl}
                        alt={alt.name}
                        className="w-full h-56 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getScoreColor(alt.ecoScore)} font-bold text-lg px-3 py-1`}>
                          {alt.ecoScore}/100
                        </Badge>
                      </div>
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{alt.rating}</span>
                          <span className="text-xs text-gray-500">({alt.totalReviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{alt.name}</h3>
                      <p className="text-gray-600 mb-3">by {alt.brand}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">{alt.price}</span>
                        <span className={`text-sm font-medium ${alt.priceCompare.includes('-') ? 'text-green-600' : 'text-red-600'}`}>
                          {alt.priceCompare}
                        </span>
                      </div>

                      {/* Key Benefits */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                        <div className="space-y-1">
                          {alt.keyBenefits.slice(0, 3).map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Why It's Better */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-green-700 mb-2">Why This is Better</h4>
                        <div className="space-y-1">
                          {alt.whyBetter.slice(0, 2).map((reason, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-green-600">
                              <TrendingUp className="w-3 h-3 mt-1 flex-shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Impact Comparison */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <Cloud className="w-5 h-5 mx-auto mb-1 text-green-600" />
                          <div className="text-sm font-medium text-green-700">
                            -{(alt.co2Savings * 100).toFixed(0)}% CO₂
                          </div>
                          <div className="text-xs text-green-600">{alt.co2Impact}kg vs {(alt.co2Impact + alt.co2Savings).toFixed(2)}kg</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                          <div className="text-sm font-medium text-blue-700">Save</div>
                          <div className="text-xs text-blue-600">{alt.savingsPerYear}</div>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {alt.certifications.slice(0, 3).map((cert, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {/* Handle view details */}}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
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

        {/* Additional tabs can be implemented similarly */}
        {activeTab === 'sustainability' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sustainability Report
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive environmental impact analysis for {productData.productName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  {productData.carbonNeutral ? (
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                  )}
                  <h3 className="font-semibold mb-2">Carbon Neutral</h3>
                  <p className="text-sm text-gray-600">
                    {productData.carbonNeutral ? 'Certified carbon neutral production' : 'Working towards carbon neutrality'}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  {productData.fairTrade ? (
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  ) : (
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  )}
                  <h3 className="font-semibold mb-2">Fair Trade</h3>
                  <p className="text-sm text-gray-600">
                    {productData.fairTrade ? 'Fair trade certified materials' : 'Standard trade practices'}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  {productData.organic ? (
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  ) : (
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  )}
                  <h3 className="font-semibold mb-2">Organic Materials</h3>
                  <p className="text-sm text-gray-600">
                    {productData.organic ? 'Made with organic materials' : 'Conventional materials used'}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  {productData.locallySourced ? (
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  ) : (
                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  )}
                  <h3 className="font-semibold mb-2">Local Sourcing</h3>
                  <p className="text-sm text-gray-600">
                    {productData.locallySourced ? 'Locally sourced materials' : 'Global supply chain'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed sustainability metrics would go here */}
          </div>
        )}
      </div>
    </div>
  );
};