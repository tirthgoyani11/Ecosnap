import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DisplayText,
  TitleText,
  HeadingText,
  BodyText,
  CaptionText,
  EnhancedCard,
  EnhancedButton,
  EnhancedBadge,
  EcoScoreDisplay,
  StarRating,
  Notification,
  FeatureHighlight
} from './ui/EnhancedComponents';
import { EnhancedThemeToggle } from './EnhancedThemeProvider';
import { cn, themeClasses, responsiveUtils } from '../lib/utils';
import { 
  Leaf, 
  Zap, 
  Award, 
  BarChart3, 
  Globe, 
  Heart,
  Star,
  ShoppingCart
} from 'lucide-react';

export const ComponentDemo = () => {
  const [rating, setRating] = useState(4);
  const [showNotification, setShowNotification] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DisplayText className="mb-2">
                EcoSnap AI - Enhanced UI Demo
              </DisplayText>
              <BodyText contrast="medium">
                Showcasing improved dark mode and mobile responsiveness
              </BodyText>
            </div>
            <EnhancedThemeToggle showLabel={true} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Notifications Demo */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Notification 
              variant="success"
              onClose={() => setShowNotification(false)}
            >
              <strong>Dark mode improvements applied!</strong> All text now has proper contrast ratios and mobile responsiveness has been enhanced.
            </Notification>
          </motion.div>
        )}

        {/* Typography Demo */}
        <EnhancedCard>
          <TitleText className="mb-6">Typography & Text Contrast</TitleText>
          
          <div className="space-y-4">
            <div>
              <CaptionText contrast="medium" className="mb-2">Display Text (High Contrast)</CaptionText>
              <DisplayText>
                The future is sustainable
              </DisplayText>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-2">Heading Text (High Contrast)</CaptionText>
              <HeadingText>
                Scan. Analyze. Choose Better.
              </HeadingText>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-2">Body Text (Medium Contrast)</CaptionText>
              <BodyText>
                This is body text that should be easily readable in both light and dark modes. 
                The enhanced contrast system ensures perfect visibility across all themes.
              </BodyText>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-2">Caption Text (Low Contrast)</CaptionText>
              <CaptionText>
                This is caption text used for less important information, timestamps, and labels.
              </CaptionText>
            </div>
          </div>
        </EnhancedCard>

        {/* Cards Demo */}
        <div>
          <TitleText className="mb-6">Enhanced Card Variants</TitleText>
          
          <div className={cn(responsiveUtils.grid.auto, 'gap-6')}>
            <EnhancedCard variant="default">
              <HeadingText className="mb-3">Default Card</HeadingText>
              <BodyText>Standard card with subtle shadow and border.</BodyText>
            </EnhancedCard>
            
            <EnhancedCard variant="elevated">
              <HeadingText className="mb-3">Elevated Card</HeadingText>
              <BodyText>Enhanced shadow with hover effects for important content.</BodyText>
            </EnhancedCard>
            
            <EnhancedCard variant="interactive" onClick={() => alert('Card clicked!')}>
              <HeadingText className="mb-3">Interactive Card</HeadingText>
              <BodyText>Clickable card with hover and tap animations.</BodyText>
            </EnhancedCard>
            
            <EnhancedCard variant="outlined">
              <HeadingText className="mb-3">Outlined Card</HeadingText>
              <BodyText>Transparent background with prominent border.</BodyText>
            </EnhancedCard>
          </div>
        </div>

        {/* Buttons Demo */}
        <EnhancedCard>
          <TitleText className="mb-6">Enhanced Button System</TitleText>
          
          <div className="space-y-6">
            <div>
              <CaptionText contrast="medium" className="mb-3">Button Variants</CaptionText>
              <div className="flex flex-wrap gap-3">
                <EnhancedButton variant="primary">Primary</EnhancedButton>
                <EnhancedButton variant="secondary">Secondary</EnhancedButton>
                <EnhancedButton variant="outline">Outline</EnhancedButton>
                <EnhancedButton variant="ghost">Ghost</EnhancedButton>
                <EnhancedButton variant="destructive">Destructive</EnhancedButton>
              </div>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-3">Button Sizes</CaptionText>
              <div className="flex flex-wrap items-center gap-3">
                <EnhancedButton size="sm">Small</EnhancedButton>
                <EnhancedButton size="md">Medium</EnhancedButton>
                <EnhancedButton size="lg">Large</EnhancedButton>
              </div>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-3">Button States</CaptionText>
              <div className="flex flex-wrap gap-3">
                <EnhancedButton loading>Loading</EnhancedButton>
                <EnhancedButton disabled>Disabled</EnhancedButton>
                <EnhancedButton fullWidth>Full Width</EnhancedButton>
              </div>
            </div>
          </div>
        </EnhancedCard>

        {/* Badges Demo */}
        <EnhancedCard>
          <TitleText className="mb-6">Enhanced Badges</TitleText>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <EnhancedBadge variant="default">Default</EnhancedBadge>
              <EnhancedBadge variant="secondary">Secondary</EnhancedBadge>
              <EnhancedBadge variant="outline">Outline</EnhancedBadge>
              <EnhancedBadge variant="success">Success</EnhancedBadge>
              <EnhancedBadge variant="warning">Warning</EnhancedBadge>
              <EnhancedBadge variant="error">Error</EnhancedBadge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <EnhancedBadge size="sm">Small</EnhancedBadge>
              <EnhancedBadge size="md">Medium</EnhancedBadge>
              <EnhancedBadge size="lg">Large</EnhancedBadge>
            </div>
          </div>
        </EnhancedCard>

        {/* Eco Components Demo */}
        <EnhancedCard>
          <TitleText className="mb-6">EcoSnap Specific Components</TitleText>
          
          <div className="space-y-6">
            <div>
              <CaptionText contrast="medium" className="mb-3">Eco Score Displays</CaptionText>
              <div className="flex flex-wrap items-center gap-6">
                <EcoScoreDisplay score={92} size="sm" />
                <EcoScoreDisplay score={75} size="md" />
                <EcoScoreDisplay score={45} size="lg" />
              </div>
            </div>
            
            <div>
              <CaptionText contrast="medium" className="mb-3">Star Ratings</CaptionText>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <StarRating rating={4.5} size="sm" />
                  <CaptionText>4.5 out of 5</CaptionText>
                </div>
                <div className="flex items-center space-x-4">
                  <StarRating rating={rating} size="md" interactive onRatingChange={setRating} />
                  <CaptionText>Interactive rating: {rating}</CaptionText>
                </div>
                <div className="flex items-center space-x-4">
                  <StarRating rating={3.5} size="lg" />
                  <CaptionText>Large size rating</CaptionText>
                </div>
              </div>
            </div>
          </div>
        </EnhancedCard>

        {/* Feature Highlights Demo */}
        <div>
          <TitleText className="mb-6 text-center">Feature Highlights</TitleText>
          
          <div className={cn(responsiveUtils.grid.auto, 'gap-6')}>
            <FeatureHighlight
              icon={<Zap className="h-6 w-6" />}
              title="Smart Scanning"
              description="AI-powered product analysis with instant sustainability insights"
            />
            <FeatureHighlight
              icon={<BarChart3 className="h-6 w-6" />}
              title="Product Comparison"
              description="Compare alternatives and make better environmental choices"
            />
            <FeatureHighlight
              icon={<Award className="h-6 w-6" />}
              title="Eco Achievements"
              description="Earn badges and track your environmental impact journey"
            />
            <FeatureHighlight
              icon={<Globe className="h-6 w-6" />}
              title="Global Impact"
              description="See your contribution to worldwide sustainability efforts"
            />
          </div>
        </div>

        {/* Mobile Product Card Demo */}
        <EnhancedCard>
          <TitleText className="mb-6">Mobile Product Card Example</TitleText>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border border-border overflow-hidden max-w-sm mx-auto"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 flex items-center justify-center">
                <Leaf className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              {/* Product Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <HeadingText className="text-base leading-tight">
                      Eco-Friendly Bamboo Toothbrush
                    </HeadingText>
                    <CaptionText contrast="medium" className="mt-1">
                      Sustainable Oral Care
                    </CaptionText>
                  </div>
                  <EcoScoreDisplay score={88} size="sm" showLabel={false} />
                </div>
                
                <div className="flex items-center space-x-3">
                  <StarRating rating={4.5} size="sm" />
                  <CaptionText>(127 reviews)</CaptionText>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <BodyText className="font-semibold">$12.99</BodyText>
                    <CaptionText className="line-through">$15.99</CaptionText>
                  </div>
                  <EnhancedBadge variant="success" size="sm">
                    19% off
                  </EnhancedBadge>
                </div>
                
                <div className="flex space-x-2">
                  <EnhancedButton size="sm" fullWidth>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </EnhancedButton>
                  <EnhancedButton variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          </div>
        </EnhancedCard>

        {/* Footer */}
        <div className="text-center py-8">
          <BodyText contrast="medium">
            🌱 All components are now optimized for dark mode and mobile devices! 🌱
          </BodyText>
          <CaptionText contrast="low" className="mt-2">
            Switch themes using the toggle above to see the improvements
          </CaptionText>
        </div>
      </div>
    </div>
  );
};