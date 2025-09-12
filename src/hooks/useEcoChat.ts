import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useEcoChat = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const sendMessage = async (
    message: string, 
    context?: string, 
    productContext?: any
  ): Promise<string | null> => {
    setIsTyping(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message, 
          context,
          history: messages.slice(-10), // Last 10 messages for context
          product_context: productContext
        }
      });

      if (error) {
        console.error('Chat error:', error);
        toast({
          title: "Chat Error",
          description: "Failed to get response. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data?.success) {
        toast({
          title: "Chat Error",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.data.message,
        timestamp: data.data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      return data.data.message;
    } catch (error) {
      console.error('Chat API error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages
  };
};