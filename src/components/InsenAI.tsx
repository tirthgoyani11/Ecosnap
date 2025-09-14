import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Sparkles, 
  Brain, 
  BarChart3, 
  Eye, 
  MessageCircle,
  Leaf,
  Recycle,
  Zap,
  Globe,
  ChevronRight,
  Star
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Types for Insen AI
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  responseType?: 'text' | 'eco_comparison' | 'data_table' | 'visual_mock';
  data?: any;
  suggestions?: string[];
}

interface InsenAIProps {
  isOpen: boolean;
  onClose: () => void;
  productContext?: any; // From EcoSnap scanner
  userContext?: any; // From user profile/leaderboard
}

// Main Insen AI Chatbot Component
export const InsenAI: React.FC<InsenAIProps> = ({ 
  isOpen, 
  onClose, 
  productContext, 
  userContext 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState<'text' | 'data' | 'visual'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'ai',
        content: `🌟 Hello! I'm Insen AI, your eco-smart assistant. I can help you:\n\n• 🔍 Compare eco-friendly products\n• 📊 Analyze your carbon footprint\n• ♻️ Find sustainable alternatives\n• 🌱 Track your eco-journey\n\nWhat would you like to explore today?`,
        timestamp: new Date(),
        suggestions: [
          '🔍 Compare Products',
          '📊 Show My Eco Stats',
          '🌱 Find Alternatives',
          '⚡ Carbon Calculator'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual Gemini API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, productContext, userContext);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Generate AI response (placeholder - will be replaced with Gemini API)
  const generateAIResponse = (userInput: string, productCtx?: any, userCtx?: any): ChatMessage => {
    const lowerInput = userInput.toLowerCase();

    // Eco comparison response
    if (lowerInput.includes('compare') || lowerInput.includes('alternative')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '🔍 Here\'s an eco-friendly comparison based on your request:',
        timestamp: new Date(),
        responseType: 'eco_comparison',
        data: {
          products: [
            {
              name: 'Organic Option 🌿',
              eco_score: 'A+',
              carbon_footprint: '1.2 kg CO₂',
              packaging: 'Biodegradable',
              sustainability: 'Excellent'
            },
            {
              name: 'Standard Option',
              eco_score: 'C',
              carbon_footprint: '3.1 kg CO₂',
              packaging: 'Plastic',
              sustainability: 'Fair'
            }
          ],
          insights: [
            '📉 60% lower carbon footprint',
            '♻️ Sustainable packaging',
            '🌱 Supports organic farming'
          ]
        },
        suggestions: [
          '🛒 Where to Buy',
          '💰 Price Comparison',
          '🌍 Environmental Impact',
          '⭐ User Reviews'
        ]
      };
    }

    // Stats response
    if (lowerInput.includes('stats') || lowerInput.includes('footprint') || lowerInput.includes('carbon')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '📊 Your current eco-impact analysis:',
        timestamp: new Date(),
        responseType: 'data_table',
        data: {
          stats: {
            total_scans: userCtx?.total_scans || 42,
            carbon_saved: '127.5 kg CO₂',
            eco_score: userCtx?.achievement_level || 'Expert',
            rank: userCtx?.current_rank || 15
          },
          progress: [
            { metric: 'Eco Scans', value: 85, max: 100 },
            { metric: 'Carbon Savings', value: 72, max: 100 },
            { metric: 'Sustainable Choices', value: 91, max: 100 }
          ]
        },
        suggestions: [
          '🎯 Set New Goals',
          '🏆 View Achievements',
          '📈 Monthly Report',
          '🌱 Improvement Tips'
        ]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: `✨ I understand you're asking about "${userInput}". As your eco-smart assistant, I can help you make more sustainable choices!\n\n🌱 Based on your EcoSnap journey, I see you're already making great progress. Would you like me to analyze a specific product or help you discover eco-friendly alternatives?`,
      timestamp: new Date(),
      suggestions: [
        '🔍 Scan New Product',
        '📊 View Eco Dashboard',
        '🎯 Set Sustainability Goals',
        '💡 Get Eco Tips'
      ]
    };
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-4 z-50 md:inset-auto md:right-6 md:bottom-6 md:w-96 md:h-[600px]"
    >
      {/* Glassmorphic Chat Container */}
      <div className="h-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-800">Insen AI</h3>
                <p className="text-xs text-gray-600">Eco-Smart Assistant</p>
              </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-white/50 rounded-lg p-1">
                <button
                  onClick={() => setCurrentMode('text')}
                  className={`p-1.5 rounded ${currentMode === 'text' ? 'bg-white shadow-sm' : ''}`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMode('data')}
                  className={`p-1.5 rounded ${currentMode === 'data' ? 'bg-white shadow-sm' : ''}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMode('visual')}
                  className={`p-1.5 rounded ${currentMode === 'visual' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'user' ? (
                <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%] shadow-lg">
                  {message.content}
                </div>
              ) : (
                <div className="max-w-[85%]">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-white/20">
                    <div className="whitespace-pre-wrap text-gray-800">{message.content}</div>
                    
                    {/* Render special response types */}
                    {message.responseType === 'eco_comparison' && message.data && (
                      <EcoComparisonView data={message.data} mode={currentMode} />
                    )}
                    
                    {message.responseType === 'data_table' && message.data && (
                      <DataTableView data={message.data} mode={currentMode} />
                    )}
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 text-gray-700 px-3 py-1.5 rounded-full text-sm transition-all duration-200 border border-white/30 backdrop-blur-sm"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-white/20">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-white/50 backdrop-blur-sm">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Ask Insen AI anything..."
              className="flex-1 bg-white/80 border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 backdrop-blur-sm"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl px-4 py-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Eco Comparison View Component
const EcoComparisonView: React.FC<{ data: any; mode: string }> = ({ data, mode }) => {
  if (mode === 'visual') {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.products.map((product: any, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-3 border border-green-200"
          >
            <h4 className="font-semibold text-sm text-gray-800">{product.name}</h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Eco Score:</span>
                <Badge className={index === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                  {product.eco_score}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">{product.carbon_footprint}</div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (mode === 'data') {
    return (
      <div className="mt-4 bg-gray-50 rounded-xl p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-600">
              <th className="text-left">Product</th>
              <th className="text-left">Score</th>
              <th className="text-left">Carbon</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((product: any, index: number) => (
              <tr key={index}>
                <td className="py-1">{product.name}</td>
                <td className="py-1">{product.eco_score}</td>
                <td className="py-1">{product.carbon_footprint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {data.insights.map((insight: string, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>{insight}</span>
        </div>
      ))}
    </div>
  );
};

// Data Table View Component
const DataTableView: React.FC<{ data: any; mode: string }> = ({ data, mode }) => {
  if (mode === 'visual') {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{data.stats.total_scans}</div>
          <div className="text-xs text-gray-600">Total Scans</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.stats.carbon_saved}</div>
          <div className="text-xs text-gray-600">CO₂ Saved</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {data.progress.map((item: any, index: number) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{item.metric}</span>
            <span>{item.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.value}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsenAI;