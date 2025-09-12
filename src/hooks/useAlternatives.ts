import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alternative } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const generateMockAlternatives = (productData: any): Alternative[] => {
  const category = productData.category?.toLowerCase() || 'general';
  const productName = productData.product_name || 'Product';
  
  const alternatives: Alternative[] = [];
  const alternativeNames = [
    `Eco ${productName.split(' ')[0]} Alternative`,
    `Sustainable ${productName.split(' ')[0]}`,
    `Green ${productName.split(' ')[0]} Option`,
    `Organic ${productName.split(' ')[0]}`
  ];
  
  const brands = ['EcoChoice', 'GreenLife', 'NaturePlus', 'SustainableBrand'];
  const reasons = [
    'Made from recycled materials',
    '50% less carbon footprint',
    'Biodegradable packaging',
    'Certified organic ingredients',
    'Local production reduces transport emissions',
    'Fair trade certified'
  ];
  
  for (let i = 0; i < Math.min(3, alternativeNames.length); i++) {
    alternatives.push({
      id: `alt-${Date.now()}-${i}`,
      name: alternativeNames[i],
      brand: brands[i % brands.length],
  image_url: '/placeholder.svg',
      eco_score: Math.floor(Math.random() * 20) + 75, // 75-95 range
      price: Math.floor(Math.random() * 50) + 10,
      savings_percentage: Math.floor(Math.random() * 30) + 10,
      carbon_footprint: Math.floor(Math.random() * 50) + 10,
      reasons: reasons.slice(i * 2, i * 2 + 2),
      badges: ['Eco-Friendly', 'Sustainable', 'Certified'][Math.floor(Math.random() * 3)] ? 
        [['Eco-Friendly', 'Sustainable', 'Certified'][Math.floor(Math.random() * 3)]] : [],
      metadata: {
        category: productData.category || 'General',
        confidence: 0.85 + Math.random() * 0.1
      }
    });
  }
  
  return alternatives;
};

export const useAlternatives = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateAlternatives = async (productData: {
    product_name: string;
    brand?: string;
    category?: string;
    eco_score?: number;
    price_range?: 'budget' | 'mid' | 'premium';
  }): Promise<Alternative[]> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('alternatives', {
        body: productData
      });

      if (!error && data?.success && data.data.length > 0) {
        setIsGenerating(false);
        toast({
          title: "Alternatives Found!",
          description: `Found ${data.data.length} eco-friendly alternatives`,
        });
        return data.data;
      }

      // Fallback to mock alternatives
      const mockAlternatives = generateMockAlternatives(productData);
      
      setIsGenerating(false);
      toast({
        title: "Alternatives Generated",
        description: `Found ${mockAlternatives.length} eco-friendly alternatives (Demo Mode)`,
      });
      
      return mockAlternatives;

    } catch (error) {
      console.error('Alternatives generation error:', error);
      
      // Always provide fallback alternatives
      const mockAlternatives = generateMockAlternatives(productData);
      
      setIsGenerating(false);
      toast({
        title: "Demo Alternatives",
        description: `Showing ${mockAlternatives.length} sample alternatives`,
      });
      
      return mockAlternatives;
    }
  };

  return {
    generateAlternatives,
    isGenerating
  };
};