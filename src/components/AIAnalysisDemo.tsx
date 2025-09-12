/**
 * AI Analysis Demo Component
 * Demonstrates the enhanced eco-scoring and food analysis capabilities
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useEnhancedEcoScore } from '../hooks/useEnhancedEcoScore';
import EnhancedAnalysisDisplay from './EnhancedAnalysisDisplay';

interface DemoProduct {
  name: string;
  category: string;
  description: string;
  productData: any;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "Organic Quinoa Salad",
    category: "Healthy Food",
    description: "Fresh organic quinoa with vegetables",
    productData: {
      productName: "Organic Quinoa Salad Bowl",
      category: "food",
      brand: "WholeEarth Foods",
      ingredients: ["organic quinoa", "organic tomatoes", "organic cucumber", "olive oil", "lemon juice", "sea salt"],
      organic: true,
      calories: 320,
      servingSize: "1 bowl (200g)",
      packagingType: "recyclable cardboard",
      originCountry: "USA",
      certifications: ["organic", "non-gmo"]
    }
  },
  {
    name: "Plastic Water Bottle",
    category: "Beverage Container",
    description: "Single-use plastic bottle",
    productData: {
      productName: "Single-Use Plastic Water Bottle",
      category: "beverage",
      brand: "AquaCorp",
      materials: "PET plastic",
      packaging: "plastic bottle with plastic cap",
      weight: "500ml",
      originCountry: "China"
    }
  },
  {
    name: "Bamboo Toothbrush",
    category: "Personal Care",
    description: "Sustainable bamboo toothbrush",
    productData: {
      productName: "Bamboo Toothbrush with Charcoal Bristles",
      category: "personal care",
      brand: "EcoBrush Co.",
      materials: "bamboo handle, charcoal-infused bristles",
      packaging: "minimal cardboard packaging",
      certifications: ["fsc-certified", "biodegradable"],
      originCountry: "Vietnam"
    }
  },
  {
    name: "Processed Snack Chips",
    category: "Snack Food",
    description: "Highly processed potato chips",
    productData: {
      productName: "Ultra Processed Potato Chips",
      category: "snack food",
      brand: "CrunchyCorp",
      ingredients: ["potatoes", "vegetable oil", "salt", "artificial flavors", "preservatives", "msg", "artificial colors"],
      calories: 540,
      servingSize: "1 bag (150g)",
      packaging: "foil-lined plastic bag",
      originCountry: "Mexico"
    }
  }
];

export const AIAnalysisDemo: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { 
    analyzeProduct, 
    aiAnalysis, 
    ecoScore, 
    isAnalyzing: hookIsAnalyzing,
    sustainabilityGrade,
    keyInsights,
    recommendations 
  } = useEnhancedEcoScore();

  const handleAnalyzeProduct = async (product: DemoProduct) => {
    setSelectedProduct(product);
    setIsAnalyzing(true);
    
    try {
      await analyzeProduct(product.productData);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'healthy food':
        return 'bg-green-100 text-green-800';
      case 'beverage container':
        return 'bg-blue-100 text-blue-800';
      case 'personal care':
        return 'bg-purple-100 text-purple-800';
      case 'snack food':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            🤖 Enhanced AI Analysis Demo
          </CardTitle>
          <p className="text-center text-gray-600">
            Experience our new AI-powered eco-scoring and food analysis system
          </p>
        </CardHeader>
      </Card>

      {/* Demo Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_PRODUCTS.map((product, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProduct?.name === product.name ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => !isAnalyzing && !hookIsAnalyzing && handleAnalyzeProduct(product)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <Badge className={getCategoryColor(product.category)}>
                {product.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              <Button 
                className="w-full" 
                variant={selectedProduct?.name === product.name ? "default" : "outline"}
                disabled={isAnalyzing || hookIsAnalyzing}
              >
                {isAnalyzing && selectedProduct?.name === product.name 
                  ? "Analyzing..." 
                  : "Analyze Product"
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Results */}
      {(aiAnalysis || (isAnalyzing || hookIsAnalyzing)) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          
          {aiAnalysis ? (
            <EnhancedAnalysisDisplay 
              analysis={aiAnalysis} 
              isLoading={false}
            />
          ) : (
            <EnhancedAnalysisDisplay 
              analysis={{} as any} 
              isLoading={true}
            />
          )}
        </div>
      )}

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 New AI Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600">
                Advanced prompts provide comprehensive environmental and health analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🥗</div>
              <h3 className="font-semibold mb-2">Food Health Scoring</h3>
              <p className="text-sm text-gray-600">
                Nutritional analysis with health benefits and concerns identification
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🌱</div>
              <h3 className="font-semibold mb-2">Unified Sustainability</h3>
              <p className="text-sm text-gray-600">
                Combined health and environmental impact scoring for better decisions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 System Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Enhanced Eco-Scoring Algorithm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Comprehensive Food Analyzer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Unified AI Analysis Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Gemini API Integration (Fallback Ready)</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 The system automatically falls back to heuristic analysis if AI services are unavailable, 
              ensuring consistent functionality while preserving all existing features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisDemo;
