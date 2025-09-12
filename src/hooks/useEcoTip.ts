import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EcoTip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useEcoTip = () => {
  const [tip, setTip] = useState<EcoTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getTipOfTheDay = async (
    category?: string, 
    difficulty?: string
  ): Promise<EcoTip | null> => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      
      const { data, error } = await supabase.functions.invoke('eco-tip', {
        body: {}
      });

      if (error) {
        console.error('Eco tip error:', error);
        toast({
          title: "Failed to Load Tip",
          description: "Could not fetch today's eco tip.",
          variant: "destructive",
        });
        return null;
      }

      if (!data?.success) {
        toast({
          title: "Failed to Load Tip",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      }

      setTip(data.data);
      return data.data;
    } catch (error) {
      console.error('Eco tip API error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load tip of the day on mount
  useEffect(() => {
    getTipOfTheDay();
  }, []);

  return {
    tip,
    isLoading,
    getTipOfTheDay
  };
};