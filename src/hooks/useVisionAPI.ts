import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VisionAnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useVisionAPI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeImage = async (image: string, type: 'base64' | 'url' = 'base64'): Promise<VisionAnalysisResult | null> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vision-analysis', {
        body: { image, type }
      });

      if (error) {
        console.error('Vision analysis error:', error);
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze the image. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data?.success || !data?.data) {
        toast({
          title: "Analysis Failed",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Product Detected!",
        description: `Found: ${data.data?.product_name || 'Product'}`,
      });

      return data.data;
    } catch (error) {
      console.error('Vision API error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeImage,
    isAnalyzing
  };
};